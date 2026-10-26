import Link from "next/link";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import {
  getFeedbackForVolunteer,
  getLatestSkillScores,
  getSessionsForVolunteer,
  getUpcomingSessionsForVolunteer,
  getVolunteerStudents,
} from "@/lib/data";
import { getLocale, localized } from "@/lib/locale";
import { formatDateTime } from "@/lib/time";
import { getStudentMatchesForVolunteer } from "@/lib/matching";
import { googleChatConfigured } from "@/lib/google";
import { Avatar, Badge, EmptyState, PageHeader, ProgressDots, StatCard } from "@/components/ui";
import { SessionCard } from "@/components/session-card";
import { ArrowRight, Book, Chat, Check, Clipboard, Clock, Shield, Sparkles, Target, Users } from "@/components/icons";
import { OctopusMascot } from "@/components/mascots";

export const metadata: Metadata = { title: "Volunteer dashboard" };
export const dynamic = "force-dynamic";

export default async function VolunteerDashboard() {
  const user = await requireRole("volunteer");
  const locale = await getLocale();
  const l = localized(locale);
  const firstName = user.name.split(" ")[0];
  const upcoming = await getUpcomingSessionsForVolunteer(user.id);
  const sessions = await getSessionsForVolunteer(user.id);
  const completed = sessions.filter((session) => session.status === "completed");
  const hours = completed.reduce((sum, session) => sum + session.duration_min, 0) / 60;
  const students = await getVolunteerStudents(user.id);
  const studentSkillScores = new Map(
    await Promise.all(
      students.map(async (student) => [student.id, (await getLatestSkillScores(student.id)).slice(0, 2)] as const),
    ),
  );
  const feedback = await getFeedbackForVolunteer(user.id);
  const needsFeedback = completed.filter((session) => !session.has_feedback);
  const matches = (await getStudentMatchesForVolunteer(user.id)).slice(0, 3);
  const chatReady = googleChatConfigured();
  const feedbackRate = completed.length ? Math.round(((completed.length - needsFeedback.length) / completed.length) * 100) : 100;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={l("Volunteer portal", "Portal del voluntario")}
        title={<>{l("Welcome back", "Bienvenido de nuevo")}, {firstName} 🌟</>}
        sub={l(
          "Your week at a glance: who you're helping, what still needs notes, and the tools that save you time.",
          "Tu semana de un vistazo: a quién ayudas, qué notas faltan y las herramientas que te ahorran tiempo.",
        )}
        actions={
          <>
            <Link href="/volunteer/availability" className="btn btn-white btn-sm"><Clock className="text-sm" /> {l("Availability", "Disponibilidad")}</Link>
            <Link href="/volunteer/sessions" className="btn btn-sage btn-sm">{l("My sessions", "Mis sesiones")} <ArrowRight className="text-sm" /></Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={l("Hours tutored", "Horas de tutoría")} value={hours.toFixed(1)} accent="sage" emoji="⏱️" hint={`${completed.length} ${l("completed sessions", "sesiones completadas")}`} />
        <StatCard label={l("Students supported", "Estudiantes apoyados")} value={students.length} accent="yellow" emoji="🎒" hint={l("All matched through availability", "Conectados por disponibilidad")} />
        <StatCard label={l("Feedback logged", "Comentarios registrados")} value={`${feedbackRate}%`} accent="coral" emoji="📝" hint={`${needsFeedback.length} ${l("sessions need notes", "sesiones necesitan notas")}`} />
        <StatCard label={l("Google Chat alerts", "Alertas de Google Chat")} value={chatReady ? "On" : "Demo"} accent="lilac" emoji="💬" hint={chatReady ? l("Webhook connected", "Webhook conectado") : l("Add webhook in .env", "Agrega el webhook en .env")} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <div className="space-y-5">
          <section>
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="text-base font-extrabold">{l("Your next session", "Tu próxima sesión")}</h2>
              <Link href="/volunteer/sessions" className="text-[11px] font-extrabold text-coral">{l("All sessions", "Todas las sesiones")}</Link>
            </div>
            {upcoming[0] ? (
              <SessionCard session={upcoming[0]} viewer="volunteer" />
            ) : (
              <EmptyState emoji="📅" title={l("No sessions booked yet", "Aún no hay sesiones")} action={<Link href="/volunteer/availability" className="btn btn-sage btn-sm">Open availability</Link>}>
                {l("Students book directly from your open slots.", "Los estudiantes reservan directamente desde tus horarios.")}
              </EmptyState>
            )}
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-base font-extrabold"><Users className="text-base text-sage" /> {l("Students you support", "Estudiantes que apoyas")}</h2>
              <Link href="/volunteer/worksheets" className="text-[11px] font-extrabold text-coral">{l("Send practice", "Enviar práctica")}</Link>
            </div>
            {students.length ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {students.map((student) => {
                  const scores = studentSkillScores.get(student.id) ?? [];
                  return (
                    <div key={student.id} className="rounded-2xl border border-ink/8 bg-white p-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={student.name} color={student.avatar_color} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-extrabold">{student.name}</p>
                          <p className="text-[10px] font-semibold text-ink-soft">{student.completed_sessions} {l("sessions", "sesiones")} · {l("Grade", "Grado")} {student.grade_level}</p>
                        </div>
                        <Chat className="text-sm text-ink-soft" />
                      </div>
                      <div className="mt-2 space-y-1.5">
                        {scores.map((score) => (
                          <div key={score.skill} className="flex items-center justify-between gap-2">
                            <span className="truncate text-[9px] font-bold text-ink-soft">{score.skill}</span>
                            <ProgressDots score={score.score} color={score.score <= 2 ? "coral" : score.score <= 3 ? "yellow" : "sage"} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 text-xs font-semibold text-ink-soft">{l("Your first student appears after a booking.", "Tu primer estudiante aparece después de una reserva.")}</p>
            )}
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-base font-extrabold"><Clipboard className="text-base text-coral" /> {l("Feedback waiting", "Comentarios pendientes")}</h2>
              <span className="rounded-full bg-coral-soft px-2 py-1 text-[9px] font-extrabold text-[#a02727]">{needsFeedback.length}</span>
            </div>
            {needsFeedback.length ? (
              <div className="mt-3 space-y-2">
                {needsFeedback.slice(0, 4).map((session) => (
                  <div key={session.id} className="flex items-center gap-2.5 rounded-xl border border-ink/8 px-3 py-2.5">
                    <Avatar name={session.student_name} color={session.student_color} size="xs" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-extrabold">{session.student_name} · {session.subject}</p>
                      <p className="text-[9px] font-semibold text-ink-soft">{formatDateTime(session.scheduled_at)}</p>
                    </div>
                    <Link href={`/volunteer/sessions?log=${session.id}`} className="btn btn-coral btn-sm !px-3 !py-1.5 text-[9px]">Log</Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 flex items-center gap-1 text-xs font-bold text-sage"><Check className="text-sm" /> {l("All caught up — thank you!", "¡Todo al día — gracias!")}</p>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-[28px] border border-ink/10 bg-sage-soft/70 p-5">
            <OctopusMascot size={78} className="absolute -right-2 -top-3 opacity-80" />
            <Badge color="sage">{l("Quick tools", "Herramientas rápidas")}</Badge>
            <div className="mt-3 grid gap-2">
              {[
                { href: "/volunteer/availability", icon: <Clock className="text-base" />, label: l("Availability grid", "Cuadrícula de horarios"), detail: l("Open more slots = more matches", "Más horarios = más conexiones") },
                { href: "/volunteer/lessons", icon: <Book className="text-base" />, label: l("Lesson library", "Biblioteca de lecciones"), detail: l("8 ready-to-teach plans", "8 planes listos") },
                { href: "/volunteer/worksheets", icon: <Clipboard className="text-base" />, label: l("Worksheet builder", "Creador de hojas"), detail: l("Send questions + answer key", "Envía preguntas + respuestas") },
              ].map((tool) => (
                <Link key={tool.href} href={tool.href} className="flex items-center gap-2.5 rounded-xl bg-white/80 px-3 py-2.5 transition hover:bg-white">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-sage-soft text-[#52622f]">{tool.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-extrabold">{tool.label}</span>
                    <span className="block text-[9px] font-semibold text-ink-soft">{tool.detail}</span>
                  </span>
                  <ArrowRight className="text-sm text-ink-soft" />
                </Link>
              ))}
            </div>
          </div>

          <section className="card p-5">
            <h2 className="flex items-center gap-1.5 text-base font-extrabold"><Target className="text-base text-coral" /> {l("Students looking for you", "Estudiantes buscando apoyo")}</h2>
            <p className="mt-1 text-[10px] font-semibold text-ink-soft">{l("Ranked by shared subjects and availability.", "Ordenados por materias y horarios compartidos.")}</p>
            <div className="mt-3 space-y-2">
              {matches.map((match) => (
                <div key={match.student.id} className="flex items-center gap-2.5 rounded-xl border border-ink/8 px-2.5 py-2">
                  <Avatar name={match.student.name} color={match.student.avatar_color} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-extrabold">{match.student.name}</p>
                    <p className="truncate text-[9px] font-semibold text-ink-soft">{match.sharedSubjects.join(" · ")} · {match.matchPercent}% fit</p>
                  </div>
                  {match.student.grade_level ? <span className="rounded-full bg-cream px-1.5 py-0.5 text-[8px] font-extrabold text-ink-soft">G{match.student.grade_level}</span> : null}
                </div>
              ))}
              {matches.length === 0 ? <p className="text-xs font-semibold text-ink-soft">{l("No overlapping needs yet.", "Aún no hay necesidades coincidentes.")}</p> : null}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="flex items-center gap-1.5 text-base font-extrabold"><Sparkles className="text-base text-yellow" /> {l("Recent notes you wrote", "Notas recientes")}</h2>
            <div className="mt-3 space-y-2.5">
              {feedback.slice(0, 2).map((note) => (
                <div key={note.id} className="rounded-xl bg-cream/70 px-3 py-2.5">
                  <p className="text-[10px] font-extrabold">{note.student_name} · {note.subject}</p>
                  <p className="mt-0.5 line-clamp-2 text-[10px] font-semibold leading-relaxed text-ink-soft">{note.summary}</p>
                </div>
              ))}
              {feedback.length === 0 ? <p className="text-[11px] font-semibold text-ink-soft">Your session notes will appear here.</p> : null}
            </div>
          </section>

          <div className="rounded-3xl border border-ink/10 bg-yellow-soft/50 p-4">
            <p className="flex items-center gap-1.5 text-xs font-extrabold"><Shield className="text-sm text-[#7a5a0c]" /> {l("You're a mandated reporter", "Eres un reportero obligatorio")}</p>
            <p className="mt-1 text-[10px] font-semibold leading-relaxed text-ink-soft">
              {l(
                "If a student discloses harm, use the admin safety alert. Do not investigate alone.",
                "Si un estudiante revela daño, usa la alerta de seguridad. No investigues solo.",
              )}
            </p>
            <Link href="/volunteer/messages" className="mt-2 inline-flex items-center gap-1 text-[10px] font-extrabold text-coral">
              Message the safety team <ArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
