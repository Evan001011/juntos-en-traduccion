import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { getSession } from "@/lib/data";
import { icsForSession } from "@/lib/time";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await apiUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const session = await getSession(Number(id));
  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  if (auth.user.role !== "admin" && auth.user.id !== session.student_id && auth.user.id !== session.volunteer_id) {
    return NextResponse.json({ error: "You do not have access to this session." }, { status: 403 });
  }

  const meetingLink = session.meeting_link || "https://meet.google.com/new";
  const ics = icsForSession({
    id: session.id,
    title: `Juntos tutoring · ${session.subject}`,
    description: `${session.student_name} + ${session.volunteer_name}. Join: ${meetingLink}`,
    startISO: session.scheduled_at,
    durationMin: session.duration_min,
    meetingLink,
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="juntos-session-${session.id}.ics"`,
    },
  });
}
