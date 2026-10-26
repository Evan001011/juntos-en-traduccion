import { createClient, type Client, type InStatement } from "@libsql/client";
import { SCHEMA } from "./schema";
import { seedDatabase } from "./seed";

/**
 * Database access for the app.
 *
 * If `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` are configured, every deployment
 * talks to one shared hosted SQLite (libSQL) database, so preview and production
 * see the same rows. Without those variables it falls back to the Cloudflare D1
 * binding, keeping an environment usable while shared credentials are missing.
 *
 * `prepare(sql)` returns a statement object synchronously while
 * `all`/`get`/`run` return promises, which keeps call sites close to SQL.
 * Named placeholders (`@name`) are rewritten to positional `?` markers.
 */

type SqlValue = string | number | null;

export type RunResult = { changes: number; lastInsertRowid: number };

export type SqlStatement = {
  all<T = Record<string, unknown>>(...params: unknown[]): Promise<T[]>;
  get<T = Record<string, unknown>>(...params: unknown[]): Promise<T | undefined>;
  run(...params: unknown[]): Promise<RunResult>;
};

export type SqlDb = { prepare(sql: string): SqlStatement };

export type BatchStatement = { sql: string; params?: unknown[] };

type RawResult = {
  rows: Array<Record<string, unknown>>;
  changes: number;
  lastInsertRowid: number;
};

type QueryStatement = { sql: string; args: SqlValue[] };

type Executor = {
  label: string;
  execute(statement: QueryStatement): Promise<RawResult>;
  batch(statements: QueryStatement[]): Promise<RawResult[]>;
};

type D1Meta = { changes?: number; last_row_id?: number | string };

type D1Statement = {
  bind(...values: SqlValue[]): D1Statement;
  all<T = Record<string, unknown>>(): Promise<{ results?: T[]; meta?: D1Meta }>;
  run(): Promise<{ meta?: D1Meta }>;
};

type D1Like = {
  prepare(sql: string): D1Statement;
  batch(statements: D1Statement[]): Promise<Array<{ results?: unknown[]; meta?: D1Meta }>>;
};

function toSqlValue(value: unknown): SqlValue {
  if (value === undefined || value === null) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "bigint") return Number(value);
  return String(value);
}

function isNamedParams(params: unknown[]): params is [Record<string, unknown>] {
  if (params.length !== 1) return false;
  const [first] = params;
  return first !== null && typeof first === "object" && !Array.isArray(first) && !(first instanceof Date);
}

function buildStatement(sql: string, params: unknown[]): QueryStatement {
  if (isNamedParams(params)) {
    const record = params[0];
    const args: SqlValue[] = [];
    const text = sql.replace(/@([A-Za-z_][A-Za-z0-9_]*)/g, (_match, name: string) => {
      args.push(toSqlValue(record[name]));
      return "?";
    });
    return { sql: text, args };
  }
  return { sql, args: params.map(toSqlValue) };
}

function isReadStatement(sql: string): boolean {
  return /^\s*(select|with|pragma|explain)\b/i.test(sql);
}

// ---------------------------------------------------------------- libSQL/Turso

function libsqlExecutor(client: Client): Executor {
  const toRaw = (result: {
    rows: unknown[];
    rowsAffected?: number | bigint;
    lastInsertRowid?: number | bigint;
  }): RawResult => ({
    rows: result.rows as Array<Record<string, unknown>>,
    changes: Number(result.rowsAffected ?? 0),
    lastInsertRowid: Number(result.lastInsertRowid ?? 0),
  });

  return {
    label: "libsql",
    async execute(statement) {
      return toRaw(await client.execute(statement as InStatement));
    },
    async batch(statements) {
      if (statements.length === 0) return [];
      const results = await client.batch(statements as InStatement[], "write");
      return results.map(toRaw);
    },
  };
}

// ------------------------------------------------------------------- Cloudflare D1

function d1Executor(d1: D1Like): Executor {
  const prepare = (statement: QueryStatement): D1Statement => {
    const bound = d1.prepare(statement.sql);
    return statement.args.length ? bound.bind(...statement.args) : bound;
  };

  return {
    label: "d1",
    async execute(statement) {
      const prepared = prepare(statement);
      if (isReadStatement(statement.sql)) {
        const result = await prepared.all();
        return {
          rows: (result.results ?? []) as Array<Record<string, unknown>>,
          changes: Number(result.meta?.changes ?? 0),
          lastInsertRowid: Number(result.meta?.last_row_id ?? 0),
        };
      }
      const result = await prepared.run();
      return {
        rows: [],
        changes: Number(result.meta?.changes ?? 0),
        lastInsertRowid: Number(result.meta?.last_row_id ?? 0),
      };
    },
    async batch(statements) {
      if (statements.length === 0) return [];
      const results = await d1.batch(statements.map(prepare));
      return results.map((result) => ({
        rows: (result.results ?? []) as Array<Record<string, unknown>>,
        changes: Number(result.meta?.changes ?? 0),
        lastInsertRowid: Number(result.meta?.last_row_id ?? 0),
      }));
    },
  };
}

// -------------------------------------------------------------- backend selection

async function resolveEnv(): Promise<Record<string, string | undefined>> {
  const base = { ...(process.env as Record<string, string | undefined>) };
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return { ...base, ...(env as Record<string, string | undefined>) };
  } catch {
    // Outside the Workers runtime (scripts, tests) plain process.env is enough.
    return base;
  }
}

