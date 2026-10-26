import { NextResponse, type NextRequest } from "next/server";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPerson } from "@/lib/data";
import { notifyGoogleChat } from "@/lib/google";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await apiUser(["admin"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const volunteerId = Number(id);
  const volunteer = await getPerson(volunteerId);
  if (!volunteer || volunteer.role !== "volunteer") {
    return NextResponse.json({ error: "Volunteer not found." }, { status: 404 });
  }

  let body: { approved?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof body.approved !== "boolean") {
    return NextResponse.json({ error: "Choose approve or pause." }, { status: 400 });
  }

  await db.prepare("UPDATE users SET approved = ? WHERE id = ? AND role = 'volunteer'").run(body.approved ? 1 : 0, volunteerId);
  await db.prepare("INSERT INTO audit_log (actor_id, action, detail) VALUES (?, ?, ?)").run(
    auth.user.id,
    body.approved ? "volunteer_approved" : "volunteer_paused",
    `${auth.user.name} ${body.approved ? "approved" : "paused"} ${volunteer.name}'s volunteer access.`,
  );

  void notifyGoogleChat(
    `Volunteer ${body.approved ? "approved" : "paused"} in Juntos: ${volunteer.name} (${volunteer.email}) by ${auth.user.name}.`,
  );

  return NextResponse.json({ ok: true, approved: body.approved });
}
