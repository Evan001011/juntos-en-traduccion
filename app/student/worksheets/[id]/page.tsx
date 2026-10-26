import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getAnswers, getAssignment, getQuestions, getWorksheet, getPerson } from "@/lib/data";
import { ArrowLeft } from "@/components/icons";
import { WorksheetPlayer } from "@/components/worksheet-player";
import { getLocale, localized } from "@/lib/locale";

export const metadata: Metadata = { title: "Worksheet" };
export const dynamic = "force-dynamic";

export default async function WorksheetPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("student");
  const { id } = await params;
  const assignmentId = Number(id);
  if (!Number.isInteger(assignmentId)) notFound();
  const assignment = await getAssignment(assignmentId, user.id);
  if (!assignment) notFound();
  const worksheet = await getWorksheet(assignment.worksheet_id);
  if (!worksheet) notFound();
  const questions = await getQuestions(worksheet.id);
  const stored = await getAnswers(assignment.id);
  const tutor = await getPerson(worksheet.volunteer_id);
  const locale = await getLocale();
  const l = localized(locale);

  const responses: Record<number, string> = {};
  for (const answer of stored) responses[answer.question_id] = answer.response;
  const completed = assignment.status === "completed";
  const result = completed
    ? {
        score: assignment.score || 0,
        correctCount: stored.filter((answer) => answer.is_correct).length,
        total: questions.length,
        results: questions.map((question) => {
          const answer = stored.find((row) => row.question_id === question.id);
          return { questionId: question.id, correct: Boolean(answer?.is_correct), expected: question.answer };
        }),
      }
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/student/worksheets" className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-ink-soft hover:text-coral">
        <ArrowLeft className="text-sm" /> {l("All worksheets", "Todas las hojas")}
      </Link>
      <WorksheetPlayer
        assignmentId={assignment.id}
        worksheetTitle={worksheet.title}
        subject={worksheet.subject}
        gradeBand={worksheet.grade_band}
        description={worksheet.description}
        tutorName={tutor?.name || "your tutor"}
        questions={questions.map((question) => ({ id: question.id, prompt: question.prompt, hint: question.hint }))}
        initialResponses={responses}
        initialResult={result}
      />
    </div>
  );
}
