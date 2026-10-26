import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { getStudents, getVolunteerWorksheets, getWorksheetSubmissions } from "@/lib/data";
import { getLocale, localized } from "@/lib/locale";
import { formatDate } from "@/lib/time";
import { Badge, EmptyState, PageHeader, StatCard } from "@/components/ui";
import { WorksheetBuilder } from "@/components/worksheet-builder";
import { ArrowRight, Check, Clipboard, Download, Printer } from "@/components/icons";

export const metadata: Metadata = { title: "Worksheets" };
export const dynamic = "force-dynamic";

export default async function VolunteerWorksheetsPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const user = await requireRole("volunteer");
  const { new: newParam } = await searchParams;
  const locale = await getLocale();
  const l = localized(locale);
  const worksheets = await getVolunteerWorksheets(user.id);
  const submissionsByWorksheet = new Map(
    await Promise.all(worksheets.map(async (worksheet) => [worksheet.id, await getWorksheetSubmissions(worksheet.id)] as const)),
  );
  const students = (await getStudents()).map((student) => ({
    id: student.id,
    name: student.name,
    avatar_color: student.avatar_color,
    grade_level: student.grade_level,
  }));
  const totalAssigned = worksheets.reduce((sum, worksheet) => sum + worksheet.assigned_count, 0);
  const totalCompleted = worksheets.reduce((sum, worksheet) => sum + worksheet.completed_count, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={l("Practice, delivered", "Práctica entregada")}
        title={l("Worksheets", "Hojas de trabajo")}
        sub={l(
          "Send questions, answers and hints straight to a student's portal. They get instant feedback; you get the scores.",
          "Envía preguntas, respuestas y pistas directamente al portal del estudiante. Reciben comentarios al instante; tú ves las notas.",
        )}
        actions={
          <Link href="/volunteer/worksheets?new=1#new-worksheet" className="btn btn-coral btn-sm">
            <Clipboard className="text-sm" /> New worksheet
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label={l("Worksheets created", "Hojas creadas")} value={worksheets.length} accent="yellow" emoji="📒" />
        <StatCard label={l("Assignments sent", "Tareas enviadas")} value={totalAssigned} accent="coral" emoji="📬" />
        <StatCard label={l("Completion rate", "Tasa de finalización")} value={`${totalAssigned ? Math.round((totalCompleted / totalAssigned) * 100) : 0}%`} accent="sage" emoji="✅" hint={`${totalCompleted}/${totalAssigned} ${l("finished", "completadas")}`} />
      </div>

      <WorksheetBuilder students={students} defaultOpen={Boolean(newParam)} canCreate={Boolean(user.approved)} />

      <section>
        <h2 className="mb-2.5 text-base font-extrabold">{l("Your worksheet library", "Tu biblioteca de hojas")}</h2>
        {worksheets.length === 0 ? (
          <EmptyState emoji="📝" title={l("No worksheets yet", "Aún no hay hojas")} action={<Link href="/volunteer/worksheets?new=1#new-worksheet" className="btn btn-coral btn-sm">Create the first one</Link>}>
            {l("A five-question worksheet takes about two minutes to build.", "Una hoja de cinco preguntas toma unos dos minutos.")}
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {worksheets.map((worksheet) => {
              const submissions = submissionsByWorksheet.get(worksheet.id) ?? [];
              return (
                <div key={worksheet.id} className="card overflow-hidden">
                  <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3.5">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge color="coral">{worksheet.subject}</Badge>
                        <Badge color="yellow">{worksheet.grade_band || "All grades"}</Badge>
                        <span className="text-[9px] font-bold text-ink-soft">{worksheet.question_count} questions</span>
                      </div>
                      <h3 className="mt-1.5 text-base font-extrabold">{worksheet.title}</h3>
                      <p className="text-[10px] font-semibold text-ink-soft">
                        Created {formatDate(worksheet.created_at)} · {worksheet.assigned_count} assigned · {worksheet.completed_count} completed
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-cream px-2.5 py-1 text-[10px] font-extrabold text-ink-soft">
                        {worksheet.assigned_count ? Math.round((worksheet.completed_count / worksheet.assigned_count) * 100) : 0}% done
                      </span>
                    </div>
                  </div>
                  {submissions.length ? (
                    <div className="border-t border-ink/8 bg-cream/40 px-4 py-2.5">
                      <p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-wider text-ink-soft">Submissions</p>
                      <div className="flex flex-wrap gap-2">
                        {submissions.map((submission) => (
                          <div key={submission.id} className="flex items-center gap-2 rounded-xl border border-ink/8 bg-white px-2.5 py-1.5">
                            {submission.status === "completed" ? <Check className="text-xs text-sage" /> : <Clipboard className="text-xs text-ink-soft" />}
                            <span className="text-[10px] font-extrabold">{submission.student_name.split(" ")[0]}</span>
                            <span className={`text-[10px] font-extrabold ${submission.status === "completed" ? "text-sage" : "text-ink-soft"}`}>
                              {submission.status === "completed" ? `${submission.score}%` : "pending"}
                            </span>
                            {submission.status === "completed" ? (
                              <a href={`/api/offline-kit?assignment=${submission.id}`} className="text-ink-soft hover:text-coral" title="Download reviewed worksheet">
                                <Download className="text-xs" />
                              </a>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-sky-soft/50 px-4 py-3">
        <p className="flex items-center gap-1.5 text-[11px] font-bold text-ink-soft">
          <Printer className="text-sm text-[#326176]" /> Every worksheet can be printed from the student's offline kit.
        </p>
        <Link href="/volunteer/lessons" className="inline-flex items-center gap-1 text-[11px] font-extrabold text-coral">
          Browse lesson plans <ArrowRight className="text-sm" />
        </Link>
      </div>
    </div>
  );
}
