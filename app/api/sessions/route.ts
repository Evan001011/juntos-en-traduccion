import { NextResponse, type NextRequest } from "next/server";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPerson, getSubjectList } from "@/lib/data";
import { findSlotForBooking } from "@/lib/matching";
import { notifyGoogleChat, googleMeetLink } from "@/lib/google";
import { formatDateTime } from "@/lib/time";

export async function POST(request: NextRequest) {
  const auth = await apiUser(["student"]);
  if ("error" in auth) return auth.error;

  let body: { volunteerId?: unknown; start?: unknown; subject?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const volunteerId = Number(body.volunteerId);
  const start = typeof body.start === "string" ? body.start.slice(0, 19) : "";
  const subject = typeof body.subject === "string" ? body.subject : "";

  if (!Number.isInteger(volunteerId) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(start) || !subject) {
    return NextResponse.json({ error: "Choose a valid tutor, subject and time." }, { status: 400 });
  }

  const volunteer = await getPerson(volunteerId);
  if (!volunteer || volunteer.role !== "volunteer" || !volunteer.approved) {
    return NextResponse.json({ error: "That tutor is not available for booking yet." }, { status: 400 });
  }
  const teaches = await getSubjectList(volunteerId, "teach");
  if (!teaches.includes(subject)) {
    return NextResponse.json({ error: "That tutor does not teach this subject." }, { status: 400 });
  }

  const slot = await findSlotForBooking(volunteerId, auth.user.id, start);
  if (!slot) {
    return NextResponse.json({ error: "That time is outside your shared availability. Pick another open slot." }, { status: 409 });
  }
  const conflict = (await db
    .prepare(
      `SELECT id FROM sessions WHERE status = 'scheduled' AND scheduled_at = ?
       AND (student_id IN (?, ?) OR volunteer_id IN (?, ?))`,
    )
    .get(start, auth.user.id, volunteerId, auth.user.id, volunteerId)) as { id: number } | undefined;
  if (conflict) {
    return NextResponse.json({ error: "That slot was just booked. Try another time." }, { status: 409 });
  }

  const meet = googleMeetLink();
  const result = await db
    .prepare(
      `INSERT INTO sessions (student_id, volunteer_id, subject, scheduled_at, duration_min, status, meeting_link)
       VALUES (?, ?, ?, ?, 45, 'scheduled', ?)`,
    )
    .run(auth.user.id, volunteerId, subject, start, meet);

  await db.prepare("INSERT INTO audit_log (actor_id, action, detail) VALUES (?, 'session_booked', ?)").run(
    auth.user.id,
    `${auth.user.name} booked ${subject} with ${volunteer.name} for ${start}.`,
  );

  void notifyGoogleChat(
    `New Juntos session booked: ${auth.user.name} + ${volunteer.name} — ${subject}, ${formatDateTime(start)}. Meet: ${meet}`,
  );

  return NextResponse.json({ ok: true, id: Number(result.lastInsertRowid) });
}
