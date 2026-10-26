import { NextResponse, type NextRequest } from "next/server";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const auth = await apiUser(["student"]);
  if ("error" in auth) return auth.error;

  let body: { moduleId?: unknown; score?: unknown; total?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const moduleId = Number(body.moduleId);
  const score = Number(body.score);
  const total = Number(body.total);
  const moduleRow = (await db.prepare("SELECT id, title FROM learning_modules WHERE id = ?").get(moduleId)) as { id: number; title: string } | undefined;
  if (!moduleRow) return NextResponse.json({ error: "Deck not found." }, { status: 404 });
  if (!Number.isInteger(score) || !Number.isInteger(total) || total < 1 || total > 30 || score < 0 || score > total) {
    return NextResponse.json({ error: "Invalid score." }, { status: 400 });
  }

  const xp = 10 + score * 2;
  await db.prepare("INSERT INTO module_attempts (module_id, student_id, score, total, xp) VALUES (?, ?, ?, ?, ?)").run(
    moduleId,
    auth.user.id,
    score,
    total,
    xp,
  );
  await db.prepare("INSERT INTO audit_log (actor_id, action, detail) VALUES (?, 'module_completed', ?)").run(
    auth.user.id,
    `${auth.user.name} completed ${moduleRow.title}: ${score}/${total} (+${xp} XP).`,
  );

  return NextResponse.json({ ok: true, xp });
}
