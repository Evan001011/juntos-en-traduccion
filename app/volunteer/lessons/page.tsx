import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getLessonPlans } from "@/lib/data";
import { SUBJECTS } from "@/lib/constants";
import { getLocale, localized } from "@/lib/locale";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { Book, Clock, External, Filter, Search, Sparkles } from "@/components/icons";

export const metadata: Metadata = { title: "Lesson library" };
export const dynamic = "force-dynamic";

const GRADES = ["All", "Grades 4", "Grades 5", "Grades 6", "Grades 7", "Grades 8", "Grades 9", "Grades 10"];

export default async function LessonLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; subject?: string; grade?: string }>;
}) {
  await requireRole("volunteer");
  const { q = "", subject = "All", grade = "All" } = await searchParams;
  const locale = await getLocale();
  const l = localized(locale);
  const lessons = await getLessonPlans({ q, subject, grade });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={l("Lesson library", "Biblioteca de lecciones")}
        title={l("Borrow a plan. Make it yours.", "Toma un plan. Hazlo tuyo.")}
        sub={l(
          "Open-source, classroom-tested plans organised by subject and grade. Each one fits a 45-minute Juntos session.",
          "Planes abiertos y probados en clase, organizados por materia y grado. Cada uno cabe en una sesión de 45 minutos.",
        )}
        actions={<span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3 py-1.5 text-[10px] font-extrabold text-ink-soft"><Book className="text-sm text-sage" /> {lessons.length} plans</span>}
      />

      <form method="get" action="/volunteer/lessons" className="card p-3.5">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[180px] flex-1">
            <label htmlFor="lesson-q" className="label">{l("Search", "Buscar")}</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-soft" />
              <input id="lesson-q" name="q" defaultValue={q} placeholder="fractions, main idea, vocabulary…" className="input py-2.5 pl-9 text-xs" />
            </div>
          </div>
          <div>
            <label htmlFor="lesson-subject" className="label">{l("Subject", "Materia")}</label>
            <select id="lesson-subject" name="subject" defaultValue={subject} className="input py-2.5 text-xs">
              <option value="All">All</option>
              {SUBJECTS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="lesson-grade" className="label">{l("Grade", "Grado")}</label>
            <select id="lesson-grade" name="grade" defaultValue={grade} className="input py-2.5 text-xs">
              {GRADES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-sage">
            <Filter className="text-sm" /> Filter
          </button>
        </div>
      </form>

      {lessons.length === 0 ? (
        <EmptyState emoji="📚" title={l("No plans match that search", "Ningún plan coincide")} action={<a href="/volunteer/lessons" className="btn btn-white btn-sm">Clear filters</a>}>
          {l("Try a broader subject or clear the keyword.", "Prueba una materia más amplia o quita la palabra clave.")}
        </EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="card-hover card flex flex-col overflow-hidden">
              <div className="flex items-start justify-between gap-3 bg-sage-soft/50 px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  <Badge color="sage">{lesson.subject}</Badge>
                  <Badge color="yellow">{lesson.grade_band}</Badge>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-[9px] font-extrabold text-ink-soft"><Clock className="text-xs" /> {lesson.duration_min} min</span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h2 className="text-base font-extrabold leading-tight">{lesson.title}</h2>
                <p className="mt-1 flex-1 text-[11px] font-semibold leading-relaxed text-ink-soft">{lesson.summary}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(lesson.tags || "").split(",").filter(Boolean).map((tag) => (
                    <span key={tag} className="rounded-full bg-cream px-2 py-0.5 text-[9px] font-bold text-ink-soft">#{tag.trim()}</span>
                  ))}
                </div>
                <details className="group mt-3">
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[11px] font-extrabold text-coral [&::-webkit-details-marker]:hidden">
                    <Sparkles className="text-sm" /> View 45-minute plan
                  </summary>
                  <div className="mt-2 rounded-2xl border border-ink/8 bg-cream/60 p-3">
                    <p className="whitespace-pre-wrap text-[11px] font-semibold leading-relaxed text-ink-soft">{lesson.steps}</p>
                    {lesson.materials ? <p className="mt-2 text-[10px] font-bold text-ink-soft"><span className="text-coral">Materials:</span> {lesson.materials}</p> : null}
                    {lesson.resource_url ? (
                      <a href={lesson.resource_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] font-extrabold text-coral">
                        Open resource <External className="text-xs" />
                      </a>
                    ) : null}
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
