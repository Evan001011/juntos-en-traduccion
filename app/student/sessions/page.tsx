import Link from "next/link";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getFeedbackForStudent, getSessionsForStudent } from "@/lib/data";
import { getLocale, localized } from "@/lib/locale";
import { formatDateTime, nowLocalISO } from "@/lib/time";
import { EmptyState, PageHeader } from "@/components/ui";
import { SessionCard } from "@/components/session-card";
import { Calendar, Check, Clipboard, Target } from "@/components/icons";

export const metadata: Metadata = { title: "My sessions" };
export const dynamic = "force-dynamic";

export default async function StudentSessionsPage() {
  const user = await requireRole("student");
  const locale = await getLocale();
  const l = localized(locale);
  const sessions = await getSessionsForStudent(user.id);
  const now = nowLocalISO();
  const upcoming = sessions.filter((s) => s.status === "scheduled" && s.scheduled_at >= now).sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  const past = sessions.filter((s) => s.status === "completed" || s.scheduled_at < now).sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at));
  const notes = await getFeedbackForStudent(user.id);
  const totalMinutes = past.filter((s) => s.status === "completed").reduce((sum, s) => sum + s.duration_min, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={l("Your calendar", "Tu calendario")}
        title={l("Sessions", "Sesiones")}
        sub={l(
          "Join from Google Meet, open the shared room, or add the invite to your own calendar.",
          "Únete por Google Meet, abre la sala compartida o agrega la invitación a tu calendario.",
        )}
        actions={<Link href="/student/find" className="btn btn-coral btn-sm">Book another session</Link>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink/10 bg-coral-soft/70 px-4 py-3">
          <p className="text-2xl font-extrabold text-[#a02727]">{upcoming.length}</p>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">Upcoming</p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-sage-soft/70 px-4 py-3">
          <p className="text-2xl font-extrabold text-[#52622f]">{past.filter((s) => s.status === "completed").length}</p>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">Completed</p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-yellow-soft/70 px-4 py-3">
          <p className="text-2xl font-extrabold text-[#7a5a0c]">{(totalMinutes / 60).toFixed(1)}h</p>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">Learning time logged</p>
        </div>
      </div>

      <section>
        <h2 className="mb-2.5 flex items-center gap-1.5 text-base font-extrabold"><Calendar className="text-base text-coral" /> {l("Coming up", "Próximamente")}</h2>
        {upcoming.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {upcoming.map((session) => <SessionCard key={session.id} session={session} viewer="student" />)}
          </div>
        ) : (
          <EmptyState emoji="🗓️" title={l("Nothing scheduled right now", "Nada agendado ahora")} action={<Link href="/student/find" className="btn btn-coral btn-sm">Find a tutor</Link>}>
            {l("Book a free 45-minute session that fits your week.", "Reserva una sesión gratuita de 45 minutos que quepa en tu semana.")}
          </EmptyState>
        )}
      </section>

      <section>
        <h2 className="mb-2.5 flex items-center gap-1.5 text-base font-extrabold"><Clipboard className="text-base text-sage" /> {l("Session history", "Historial de sesiones")}</h2>
        {past.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {past.map((session) => <SessionCard key={session.id} session={session} viewer="student" compact />)}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-ink/15 px-4 py-5 text-xs font-semibold text-ink-soft">
            {l("Your completed sessions will collect here, along with your tutor's notes.", "Tus sesiones completadas se guardarán aquí, junto con las notas de tu tutor.")}
          </p>
        )}
      </section>

      {notes.length ? (
        <section className="card p-5">
          <h2 className="flex items-center gap-1.5 text-base font-extrabold"><Target className="text-base text-coral" /> {l("Tutor notes & next steps", "Notas del tutor y próximos pasos")}</h2>
          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="rounded-2xl border border-ink/8 bg-cream/60 p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-extrabold">{note.volunteer_name} · {note.subject}</p>
                  <span className="text-[10px] font-semibold text-ink-soft">{formatDateTime(note.scheduled_at)}</span>
                </div>
                <p className="mt-1.5 text-[13px] font-semibold leading-relaxed text-ink-soft">{note.summary}</p>
                {note.homework ? <p className="mt-2 text-[11px] font-bold text-[#7a5a0c]"><Check className="mr-1 inline text-xs" /> {note.homework}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
