import { NextResponse, type NextRequest } from "next/server";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getContacts, getPerson, getThread, markThreadRead } from "@/lib/data";
import { scrubContactInfo } from "@/lib/safety";
import { notifyGoogleChat } from "@/lib/google";

export async function GET(request: NextRequest) {
  const auth = await apiUser();
  if ("error" in auth) return auth.error;
  const otherId = Number(new URL(request.url).searchParams.get("with"));
  if (!Number.isInteger(otherId)) return NextResponse.json({ error: "Choose a conversation." }, { status: 400 });

  const allowed = (await getContacts(auth.user)).some((contact) => contact.id === otherId);
  if (!allowed) return NextResponse.json({ error: "You can only message your matched tutors, students or the safety team." }, { status: 403 });

  await markThreadRead(auth.user.id, otherId);
  return NextResponse.json({ messages: await getThread(auth.user.id, otherId), other: await getPerson(otherId) });
}

export async function POST(request: NextRequest) {
  const auth = await apiUser();
  if ("error" in auth) return auth.error;

  let body: { to?: unknown; body?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const to = Number(body.to);
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!Number.isInteger(to) || to === auth.user.id) return NextResponse.json({ error: "Choose a valid recipient." }, { status: 400 });
  if (text.length < 1 || text.length > 1000) return NextResponse.json({ error: "Messages must be between 1 and 1000 characters." }, { status: 400 });

  const recipient = await getPerson(to);
  if (!recipient) return NextResponse.json({ error: "Recipient not found." }, { status: 404 });
  if (!(await getContacts(auth.user)).some((contact) => contact.id === to)) {
    return NextResponse.json({ error: "You can only message people connected to your tutoring plan." }, { status: 403 });
  }

  const scrub = scrubContactInfo(text);
  if (!scrub.text) return NextResponse.json({ error: "That message only contained contact information, which we block for safety." }, { status: 400 });

  const result = await db
    .prepare("INSERT INTO messages (sender_id, recipient_id, body, flagged, flag_reason) VALUES (?, ?, ?, ?, ?)")
    .run(auth.user.id, to, scrub.text, scrub.flagged ? 1 : 0, scrub.flagged ? scrub.reasons.join(", ") : null);

  if (scrub.flagged) {
    await db.prepare("INSERT INTO audit_log (actor_id, action, detail) VALUES (?, 'flagged_message', ?)").run(
      auth.user.id,
      `${auth.user.name} → ${recipient.name}: blocked ${scrub.reasons.join(", ")}. Original: "${text.slice(0, 300)}"`,
    );
    void notifyGoogleChat(
      `🛡️ Safety flag: ${auth.user.name} sent contact information (${scrub.reasons.join(", ")}) to ${recipient.name}. Review in the admin safety dashboard.`,
    );
  }

  return NextResponse.json({
    ok: true,
    id: Number(result.lastInsertRowid),
    body: scrub.text,
    flagged: scrub.flagged,
    reasons: scrub.reasons,
  });
}