async function createExecutor(): Promise<Executor> {
  const env = await resolveEnv();
  const rawUrl = env.TURSO_DATABASE_URL?.trim();
  const authToken = env.TURSO_AUTH_TOKEN?.trim();

  if (rawUrl) {
    // The HTTP client speaks https://; Turso hands out libsql:// URLs.
    const url = rawUrl.startsWith("libsql://") ? `https://${rawUrl.slice("libsql://".length)}` : rawUrl;
    return libsqlExecutor(createClient({ url, authToken }));
  }

  const d1 = (env as { DB?: D1Like }).DB;
  if (d1) {
    console.warn("[db] TURSO_DATABASE_URL is not set — using this environment's D1 database instead of the shared one.");
    return d1Executor(d1);
  }

  throw new Error(
    "No database configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN secrets, or attach a D1 database bound as DB.",
  );
}

let executorPromise: Promise<Executor> | null = null;

function getExecutor(): Promise<Executor> {
  if (!executorPromise) {
    executorPromise = createExecutor().catch((error) => {
      executorPromise = null;
      throw error;
    });
  }
  return executorPromise;
}

/** The DB store in use, for diagnostics. */
export async function databaseBackend(): Promise<string> {
  return (await getExecutor()).label;
}

// ------------------------------------------------------------------ schema + seed

/**
 * Both backends run one statement per call, so the schema is split into single
 * statements and sent as one write batch.
 */
function splitSql(script: string): string[] {
  return script
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
}

const SCHEMA_STATEMENTS = splitSql(SCHEMA.replace(/^\s*PRAGMA[^;]*;/gim, ""));

const TABLES = [
  "worksheet_answers",
  "worksheet_assignments",
  "worksheet_questions",
  "worksheets",
  "session_chat",
  "module_attempts",
  "learning_modules",
  "lesson_plans",
  "feedback",
  "skill_scores",
  "sessions",
  "availability",
  "auth_sessions",
  "user_subjects",
  "messages",
  "audit_log",
  "users",
  "app_meta",
];

let initState: "idle" | "running" | "ready" = "idle";
let initPromise: Promise<void> | null = null;

async function initialize(executor: Executor): Promise<void> {
  await executor.batch([
    ...SCHEMA_STATEMENTS.map((sql) => ({ sql, args: [] })),
    { sql: "CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)", args: [] },
  ]);

  const done = await executor.execute({ sql: "SELECT value FROM app_meta WHERE key = 'seeded'", args: [] });
  if (done.rows.length > 0) return;

  // Claim the seed atomically so parallel isolates do not double-seed.
  const claim = await executor.execute({
    sql: "INSERT OR IGNORE INTO app_meta (key, value) VALUES ('seed_lock', datetime('now'))",
    args: [],
  });
  if (claim.changes === 0) return;

  try {
    const wipe = TABLES.filter((table) => table !== "app_meta").map((table) => ({ sql: `DELETE FROM ${table}`, args: [] }));
    if (wipe.length) await executor.batch(wipe);
    await seedDatabase(createSqlDb(executor));
    await executor.execute({ sql: "INSERT OR REPLACE INTO app_meta (key, value) VALUES ('seeded', datetime('now'))", args: [] });
  } catch (error) {
    await executor.execute({ sql: "DELETE FROM app_meta WHERE key = 'seed_lock'", args: [] });
    throw error;
  } finally {
    await executor.execute({ sql: "DELETE FROM app_meta WHERE key = 'seed_lock'", args: [] });
  }
}

function ensureReady(executor: Executor): Promise<void> {
  if (initState === "ready") return Promise.resolve();
  if (initState === "running" && initPromise) return initPromise;
  initState = "running";
  initPromise = initialize(executor).then(
    () => {
      initState = "ready";
    },
    (error) => {
      initState = "idle";
      initPromise = null;
      throw error;
    },
  );
  return initPromise;
}

// ------------------------------------------------------------------------ facade

/** A statement factory bound to one backend. */
function createSqlDb(executor: Executor): SqlDb {
  return {
    prepare(sql: string): SqlStatement {
      return {
        async all<T>(...params: unknown[]): Promise<T[]> {
          const result = await executor.execute(buildStatement(sql, params));
          return result.rows as unknown as T[];
        },
        async get<T>(...params: unknown[]): Promise<T | undefined> {
          const result = await executor.execute(buildStatement(sql, params));
          return (result.rows[0] as unknown as T) ?? undefined;
        },
        async run(...params: unknown[]): Promise<RunResult> {
          const result = await executor.execute(buildStatement(sql, params));
          return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };
        },
      };
    },
  };
}

async function readyDb(): Promise<SqlDb> {
  const executor = await getExecutor();
  await ensureReady(executor);
  return createSqlDb(executor);
}

export const db: SqlDb = {
  prepare(sql: string): SqlStatement {
    const run = () => readyDb();
    return {
      async all<T>(...params: unknown[]): Promise<T[]> {
        return (await run()).prepare(sql).all<T>(...params);
      },
      async get<T>(...params: unknown[]): Promise<T | undefined> {
        return (await run()).prepare(sql).get<T>(...params);
      },
      async run(...params: unknown[]): Promise<RunResult> {
        return (await run()).prepare(sql).run(...params);
      },
    };
  },
};

/**
 * Runs several statements as one atomic batch. Batch results mirror `run()`
 * so callers can read inserted row ids.
 */
export async function batch(statements: BatchStatement[]): Promise<RunResult[]> {
  if (statements.length === 0) return [];
  const executor = await getExecutor();
  await ensureReady(executor);
  const results = await executor.batch(statements.map((statement) => buildStatement(statement.sql, statement.params ?? [])));
  return results.map((result) => ({ changes: result.changes, lastInsertRowid: result.lastInsertRowid }));
}
