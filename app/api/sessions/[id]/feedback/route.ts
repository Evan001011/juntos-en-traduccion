import { NextResponse, type NextRequest } from "next/server";
import { apiUser } from "@/lib/auth";
import { batch } from "@/lib/db";
import { getPerson, getSession } from "@/lib/data";
import { SKILLS } from "@/lib/constants";
import { notifyGoogleChat } from "@/lib/google";
import { formatDateTime } from "@/lib/time";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await apiUser(["volunteer"]);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const sessionId = Number(id);
  const session = await getSession(sessionId);
  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  if (session.volunteer_id !== auth.user.id) return NextResponse.json({ error: "This is not your session." }, { status: 403 });
  if (session.has_feedback) return NextResponse.json({ error: "Feedback is already logged for this session." }, { status: 409 });

  let body: {
    summary?: unknown;
    homework?: unknown;
    scores?: Array<{ skill?: unknown; score?: unknown }>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const summary = typeof body.summary === "string" ? body.summary.trim().slice(0, 2000) : "";
  if (summary.length < 10) return NextResponse.json({ error: "Add a short session summary (at least 10 characters)." }, { status: 400 });
  const homework = typeof body.homework === "string" ? body.homework.trim().slice(0, 500) : "";
  const scores = (Array.isArray(body.scores) ? body.scores : [])
    .map((row) => ({ skill: String(row.skill || ""), score: Number(row.score) }))
    .filter((row) => (SKILLS as readonly string[]).includes(row.skill) && Number.isInteger(row.score) && row.score >= 1 && row.score <= 5)
    .slice(0, 6);

  if (scores.length === 0) return NextResponse.json({ error: "Rate at least one skill so the learning plan can update." }, { status: 400 });

  const student = await getPerson(session.student_id);
  await batch([
    {
      sql: "INSERT INTO feedback (session_id, volunteer_id, student_id, summary, homework) VALUES (?, ?, ?, ?, ?)",
      params: [sessionId, auth.user.id, session.student_id, summary, homework || null],
    },
    ...scores.map((score) => ({
      sql: "INSERT INTO skill_scores (feedback_id, student_id, skill, score) SELECT id, ?, ?, ? FROM feedback WHERE session_id = ?",
      params: [session.student_id, score.skill, score.score, sessionId],
    })),
    {
      sql: "UPDATE sessions SET status = 'completed', completed_at = datetime('now') WHERE id = ?",
      params: [sessionId],
    },
    {
      sql: "INSERT INTO audit_log (actor_id, action, detail) VALUES (?, 'feedback_logged', ?)",
      params: [
        auth.user.id,
        `${auth.user.name} logged feedback for ${student?.name || "a student"} — ${scores.map((s) => `${s.skill}: ${s.score}/5`).join(", ")}.`,
      ],
    },
  ]);

  void notifyGoogleChat(
    `Session completed: ${auth.user.name} + ${student?.name || "student"} (${session.subject}, ${formatDateTime(session.scheduled_at)}). Skills: ${scores
      .map((score) => `${score.skill} ${score.score}/5`)
      .join(" · ")}`,
  );

  return NextResponse.json({ ok: true });
}
