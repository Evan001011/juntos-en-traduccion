import { NextResponse, type NextRequest } from "next/server";
import { apiUser } from "@/lib/auth";
import { batch } from "@/lib/db";
import { getAssignment, getQuestions, getWorksheet } from "@/lib/data";
import { isAnswerCorrect } from "@/lib/learning";
import { notifyGoogleChat } from "@/lib/google";

export async function POST(request: NextRequest) {
  const auth = await apiUser(["student"]);
  if ("error" in auth) return auth.error;

  let body: { assignmentId?: unknown; answers?: Array<{ questionId?: unknown; response?: unknown }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const assignmentId = Number(body.assignmentId);
  const assignment = await getAssignment(assignmentId, auth.user.id);
  if (!assignment) return NextResponse.json({ error: "Worksheet assignment not found." }, { status: 404 });

  const worksheet = await getWorksheet(assignment.worksheet_id);
  const questions = await getQuestions(assignment.worksheet_id);
  if (!worksheet || questions.length === 0) return NextResponse.json({ error: "Worksheet is empty." }, { status: 400 });

  const answerMap = new Map<number, string>();
  for (const row of body.answers || []) {
    const questionId = Number(row.questionId);
    const response = typeof row.response === "string" ? row.response.slice(0, 500) : "";
    if (questions.some((q) => q.id === questionId)) answerMap.set(questionId, response);
  }

  const results = questions.map((question) => {
    const response = answerMap.get(question.id) || "";
    const correct = isAnswerCorrect(response, question.answer);
    return { questionId: question.id, response, correct, expected: question.answer };
  });
  const correctCount = results.filter((result) => result.correct).length;
  const score = Math.round((correctCount / questions.length) * 100);

  await batch([
    { sql: "DELETE FROM worksheet_answers WHERE assignment_id = ?", params: [assignmentId] },
    ...results.map((result) => ({
      sql: "INSERT INTO worksheet_answers (assignment_id, question_id, response, is_correct) VALUES (?, ?, ?, ?)",
      params: [assignmentId, result.questionId, result.response, result.correct ? 1 : 0],
    })),
    {
      sql: "UPDATE worksheet_assignments SET status = 'completed', score = ?, completed_at = datetime('now') WHERE id = ?",
      params: [score, assignmentId],
    },
    {
      sql: "INSERT INTO audit_log (actor_id, action, detail) VALUES (?, 'worksheet_completed', ?)",
      params: [auth.user.id, `${auth.user.name} completed "${worksheet.title}" with ${score}%.`],
    },
  ]);

  void notifyGoogleChat(
    `Worksheet completed: ${auth.user.name} scored ${score}% on "${worksheet.title}" (${worksheet.subject}).`,
  );

  return NextResponse.json({ ok: true, score, correctCount, total: questions.length, results });
}
