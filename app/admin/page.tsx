import Link from "next/link";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import {
  getAdminMetrics,
  getAdminSessions,
  getAllVolunteers,
  getAuditLog,
  getFlaggedMessages,
  getImpactReport,
  getLatestSkillScores,
  getStudents,
} from "@/lib/data";
import { getLocale, localized } from "@/lib/locale";
import { formatDateTime, timeAgo } from "@/lib/time";
import { integrationStatus } from "@/lib/google";
import { Avatar, Badge, PageHeader, StatCard } from "@/components/ui";
import { ArrowRight, Calendar, Chat, Check, Clipboard, Clock, Globe, Shield, Sparkles, Trophy, Users } from "@/components/icons";
import { StarMascot } from "@/components/mascots";

export const metadata: Metadata = { title: "Admin dashboard" };
export const dynamic = "force-dynamic";

const SUBJECT_ACCENT = ["bg-coral", "bg-yellow", "bg-sage", "bg-lilac", "bg-pink", "bg-mint", "bg-sky"];

export default async function AdminDashboard() {
  await requireRole("admin");
  const locale = await getLocale();
  const l = localized(locale);
  const metrics = await getAdminMetrics();
  const impact = await getImpactReport();
  const flagged = await getFlaggedMessages();
  const audit = await getAuditLog(8);
  const sessions = await getAdminSessions(6);
  const pending = (await getAllVolunteers()).filter((volunteer) => !volunteer.approved);
  const integrations = integrationStatus();

  const careQueue = (
    await Promise.all(
      (await getStudents()).map(async (student) => {
        const scores = await getLatestSkillScores(student.id);
        const average = scores.length ? scores.reduce((sum, score) => sum + score.score, 0) / scores.length : null;
        return { student, scores, average };
      }),
    )
  )
    .filter((entry) => entry.average !== null)
    .sort((a, b) => (a.average ?? 0) - (b.average ?? 0))
    .slice(0, 4);

  const dates = sessions.map((session) => session.scheduled_at).sort();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const maxSubject = Math.max(1, ...metrics.bySubject.map((row) => row.sessions));

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={l("Operations center", "Centro de operaciones")}
        title={l("Good morning, team", "Buenos días, equipo")}
        sub={`${today} · ${l("Every number below is live from the Juntos database.", "Cada número es en vivo desde la base de datos de Juntos.")}`}
        actions={
          <>
            <Link href="/admin/safety" className="btn btn-white btn-sm"><Shield className="text-sm" /> {l("Safety queue", "Cola de seguridad")}</Link>
            <Link href="/admin/impact" className="btn btn-lilac btn-sm"><Trophy className="text-sm" /> {l("Impact report", "Informe de impacto")}</Link>
          </>
        }
      />

      {metrics.pendingVolunteers > 0 || metrics.flaggedMessages > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {metrics.pendingVolunteers > 0 ? (
            <Link href="/admin/volunteers" className="group flex items-center gap-3 rounded-2xl border-2 border-yellow/60 bg-yellow-soft/70 px-4 py-3 transition hover:-translate-y-0.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-yellow text-[#7a5a0c]"><Users className="text-base" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold">{metrics.pendingVolunteers} volunteer{metrics.pendingVolunteers === 1 ? "" : "s"} waiting for approval</p>
                <p className="text-[10px] font-semibold text-ink-soft">Review subjects and availability before they can be matched.</p>
              </div>
              <ArrowRight className="text-sm text-[#7a5a0c] transition group-hover:translate-x-0.5" />
            </Link>
          ) : null}
          {metrics.flaggedMessages > 0 ? (
            <Link href="/admin/safety" className="group flex items-center gap-3 rounded-2xl border-2 border-coral/40 bg-coral-soft/70 px-4 py-3 transition hover:-translate-y-0.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-coral text-white"><Shield className="text-base" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold">{metrics.flaggedMessages} message{metrics.flaggedMessages === 1 ? "" : "s"} flagged by the safety filter</p>
                <p className="text-[10px] font-semibold text-ink-soft">A human should review the context before it ages out.</p>
              </div>
              <ArrowRight className="text-sm text-[#a02727] transition group-hover:translate-x-0.5" />
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={l("Tutoring hours", "Horas de tutoría")} value={metrics.stats.hours} accent="coral" emoji="⏱️" hint={`${metrics.stats.completed_sessions} ${l("completed sessions", "sesiones completadas")}`} />
        <StatCard label={l("Active matches", "Conexiones activas")} value={metrics.stats.active_matches} accent="sage" emoji="🤝" hint={`${metrics.stats.students} ${l("students enrolled", "estudiantes inscritos")}`} />
        <StatCard label={l("Approved volunteers", "Voluntarios aprobados")} value={metrics.stats.volunteers} accent="yellow" emoji="🌟" hint={`${metrics.pendingVolunteers} ${l("pending review", "pendientes de revisión")}`} />
        <StatCard label={l("Worksheets completed", "Hojas completadas")} value={metrics.stats.worksheets_completed} accent="lilac" emoji="📒" hint={`${metrics.avgSkill}/5 ${l("average skill score", "puntuación media")}`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <div className="space-y-5">
          <section className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-1.5 text-base font-extrabold"><Calendar className="text-base text-coral" /> {l("Live session board", "Tablero de sesiones")}</h2>
                <p className="mt-0.5 text-[10px] font-semibold text-ink-soft">{l("Admin-monitored rooms across the program.", "Salas monitoreadas por administradores.")}</p>
              </div>
              <Link href="/admin/safety" className="text-[11px] font-extrabold text-coral">{l("Monitor", "Monitorear")}</Link>
            </div>
            <div className="mt-3 divide-y divide-ink/8">
              {sessions.map((session) => (
                <div key={session.id} className="flex flex-wrap items-center gap-2 py-2.5">
                  <div className="flex -space-x-1.5">
                    <Avatar name={session.student_name} color={session.student_color} size="xs" />
                    <Avatar name={session.volunteer_name} color={session.volunteer_color} size="xs" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-extrabold">{session.student_name} + {session.volunteer_name}</p>
                    <p className="text-[9px] font-semibold text-ink-soft">{session.subject} · {formatDateTime(session.scheduled_at)}</p>
                  </div>
                  <Badge color={session.status === "completed" ? "sage" : session.status === "cancelled" ? "coral" : "yellow"}>
                    {session.status}
                  </Badge>
                  <Link href={`/session/${session.id}`} className="inline-flex items-center gap-1 text-[10px] font-extrabold text-coral">
                    {l("Open room", "Abrir sala")} <ArrowRight className="text-xs" />
                  </Link>
                </div>
              ))}
              {sessions.length === 0 ? <p className="py-5 text-xs font-semibold text-ink-soft">No sessions yet.</p> : null}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-1.5 text-base font-extrabold"><Clipboard className="text-base text-sage" /> {l("Subject mix", "Mezcla de materias")}</h2>
              <span className="text-[9px] font-bold uppercase tracking-wider text-ink-soft">{l("Completed", "Completadas")}</span>
            </div>
            <div className="mt-4 space-y-3">
              {metrics.bySubject.map((row, index) => (
                <div key={row.subject}>
                  <div className="mb-1 flex items-center justify-between text-[10px] font-extrabold">
                    <span>{row.subject}</span>
                    <span className="text-ink-soft">{row.sessions} sessions · {(row.minutes / 60).toFixed(1)}h</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-cream">
                    <div className={`h-full rounded-full ${SUBJECT_ACCENT[index % SUBJECT_ACCENT.length]}`} style={{ width: `${Math.max(6, (row.sessions / maxSubject) * 100)}%` }} />
                  </div>
                </div>
              ))}
              {metrics.bySubject.length === 0 ? <p className="text-xs font-semibold text-ink-soft">Completed sessions will populate this chart.</p> : null}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-1.5 text-base font-extrabold"><Sparkles className="text-base text-coral" /> {l("Care radar", "Radar de apoyo")}</h2>
                <p className="mt-0.5 text-[10px] font-semibold text-ink-soft">{l("Students with the lowest latest skill scores. Reach out before the gap widens.", "Estudiantes con las puntuaciones más bajas. Contacta antes de que crezca la brecha.")}</p>
              </div>
              <Link href="/admin/messages" className="text-[11px] font-extrabold text-coral">{l("Message", "Mensaje")}</Link>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {careQueue.map((entry) => {
                const weakest = entry.scores.slice(0, 2);
                return (
                  <Link key={entry.student.id} href={`/admin/messages?with=${entry.student.id}`} className="rounded-2xl border border-ink/8 bg-cream/40 p-3 transition hover:border-coral/30">
                    <div className="flex items-center gap-2">
                      <Avatar name={entry.student.name} color={entry.student.avatar_color} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-extrabold">{entry.student.name}</p>
                        <p className="text-[9px] font-semibold text-ink-soft">Grade {entry.student.grade_level ?? "—"} · avg {entry.average?.toFixed(1)}/5</p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {weakest.map((score) => (
                        <span key={score.skill} className={`rounded-full px-1.5 py-0.5 text-[8px] font-extrabold ${score.score <= 2 ? "bg-coral-soft text-[#a02727]" : "bg-yellow-soft text-[#7a5a0c]"}`}>
                          {score.skill} {score.score}/5
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
              {careQueue.length === 0 ? <p className="text-xs font-semibold text-ink-soft">Skill data appears after the first feedback form.</p> : null}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="relative overflow-hidden rounded-[28px] border border-ink/10 bg-lilac-soft/60 p-5">
            <StarMascot size={72} className="absolute -right-2 -top-2 opacity-30" />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#6e4680]">{l("Applications", "Solicitudes")}</p>
            <p className="mt-1 text-3xl font-extrabold">{pending.length}</p>
            <p className="text-[11px] font-semibold text-ink-soft">{l("volunteers waiting for a human review", "voluntarios esperando revisión")}</p>
            <div className="mt-3 space-y-2">
              {pending.slice(0, 3).map((volunteer) => (
                <div key={volunteer.id} className="flex items-center gap-2 rounded-xl bg-white/70 px-2.5 py-2">
                  <Avatar name={volunteer.name} color={volunteer.avatar_color} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-extrabold">{volunteer.name}</p>
                    <p className="truncate text-[9px] font-semibold text-ink-soft">{volunteer.subjects.join(" · ") || "No subjects yet"}</p>
                  </div>
                </div>
              ))}
              {pending.length === 0 ? <p className="rounded-xl bg-white/60 px-3 py-2 text-[10px] font-bold text-[#52622f]"><Check className="mr-1 inline text-xs" /> All reviewed</p> : null}
            </div>
            <Link href="/admin/volunteers" className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold text-[#6e4680]">
              {l("Open approvals", "Abrir aprobaciones")} <ArrowRight className="text-sm" />
            </Link>
          </section>

          <section className="card p-5">
            <h2 className="flex items-center gap-1.5 text-base font-extrabold"><Shield className="text-base text-sage" /> {l("Safety snapshot", "Resumen de seguridad")}</h2>
            <div className="mt-3 space-y-2.5">
              {[
                { icon: <Chat className="text-sm" />, label: "Flagged messages", value: flagged.length, href: "/admin/safety", accent: flagged.length ? "text-coral" : "text-sage" },
                { icon: <Users className="text-sm" />, label: "Guardian consent on file", value: `${impact.guardian.rate}%`, href: "/admin/safety", accent: "text-sage" },
                { icon: <Globe className="text-sm" />, label: "Google Chat alerts", value: integrations.chat.configured ? "Live" : "Demo mode", href: "/admin/impact", accent: "text-ink-soft" },
              ].map((row) => (
                <Link key={row.label} href={row.href} className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-cream">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-cream text-ink-soft">{row.icon}</span>
                  <span className="flex-1 text-[10px] font-bold text-ink-soft">{row.label}</span>
                  <span className={`text-[10px] font-extrabold ${row.accent}`}>{row.value}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="flex items-center gap-1.5 text-base font-extrabold"><Clock className="text-base text-coral" /> {l("Recent activity", "Actividad reciente")}</h2>
            <div className="mt-3 space-y-2.5">
              {audit.map((entry) => (
                <div key={entry.id} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold leading-relaxed text-ink-soft">{entry.detail || entry.action}</p>
                    <p className="text-[8px] font-bold uppercase tracking-wide text-ink-soft/60">{entry.actor_name || "System"} · {timeAgo(entry.created_at)}</p>
                  </div>
                </div>
              ))}
              {audit.length === 0 ? <p className="text-xs font-semibold text-ink-soft">No activity yet.</p> : null}
            </div>
          </section>

          {/* Keep the most recent session dates visible for the demo narrative. */}
          {dates.length ? (
            <p className="px-1 text-[9px] font-semibold text-ink-soft/60">
              Session data window: {formatDateTime(dates[0])} → {formatDateTime(dates[dates.length - 1])}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
