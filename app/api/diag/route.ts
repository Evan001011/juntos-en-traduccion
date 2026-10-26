import { NextResponse } from "next/server";
import { databaseBackend } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Temporary deployment diagnostics. Reports presence and names only, never secret values. */
export async function GET() {
  let cloudflareEnv: Record<string, unknown> = {};
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const context = await getCloudflareContext({ async: true });
    cloudflareEnv = context.env as unknown as Record<string, unknown>;
  } catch {
    cloudflareEnv = {};
  }

  const fromEnv = (name: string) => String(cloudflareEnv[name] ?? process.env[name] ?? "");
  const url = fromEnv("TURSO_DATABASE_URL");
  const token = fromEnv("TURSO_AUTH_TOKEN");

  let backend = "unknown";
  let error: string | null = null;
  try {
    backend = await databaseBackend();
  } catch (cause) {
    error = cause instanceof Error ? cause.name : "error";
  }

  return NextResponse.json({
    hasUrl: Boolean(url),
    hasToken: Boolean(token),
    backend,
    error,
    envKeys: Object.keys(cloudflareEnv).sort(),
    processEnvKeys: Object.keys(process.env)
      .filter((key) => key.startsWith("TURSO"))
      .sort(),
  });
}
