import { NextResponse, type NextRequest } from "next/server";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const auth = await apiUser(["admin"]);
  if ("error" in auth) return auth.error;

  let body: { messageId?: unknown; action?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const messageId = Number(body.messageId);
  const action = body.action === "delete" ? "delete" : body.action === "dismiss" ? "dismiss" : "";

  const message = (await db
    .prepare(
      `SELECT m.id, m.body, m.flagged, m.flag_reason, s.name AS sender_name, r.name AS recipient_name
       FROM messages m JOIN users s ON s.id = m.sender_id JOIN users r ON r.id = m.recipient_id
       WHERE m.id = ?`,
    )
    .get(messageId)) as
    | { id: number; body: string; flagged: number; flag_reason: string | null; sender_name: string; recipient_name: string }
    | undefined;
  if (!message) return NextResponse.json({ error: "Message not found." }, { status: 404 });
  if (!message.flagged) return NextResponse.json({ error: "That message is no longer in the safety queue." }, { status: 409 });
  if (!action) return NextResponse.json({ error: "Choose dismiss or delete." }, { status: 400 });

  if (action === "delete") {
    await db.prepare("DELETE FROM messages WHERE id = ?").run(messageId);
    await db.prepare("INSERT INTO audit_log (actor_id, action, detail) VALUES (?, 'message_deleted', ?)").run(
      auth.user.id,
      `${auth.user.name} deleted a flagged message from ${message.sender_name} to ${message.recipient_name} (${message.flag_reason || "contact info"}).`,
    );
  } else {
    await db.prepare("UPDATE messages SET flagged = 0, flag_reason = NULL WHERE id = ?").run(messageId);
    await db.prepare("INSERT INTO audit_log (actor_id, action, detail) VALUES (?, 'flag_reviewed', ?)").run(
      auth.user.id,
      `${auth.user.name} reviewed and cleared a flag on a message from ${message.sender_name} to ${message.recipient_name}.`,
    );
  }

  return NextResponse.json({ ok: true, action });
}
