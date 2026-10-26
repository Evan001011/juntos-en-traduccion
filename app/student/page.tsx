import Link from "next/link";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getFeedbackForStudent, getStudentWorksheets, getUpcomingSessionsForStudent } from "@/lib/data";
import { getStudentLearning } from "@/lib/learning";
import { getVolunteerMatches } from "@/lib/matching";
import { getLocale, localized } from "@/lib/locale";
import { formatDateTime } from "@/lib/time";
import { Avatar, Badge, EmptyState, PageHeader, ProgressDots, Sticker } from "@/components/ui";
import { SessionCard } from "@/components/session-card";
import { ArrowRight, Book, Calendar, Check, Clipboard, Flame, Play, Shield, Sparkles, Star, Target, Trophy } from "@/components/icons";
import { StarMascot } from "@/components/mascots";

export const metadata: Metadata = { title: "Student dashboard" };
export const dynamic = "force-dynamic";

const LEVEL_NAMES = ["Seedling", "Explorer", "Bookworm", "Trailblazer", "Luminary", "Legend"];

export default async function StudentDashboard() {
  const user = await requireRole("student");
  const locale = await getLocale();
  const l = localized(locale);
  const firstName = user.name.split(" ")[0];

  const upcoming = await getUpcomingSessionsForStudent(user.id);
  const nextSession = upcoming[0];
  const learning = await getStudentLearning(user.id, user.needs);
  const worksheets = await getStudentWorksheets(user.id);
  const pendingWorksheets = worksheets.filter((w) => w.assignment_status === "assigned");
  const feedback = (await getFeedbackForStudent(user.id)).slice(0, 2);
  const matches = (await getVolunteerMatches(user.id)).filter((m) => m.slots.length > 0).slice(0, 2);
  const earnedBadges = learning.badges.filter((badge) => badge.earned);
  const levelName = LEVEL_NAMES[Math.min(learning.level - 1, LEVEL_NAMES.length - 1)];
  const xpPercent = Math.round((learning.xpIntoLevel / learning.xpForNext) * 100);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={l("Student portal", "Portal del estudiante")}
        title={<>{l("Hola", "Hola")}, {firstName} 👋</>}
        sub={l(
          "Here's your next step, your learning plan and everything your tutor has noticed.",
          "Aquí está tu próximo paso, tu plan de aprendizaje y todo lo que tu tutor ha notado.",
        )}
        actions={
          <>
            <Link href="/student/find" className="btn btn-coral btn-sm">
              {l("Find a tutor", "Buscar tutor")} <ArrowRight className="text-sm" />
            </Link>
            <Link href="/student/learning" className="btn btn-white btn-sm">
              <Play className="text-sm" /> {l("Keep learning", "Seguir aprendiendo")}
            </Link>
          </>
        }
      />

      <div className="relative overflow-hidden rounded-[30px] border border-ink/10 bg-coral-soft/80 p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-8 opacity-40" aria-hidden="true">
          <StarMascot size={210} />
        </div>
        <div className="relative grid gap-5 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="coral">Level {learning.level}</Badge>
              <span className="text-xs font-extrabold text-[#a02727]">{levelName}</span>
              <Sticker color="yellow" rotate={-3} className="ml-1 !px-2.5 !py-1 !text-[10px]">
                <Flame className="text-xs" /> {learning.streak} week streak
              </Sticker>
            </div>
            <p className="mt-3 max-w-md text-[15px] font-extrabold leading-snug">
              {l(
                "Every session, deck and worksheet adds XP to your learning plan.",
                "Cada sesión, baraja y hoja suma XP a tu plan de aprendizaje.",
              )}
            </p>
            <div className="mt-4 max-w-sm">
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-[#a02727]/80">
                <span>{learning.xp} XP</span>
                <span>{learning.xpForNext - learning.xpIntoLevel} XP to level {learning.level + 1}</span>
              </div>
              <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-white/70">
                <div className="h-full rounded-full bg-coral" style={{ width: `${xpPercent}%` }} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-[11px] font-bold text-ink-soft">
              <span className="inline-flex items-center gap-1"><Calendar className="text-sm text-coral" /> {learning.completedSessions} sessions</span>
              <span className="inline-flex items-center gap-1"><Clipboard className="text-sm text-coral" /> {learning.completedWorksheets} worksheets</span>
              <span className="inline-flex items-center gap-1"><Trophy className="text-sm text-coral" /> {earnedBadges.length} badges</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {learning.badges.filter((b) => b.earned).slice(0, 4).map((badge) => (
              <div key={badge.id} className="w-[76px] rounded-2xl border border-white bg-white/80 px-1.5 py-2 text-center shadow-sm">
                <span className="text-xl">{badge.emoji}</span>
                <p className="mt-1 text-[8px] font-extrabold uppercase leading-tight tracking-wide text-ink-soft">{badge.label}</p>
              </div>
            ))}
            {earnedBadges.length === 0 ? (
              <div className="rounded-2xl bg-white/70 px-4 py-3 text-center text-[10px] font-bold text-ink-soft">
                Your first badge is one session away ✨
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <div className="space-y-5">
          <section>
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="text-base font-extrabold">{l("Your next session", "Tu próxima sesión")}</h2>
              <Link href="/student/sessions" className="text-[11px] font-extrabold text-coral">{l("All sessions", "Todas las sesiones")}</Link>
            </div>
            {nextSession ? (
              <SessionCard session={nextSession} viewer="student" />
            ) : (
              <EmptyState emoji="📅" title={l("No session booked yet", "Aún no hay sesión reservada")} action={<Link href="/student/find" className="btn btn-coral btn-sm">Find a match</Link>}>
                {l("Your perfect tutor is two clicks away.", "Tu tutor ideal está a dos clics.")}
              </EmptyState>
            )}
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-base font-extrabold">
                  <Sparkles className="text-base text-coral" /> {l("Your learning plan", "Tu plan de aprendizaje")}
                </h2>
                <p className="mt-1 text-[11px] font-semibold text-ink-soft">
                  {l("Picked from your skill scores by the recommendation engine.", "Elegido por el motor de recomendaciones según tus puntuaciones.")}
                </p>
              </div>
              <Link href="/student/learning" className="hidden text-[11px] font-extrabold text-coral sm:block">{l("Learning hub", "Centro de aprendizaje")}</Link>
            </div>
            <div className="mt-4 space-y-2">
              {learning.recommendations.slice(0, 3).map((rec) => (
                <Link
                  key={rec.module.id}
                  href={`/student/learning?module=${rec.module.id}`}
                  className="group flex items-center gap-3 rounded-2xl border border-ink/8 bg-white px-3 py-2.5 transition hover:border-coral/30 hover:shadow-[0_3px_0_rgba(48,42,37,0.05)]"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cream text-xl">{rec.module.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-extrabold">{rec.module.title}</span>
                      {rec.focusSkill ? <Badge color="coral">{rec.focusSkill}</Badge> : <Badge color="sage">{rec.module.skill}</Badge>}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] font-semibold text-ink-soft">{rec.reason}</span>
                  </span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-coral text-white transition group-hover:scale-105">
                    <Play className="text-xs" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-extrabold"><Book className="text-base text-sage" /> {l("From your tutor", "De tu tutor")}</h2>
              <Link href="/student/sessions" className="text-[11px] font-extrabold text-coral">{l("Session history", "Historial")}</Link>
            </div>
            {feedback.length ? (
              <div className="mt-3 space-y-3">
                {feedback.map((note) => (
                  <div key={note.id} className="rounded-2xl border border-ink/8 bg-cream/60 p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] font-extrabold">{note.volunteer_name} · {note.subject}</p>
                      <span className="text-[10px] font-semibold text-ink-soft">{formatDateTime(note.scheduled_at)}</span>
                    </div>
                    <p className="mt-1.5 text-xs font-semibold leading-relaxed text-ink-soft">“{note.summary}”</p>
                    {note.homework ? (
                      <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-yellow-soft px-2 py-1 text-[10px] font-bold text-[#7a5a0c]">
                        <Target className="text-xs" /> Next: {note.homework}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs font-semibold text-ink-soft">{l("Your first feedback note will appear after a session.", "Tu primera nota aparecerá después de una sesión.")}</p>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold">{l("Skill snapshot", "Resumen de habilidades")}</h2>
              <Link href="/student/learning" className="text-[11px] font-extrabold text-coral">{l("Practice", "Practicar")}</Link>
            </div>
            <div className="mt-4 space-y-3.5">
              {learning.skills.slice(0, 4).map((skill) => (
                <div key={skill.skill}>
                  <div className="mb-1 flex items-center justify-between text-[11px] font-bold">
                    <span>{skill.skill}</span>
                    <span className="flex items-center gap-1 text-ink-soft">
                      {skill.score}/5
                      {skill.delta > 0 ? <span className="text-[9px] font-extrabold text-sage">▲{skill.delta}</span> : null}
                    </span>
                  </div>
                  <ProgressDots score={skill.score} color={skill.score <= 2 ? "coral" : skill.score <= 3 ? "yellow" : "sage"} />
                </div>
              ))}
              {learning.skills.length === 0 ? (
                <p className="text-xs font-semibold text-ink-soft">{l("Complete a session to unlock your skill graph.", "Completa una sesión para activar tu gráfico de habilidades.")}</p>
              ) : null}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold">{l("Worksheets waiting", "Hojas pendientes")}</h2>
              <Link href="/student/worksheets" className="text-[11px] font-extrabold text-coral">{l("View all", "Ver todo")}</Link>
            </div>
            <div className="mt-3 space-y-2">
              {pendingWorksheets.slice(0, 3).map((worksheet) => (
                <Link key={worksheet.assignment_id} href={`/student/worksheets/${worksheet.assignment_id}`} className="flex items-center gap-2.5 rounded-xl border border-ink/8 px-3 py-2.5 transition hover:border-coral/30">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-yellow-soft text-sm"><Clipboard className="text-sm text-[#7a5a0c]" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-extrabold">{worksheet.title}</span>
                    <span className="block text-[10px] font-semibold text-ink-soft">{worksheet.subject} · {worksheet.question_count} questions</span>
                  </span>
                  <ArrowRight className="text-sm text-ink-soft" />
                </Link>
              ))}
              {pendingWorksheets.length === 0 ? (
                <div className="rounded-xl bg-sage-soft/50 px-3 py-3 text-[11px] font-bold text-[#52622f]">
                  <Check className="mr-1 inline text-sm" /> {l("You're all caught up!", "¡Estás al día!")}
                </div>
              ) : null}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold">{l("Your top matches", "Tus mejores conexiones")}</h2>
              <Link href="/student/find" className="text-[11px] font-extrabold text-coral">{l("Browse", "Explorar")}</Link>
            </div>
            <div className="mt-3 space-y-2">
              {matches.map((match) => (
                <Link key={match.volunteer.id} href="/student/find" className="flex items-center gap-2.5 rounded-xl border border-ink/8 px-2.5 py-2 transition hover:border-coral/30">
                  <Avatar name={match.volunteer.name} color={match.volunteer.avatar_color} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-extrabold">{match.volunteer.name}</p>
                    <p className="truncate text-[10px] font-semibold text-ink-soft">{match.sharedSubjects.join(" · ") || "Flexible support"}</p>
                  </div>
                  <span className="rounded-full bg-sage-soft px-2 py-1 text-[9px] font-extrabold text-[#52622f]">{match.matchPercent}%</span>
                </Link>
              ))}
              {matches.length === 0 ? (
                <p className="text-xs font-semibold text-ink-soft">{l("No matches with shared availability yet.", "Aún no hay conexiones con horarios compartidos.")}</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl border border-ink/10 bg-yellow-soft/60 p-4">
            <p className="flex items-center gap-1.5 text-xs font-extrabold"><Shield className="text-sm text-[#7a5a0c]" /> {l("Guardian on file", "Tutor legal registrado")}</p>
            <p className="mt-1 text-[11px] font-semibold text-ink-soft">{user.guardian_name || "—"} · {user.guardian_email || "—"}</p>
            <p className="mt-2 text-[10px] font-semibold leading-snug text-ink-soft/80">
              {l("Consent recorded", "Consentimiento registrado")} {user.guardian_consent_at ? new Date(user.guardian_consent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
