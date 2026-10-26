import { NextResponse, type NextRequest } from "next/server";
import { apiUser, type AppUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSession, getSessionChat } from "@/lib/data";
import { scrubContactInfo } from "@/lib/safety";
import { notifyGoogleChat } from "@/lib/google";

function canAccess(user: AppUser, studentId: number, volunteerId: number) {
  return user.role === "admin" || user.id === studentId || user.id === volunteerId;
}

async function loadSession(id: string, user: AppUser) {
  const sessionId = Number(id);
  const session = await getSession(sessionId);
  if (!session) return { error: NextResponse.json({ error: "Session not found." }, { status: 404 }) };
  if (!canAccess(user, session.student_id, session.volunteer_id)) {
    return { error: NextResponse.json({ error: "You do not have access to this room." }, { status: 403 }) };
  }
  return { session };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await apiUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const loaded = await loadSession(id, auth.user);
  if ("error" in loaded) return loaded.error;
  return NextResponse.json({ messages: await getSessionChat(loaded.session.id), me: auth.user.id });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await apiUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const loaded = await loadSession(id, auth.user);
  if ("error" in loaded) return loaded.error;
  if (loaded.session.status === "cancelled") return NextResponse.json({ error: "This session was cancelled." }, { status: 400 });

  let body: { body?: unknown; translatedBody?: unknown; translatedLang?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const text = typeof body.body === "string" ? body.body.trim().slice(0, 700) : "";
  if (!text) return NextResponse.json({ error: "Write a message first." }, { status: 400 });

  const scrub = scrubContactInfo(text);
  if (!scrub.text) return NextResponse.json({ error: "Contact information is blocked in the session room." }, { status: 400 });

  let translated: string | null = null;
  if (typeof body.translatedBody === "string" && body.translatedBody.trim()) {
    translated = scrubContactInfo(body.translatedBody.trim().slice(0, 700)).text || null;
  }
  const translatedLang = body.translatedLang === "es" ? "es" : body.translatedLang === "en" ? "en" : null;

  const result = await db
    .prepare(
      "INSERT INTO session_chat (session_id, sender_id, body, translated_body, translated_lang) VALUES (?, ?, ?, ?, ?)",
    )
    .run(loaded.session.id, auth.user.id, scrub.text, translated, translatedLang);

  if (scrub.flagged) {
    await db.prepare("INSERT INTO audit_log (actor_id, action, detail) VALUES (?, 'flagged_chat', ?)").run(
      auth.user.id,
      `${auth.user.name} posted contact info in session #${loaded.session.id}: ${scrub.reasons.join(", ")}.`,
    );
    void notifyGoogleChat(`🛡️ Contact information blocked in session room #${loaded.session.id} (${auth.user.name}).`);
  }

  return NextResponse.json({ ok: true, id: Number(result.lastInsertRowid), flagged: scrub.flagged });
}
