import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getImpactReport } from "@/lib/data";
import { getLocale, localized } from "@/lib/locale";
import { formatDate } from "@/lib/time";
import { Badge, ProgressDots, StatCard } from "@/components/ui";
import { PrintButton } from "@/components/print-button";
import { ArrowRight, Check, Heart, Shield, Sparkles, Target, Trophy, Users } from "@/components/icons";

export const metadata: Metadata = { title: "Impact report" };
export const dynamic = "force-dynamic";

export default async function AdminImpactPage() {
  await requireRole("admin");
  const locale = await getLocale();
  const l = localized(locale);
  const report = await getImpactReport();
  const maxWeek = Math.max(1, ...report.weekly.map((week) => week.sessions));
  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 no-print">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-soft">{l("Program metrics", "Métricas del programa")}</p>
          <h1 className="mt-1 text-[clamp(1.7rem,3.4vw,2.5rem)] font-semibold leading-tight">{l("Impact report", "Informe de impacto")}</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-ink-soft">
            {l(
              "A funder-ready snapshot generated live from the Juntos database. Print or save as PDF to share with partners and sponsors.",
              "Un resumen listo para patrocinadores, generado en vivo desde la base de datos. Imprime o guarda en PDF para compartir con socios y patrocinadores.",
            )}
          </p>
        </div>
        <PrintButton label={l("Print / save PDF", "Imprimir / guardar PDF")} />
      </div>

      <div className="card overflow-hidden print-full">
        <div className="relative overflow-hidden bg-ink px-6 py-7 text-cream sm:px-8">
          <div className="pointer-events-none absolute -right-8 -top-8 opacity-15"><Trophy className="text-[160px]" /></div>
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-yellow text-ink"><Heart className="text-lg" /></span>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-cream/70">Juntos en Traducción</p>
              </div>
              <h2 className="mt-3 text-[clamp(1.7rem,4vw,2.7rem)] font-semibold leading-[1.02]">{l("Community impact report", "Informe de impacto comunitario")}</h2>
              <p className="mt-2 max-w-lg text-xs font-semibold leading-relaxed text-cream/70">
                {l(
                  "Free, bilingual, peer-to-peer tutoring built by students in the district — measured session by session.",
                  "Tutoría gratuita, bilingüe y entre pares creada por estudiantes del distrito — medida sesión por sesión.",
                )}
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-right">
              <p className="text-[9px] font-bold uppercase tracking-wider text-cream/60">{l("Prepared", "Preparado")}</p>
              <p className="text-sm font-extrabold">{dateLabel}</p>
              <p className="mt-1 text-[9px] font-semibold text-cream/60">{l("Live data · school timezone ET", "Datos en vivo · hora escolar ET")}</p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={l("Tutoring hours", "Horas de tutoría")} value={report.stats.hours} accent="coral" emoji="⏱️" hint={`${report.stats.completed_sessions} ${l("sessions delivered", "sesiones entregadas")}`} />
            <StatCard label={l("Students served", "Estudiantes atendidos")} value={report.studentsServed} accent="sage" emoji="🎒" hint={`${report.stats.students} ${l("enrolled", "inscritos")}`} />
            <StatCard label={l("Volunteers active", "Voluntarios activos")} value={report.volunteersActive} accent="yellow" emoji="🌟" hint={`${report.stats.volunteers} ${l("approved", "aprobados")}`} />
            <StatCard label={l("Session completion", "Finalización")} value={`${report.completionRate}%`} accent="lilac" emoji="✅" hint={`${report.stats.upcoming_sessions} ${l("upcoming", "próximas")}`} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section>
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-sm font-extrabold"><Sparkles className="text-base text-coral" /> {l("Sessions per week", "Sesiones por semana")}</h3>
                <span className="text-[9px] font-bold uppercase tracking-wider text-ink-soft">{l("Last 8 weeks", "Últimas 8 semanas")}</span>
              </div>
              <div className="mt-4 flex h-[168px] items-end gap-2 rounded-2xl border border-ink/8 bg-cream/50 px-3 pb-3 pt-4">
                {report.weekly.map((week) => (
                  <div key={week.week} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                    <span className="text-[9px] font-extrabold text-ink-soft">{week.sessions}</span>
                    <div className="w-full rounded-t-lg bg-sage" style={{ height: `${Math.max(8, (week.sessions / maxWeek) * 100)}%` }} title={`${week.label}: ${week.sessions} sessions`} />
                    <span className="text-[8px] font-bold text-ink-soft">{week.label}</span>
                  </div>
                ))}
                {report.weekly.length === 0 ? <p className="m-auto text-xs font-semibold text-ink-soft">Completed sessions populate this chart.</p> : null}
              </div>
              <p className="mt-2 text-[9px] font-semibold leading-relaxed text-ink-soft">
                {l(
                  "Each bar is a completed, guardian-approved tutoring session. Sessions are 45 minutes by default.",
                  "Cada barra es una sesión completada y aprobada por un tutor legal. Las sesiones duran 45 minutos por defecto.",
                )}
              </p>
            </section>

            <section>
              <h3 className="flex items-center gap-1.5 text-sm font-extrabold"><Target className="text-base text-coral" /> {l("Measured learning growth", "Crecimiento medido")}</h3>
              <div className="mt-3 space-y-3">
                <div className="rounded-2xl bg-sage-soft/60 px-3.5 py-3">
                  <p className="text-3xl font-extrabold text-[#52622f]">{report.skills.improved}</p>
                  <p className="text-[10px] font-bold text-ink-soft">{l("micro-skills improved across students", "micro-habilidades mejoradas")}</p>
                  <p className="mt-1 text-[9px] font-semibold text-ink-soft/80">+{report.skills.averageGain} {l("points average gain, on a 1–5 scale", "puntos de mejora promedio, escala 1–5")}</p>
                </div>
                <div className="space-y-2">
                  {report.subjectImpact.slice(0, 4).map((subject, index) => (
                    <div key={subject.subject} className="flex items-center gap-2">
                      <span className="w-[74px] shrink-0 text-[10px] font-extrabold">{subject.subject}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream">
                        <div className={`h-full rounded-full ${["bg-coral", "bg-yellow", "bg-sage", "bg-lilac"][index]}`} style={{ width: `${Math.max(8, (subject.sessions / Math.max(1, report.subjectImpact[0].sessions)) * 100)}%` }} />
                      </div>
                      <span className="w-12 text-right text-[9px] font-bold text-ink-soft">{subject.sessions} {l("sessions", "ses.")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <section className="rounded-2xl border border-ink/10 bg-paper p-4">
              <h3 className="flex items-center gap-1.5 text-xs font-extrabold"><Users className="text-sm text-sage" /> {l("Access & equity", "Acceso y equidad")}</h3>
              <div className="mt-2.5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-ink-soft">{l("Guardian consent on file", "Consentimiento registrado")}</span>
                  <span>{report.guardian.rate}%</span>
                </div>
                <ProgressDots score={Math.round(report.guardian.rate / 20)} color="sage" />
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-ink-soft">{l("Worksheets finished", "Hojas completadas")}</span>
                  <span>{report.worksheets.completed}/{report.worksheets.assigned}</span>
                </div>
                <ProgressDots score={Math.round(report.worksheets.completionRate / 20)} color="yellow" />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {report.languages.map((language) => (
                  <Badge key={language.languages} color="lilac">{language.languages.toUpperCase()} · {language.count}</Badge>
                ))}
                {report.languages.length === 0 ? <span className="text-[10px] font-semibold text-ink-soft">—</span> : null}
              </div>
            </section>

            <section className="rounded-2xl border border-ink/10 bg-yellow-soft/40 p-4">
              <h3 className="flex items-center gap-1.5 text-xs font-extrabold"><Shield className="text-sm text-[#7a5a0c]" /> {l("Safety & compliance", "Seguridad y cumplimiento")}</h3>
              <ul className="mt-2 space-y-1.5 text-[10px] font-semibold leading-relaxed text-ink-soft">
                <li className="flex gap-1.5"><Check className="mt-0.5 shrink-0 text-xs text-sage" /> COPPA-aware guardian authorization at student signup.</li>
                <li className="flex gap-1.5"><Check className="mt-0.5 shrink-0 text-xs text-sage" /> Contact-info filtering on direct messages and session chat.</li>
                <li className="flex gap-1.5"><Check className="mt-0.5 shrink-0 text-xs text-sage" /> Human admin review for every flagged message.</li>
                <li className="flex gap-1.5"><Check className="mt-0.5 shrink-0 text-xs text-sage" /> Volunteer approval before any student match.</li>
                <li className="flex gap-1.5"><Check className="mt-0.5 shrink-0 text-xs text-sage" /> Password hashing and role-scoped access on every route.</li>
              </ul>
            </section>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4">
            <div>
              <p className="text-[10px] font-extrabold">{l("Method", "Método")}</p>
              <p className="mt-1 max-w-2xl text-[9px] font-semibold leading-relaxed text-ink-soft">
                {l(
                  "Hours use completed-session duration. Skill growth compares each student's first and latest volunteer rating per micro-skill (1–5). Worksheet completion counts assignments submitted at least once. This report is reproducible from the live relational database, not a static mock.",
                  "Las horas usan la duración de sesiones completadas. El crecimiento compara la primera y última evaluación por micro-habilidad (1–5). La finalización cuenta tareas enviadas. Este informe se reproduce desde la base de datos relacional en vivo.",
                )}
              </p>
            </div>
            <p className="text-[9px] font-bold text-ink-soft/70">{l("Generated", "Generado")} {formatDate(now.toISOString())} · Juntos v1.0</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-paper px-4 py-3 no-print">
        <p className="flex items-center gap-1.5 text-[11px] font-bold text-ink-soft">
          <Trophy className="text-sm text-[#e0a200]" /> {l("Funder-ready report, generated from live session data.", "Informe listo para patrocinadores, generado con datos de sesiones en vivo.")}
        </p>
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-yellow-soft text-sm">★</span>
          <span className="text-[9px] font-semibold text-ink-soft">Juntos en Traducción · {new Date().getFullYear()}</span>
          <a href="/admin" className="inline-flex items-center gap-1 text-[10px] font-extrabold text-coral">
            {l("Back to dashboard", "Volver al panel")} <ArrowRight className="text-xs" />
          </a>
        </div>
      </div>
    </div>
  );
}
