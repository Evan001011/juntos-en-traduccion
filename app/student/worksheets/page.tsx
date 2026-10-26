import Link from "next/link";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getStudentWorksheets } from "@/lib/data";
import { getLocale, localized } from "@/lib/locale";
import { formatDate } from "@/lib/time";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { ArrowRight, Check, Clipboard, Download, Printer, Sparkles } from "@/components/icons";

export const metadata: Metadata = { title: "My worksheets" };
export const dynamic = "force-dynamic";

export default async function StudentWorksheetsPage() {
  const user = await requireRole("student");
  const locale = await getLocale();
  const l = localized(locale);
  const worksheets = await getStudentWorksheets(user.id);
  const pending = worksheets.filter((worksheet) => worksheet.assignment_status === "assigned");
  const completed = worksheets.filter((worksheet) => worksheet.assignment_status === "completed");

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={l("Practice, checked", "Práctica corregida")}
        title={l("Worksheets", "Hojas de trabajo")}
        sub={l(
          "Your tutor sends questions and an answer key. Answer in the app for instant feedback, or download a printable kit.",
          "Tu tutor envía preguntas y una clave de respuestas. Responde en la app para recibir comentarios al instante o descarga un kit imprimible.",
        )}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink/10 bg-yellow-soft/70 px-4 py-3">
          <p className="text-2xl font-extrabold text-[#7a5a0c]">{pending.length}</p>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">To do</p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-sage-soft/70 px-4 py-3">
          <p className="text-2xl font-extrabold text-[#52622f]">{completed.length}</p>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">Completed</p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-coral-soft/70 px-4 py-3">
          <p className="text-2xl font-extrabold text-[#a02727]">
            {completed.length ? Math.round(completed.reduce((sum, item) => sum + (item.score || 0), 0) / completed.length) : 0}%
          </p>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">Average score</p>
        </div>
      </div>

      <section>
        <h2 className="mb-2.5 flex items-center gap-1.5 text-base font-extrabold"><Clipboard className="text-base text-coral" /> {l("Ready for you", "Listas para ti")}</h2>
        {pending.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {pending.map((worksheet) => (
              <div key={worksheet.assignment_id} className="card-hover card overflow-hidden">
                <div className="flex items-start justify-between gap-2 bg-yellow-soft/60 px-4 py-3">
                  <div>
                    <Badge color="yellow">{worksheet.subject}</Badge>
                    <p className="mt-1.5 text-[10px] font-extrabold uppercase tracking-wide text-ink-soft">{worksheet.grade_band || "All grades"} · {worksheet.question_count} questions</p>
                  </div>
                  <span className="text-2xl">📝</span>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-extrabold">{worksheet.title}</h3>
                  <p className="mt-1 text-[11px] font-semibold text-ink-soft">From {worksheet.volunteer_name} · assigned {formatDate(worksheet.assigned_at)}</p>
                  {worksheet.description ? <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-relaxed text-ink-soft">{worksheet.description}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/student/worksheets/${worksheet.assignment_id}`} className="btn btn-coral btn-sm">
                      Start worksheet <ArrowRight className="text-sm" />
                    </Link>
                    <a href={`/api/offline-kit?assignment=${worksheet.assignment_id}`} className="btn btn-white btn-sm" title="Printable kit">
                      <Download className="text-sm" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState emoji="✅" title={l("No worksheets waiting", "No hay hojas pendientes")}>
            {l("Your tutor can send one after your next session.", "Tu tutor puede enviar una después de tu próxima sesión.")}
          </EmptyState>
        )}
      </section>

      {completed.length ? (
        <section>
          <h2 className="mb-2.5 flex items-center gap-1.5 text-base font-extrabold"><Check className="text-base text-sage" /> {l("Completed", "Completadas")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {completed.map((worksheet) => (
              <div key={worksheet.assignment_id} className="card overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full"
                    style={{ background: `conic-gradient(#9BB068 ${worksheet.score || 0}%, #efe9dc 0)` }}
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-white text-[10px] font-extrabold">{worksheet.score || 0}%</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-extrabold">{worksheet.title}</h3>
                    <p className="text-[10px] font-semibold text-ink-soft">{worksheet.subject} · {formatDate(worksheet.completed_at || worksheet.assigned_at)}</p>
                  </div>
                  <a href={`/api/offline-kit?assignment=${worksheet.assignment_id}`} className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 text-ink-soft hover:text-coral" title="Printable kit">
                    <Printer className="text-sm" />
                  </a>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-ink/8 px-4 py-2.5">
                  <Link href={`/student/worksheets/${worksheet.assignment_id}`} className="text-[11px] font-extrabold text-coral">Review answers →</Link>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-sage"><Sparkles className="text-xs" /> +XP earned</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
