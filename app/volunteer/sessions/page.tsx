import Link from "next/link";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getLatestSkillScores, getSessionsForVolunteer } from "@/lib/data";
import { getLocale, localized } from "@/lib/locale";
import { formatDateTime, nowLocalISO } from "@/lib/time";
import { SKILLS_BY_SUBJECT } from "@/lib/constants";
import { EmptyState, PageHeader } from "@/components/ui";
import { SessionCard } from "@/components/session-card";
import { FeedbackForm } from "@/components/feedback-form";
import { Clipboard, Sparkles } from "@/components/icons";

export const metadata: Metadata = { title: "Volunteer sessions" };
export const dynamic = "force-dynamic";

export default async function VolunteerSessionsPage({ searchParams }: { searchParams: Promise<{ log?: string }> }) {
  const user = await requireRole("volunteer");
  const { log } = await searchParams;
  const locale = await getLocale();
  const l = localized(locale);
  const sessions = await getSessionsForVolunteer(user.id);
  const now = nowLocalISO();
  const upcoming = sessions.filter((session) => session.status === "scheduled" && session.scheduled_at >= now).sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  const completed = sessions.filter((session) => session.status === "completed").sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at));
  const needsFeedback = completed.filter((session) => !session.has_feedback);
  const logId = Number(log);
  const logSession = needsFeedback.find((session) => session.id === logId);

  const skillOptionsFor = async (studentId: number, subject: string) => {
    const weak = (await getLatestSkillScores(studentId)).filter((skill) => skill.score <= 3).map((skill) => skill.skill);
    const subjectSkills = SKILLS_BY_SUBJECT[subject] || [];
    return Array.from(new Set([...subjectSkills, ...weak, "Study Skills"])).slice(0, 4);
  };

  const skillOptionsBySession = new Map(
    await Promise.all(
      [...completed, ...(logSession ? [logSession] : [])].map(
        async (session) => [session.id, await skillOptionsFor(session.student_id, session.subject)] as const,
      ),
    ),
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={l("Teaching hub", "Centro de enseñanza")}
        title={l("Sessions & feedback", "Sesiones y comentarios")}
        sub={l(
          "Join the room, then capture what changed in under a minute. Every rating updates the student's plan.",
          "Únete a la sala y registra lo que cambió en menos de un minuto. Cada nota actualiza el plan del estudiante.",
        )}
        actions={<Link href="/volunteer/availability" className="btn btn-sage btn-sm">{l("Open more slots", "Abrir más horarios")}</Link>}
      />

      {logSession ? (
        <FeedbackForm
          sessionId={logSession.id}
          studentName={logSession.student_name}
          studentColor={logSession.student_color}
          subject={logSession.subject}
          dateLabel={formatDateTime(logSession.scheduled_at)}
          skillOptions={skillOptionsBySession.get(logSession.id) ?? []}
          autoOpen
        />
      ) : null}

      {needsFeedback.length ? (
        <section className="rounded-3xl border border-yellow/40 bg-yellow-soft/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-extrabold"><Clipboard className="text-base text-[#7a5a0c]" /> {needsFeedback.length} session{needsFeedback.length > 1 ? "s" : ""} need notes</p>
              <p className="mt-0.5 text-[10px] font-semibold text-ink-soft">Feedback closes the loop and updates the student's learning plan.</p>
            </div>
            <Link href={`/volunteer/sessions?log=${needsFeedback[0].id}`} className="btn btn-yellow btn-sm">
              <Sparkles className="text-sm" /> Log the next one
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {needsFeedback.map((session) => (
              <Link key={session.id} href={`/volunteer/sessions?log=${session.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3 py-1.5 text-[10px] font-bold">
                {session.student_name.split(" ")[0]} · {formatDateTime(session.scheduled_at)}
                <span className="rounded-full bg-coral-soft px-1.5 py-0.5 text-[8px] font-extrabold text-[#a02727]">Log</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-2.5 text-base font-extrabold">{l("Coming up", "Próximamente")}</h2>
        {upcoming.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {upcoming.map((session) => <SessionCard key={session.id} session={session} viewer="volunteer" />)}
          </div>
        ) : (
          <EmptyState emoji="📅" title={l("No sessions booked", "No hay sesiones reservadas")} action={<Link href="/volunteer/availability" className="btn btn-sage btn-sm">Add availability</Link>}>
            {l("Students book from the slots you open.", "Los estudiantes reservan desde tus horarios abiertos.")}
          </EmptyState>
        )}
      </section>

      <section>
        <h2 className="mb-2.5 text-base font-extrabold">{l("History", "Historial")}</h2>
        {completed.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {completed.map((session) => (
              <div key={session.id} className="space-y-2">
                <SessionCard session={session} viewer="volunteer" compact />
                {!session.has_feedback ? (
                  <FeedbackForm
                    sessionId={session.id}
                    studentName={session.student_name}
                    studentColor={session.student_color}
                    subject={session.subject}
                    dateLabel={formatDateTime(session.scheduled_at)}
                    skillOptions={skillOptionsBySession.get(session.id) ?? []}
                  />
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-ink/15 px-4 py-5 text-xs font-semibold text-ink-soft">
            {l("Completed sessions appear here with their feedback status.", "Las sesiones completadas aparecen aquí con el estado de sus comentarios.")}
          </p>
        )}
      </section>
    </div>
  );
}
