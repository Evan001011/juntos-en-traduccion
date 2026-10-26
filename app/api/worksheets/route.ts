import { NextResponse, type NextRequest } from "next/server";
import { apiUser } from "@/lib/auth";
import { batch, db } from "@/lib/db";
import { getStudents } from "@/lib/data";
import { SUBJECTS } from "@/lib/constants";
import { notifyGoogleChat } from "@/lib/google";

export async function POST(request: NextRequest) {
  const auth = await apiUser(["volunteer"]);
  if ("error" in auth) return auth.error;
  if (!auth.user.approved) return NextResponse.json({ error: "Your volunteer application is still pending approval." }, { status: 403 });

  let body: {
    title?: unknown;
    subject?: unknown;
    gradeBand?: unknown;
    description?: unknown;
    questions?: Array<{ prompt?: unknown; answer?: unknown; hint?: unknown }>;
    studentIds?: unknown[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim().slice(0, 140) : "";
  const subject = typeof body.subject === "string" ? body.subject : "";
  const gradeBand = typeof body.gradeBand === "string" ? body.gradeBand.trim().slice(0, 40) : "";
  const description = typeof body.description === "string" ? body.description.trim().slice(0, 4000) : "";
  const questions = (Array.isArray(body.questions) ? body.questions : [])
    .map((question) => ({
      prompt: typeof question.prompt === "string" ? question.prompt.trim().slice(0, 800) : "",
      answer: typeof question.answer === "string" ? question.answer.trim().slice(0, 300) : "",
      hint: typeof question.hint === "string" ? question.hint.trim().slice(0, 400) : null,
    }))
    .filter((question) => question.prompt && question.answer)
    .slice(0, 15);

  if (title.length < 3) return NextResponse.json({ error: "Give the worksheet a clear title." }, { status: 400 });
  if (!(SUBJECTS as readonly string[]).includes(subject)) return NextResponse.json({ error: "Choose a valid subject." }, { status: 400 });
  if (questions.length === 0) return NextResponse.json({ error: "Add at least one question with an answer." }, { status: 400 });

  const validStudents = new Set((await getStudents()).map((student) => student.id));
  const studentIds = (Array.isArray(body.studentIds) ? body.studentIds : [])
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && validStudents.has(id));
  if (studentIds.length === 0) return NextResponse.json({ error: "Assign the worksheet to at least one student." }, { status: 400 });

  const worksheet = await db
    .prepare("INSERT INTO worksheets (volunteer_id, title, subject, grade_band, description) VALUES (?, ?, ?, ?, ?)")
    .run(auth.user.id, title, subject, gradeBand || null, description || null);
  const worksheetId = worksheet.lastInsertRowid;

  await batch([
    ...questions.map((question, index) => ({
      sql: "INSERT INTO worksheet_questions (worksheet_id, prompt, answer, hint, position) VALUES (?, ?, ?, ?, ?)",
      params: [worksheetId, question.prompt, question.answer, question.hint, index],
    })),
    ...studentIds.map((studentId) => ({
      sql: "INSERT INTO worksheet_assignments (worksheet_id, student_id, assigned_by, status) VALUES (?, ?, ?, 'assigned')",
      params: [worksheetId, studentId, auth.user.id],
    })),
    {
      sql: "INSERT INTO audit_log (actor_id, action, detail) VALUES (?, 'worksheet_created', ?)",
      params: [
        auth.user.id,
        `${auth.user.name} created "${title}" (${subject}) with ${questions.length} questions for ${studentIds.length} student(s).`,
      ],
    },
  ]);

  const id = worksheetId;
  void notifyGoogleChat(
    `New worksheet: "${title}" (${subject}) assigned by ${auth.user.name} to ${studentIds.length} student(s).`,
  );
  return NextResponse.json({ ok: true, id });
}
