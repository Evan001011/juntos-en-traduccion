import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getFeedbackForSession, getSession, getSessionChat } from "@/lib/data";
import { getLocale, localized } from "@/lib/locale";
import { formatDateTime, formatTime, googleCalendarUrl } from "@/lib/time";
import { googleMeetLink } from "@/lib/google";
import { Avatar, Badge } from "@/components/ui";
import { SessionChat } from "@/components/session-chat";
import { TranslatorPanel } from "@/components/translator";
import { ArrowLeft, Calendar, Check, Clock, Download, External, Lock, Shield, Sparkles, Video } from "@/components/icons";
import { StarMascot } from "@/components/mascots";

export const metadata: Metadata = { title: "Session room" };
export const dynamic = "force-dynamic";

export default async function SessionRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const current = await getCurrentUser();
  if (!current) redirect("/login");
  const { id } = await params;
  const session = await getSession(Number(id));
  if (!session) notFound();
  const isParticipant = current.role === "admin" || current.id === session.student_id || current.id === session.volunteer_id;
  if (!isParticipant) notFound();

  const locale = await getLocale();
  const l = localized(locale);
  const feedback = await getFeedbackForSession(session.id);
  const chat = await getSessionChat(session.id);
  const meet = googleMeetLink(session.meeting_link);
  const calendarUrl = googleCalendarUrl({
    title: `Juntos tutoring · ${session.subject}`,
    details: `Tutoring session with ${session.student_name} and ${session.volunteer_name}. Join: ${meet}`,
    location: meet,
    startISO: session.scheduled_at,
    durationMin: session.duration_min,
  });
  const viewer = current.id === session.student_id ? "student" : current.id === session.volunteer_id ? "volunteer" : "admin";
  const backHref = viewer === "student" ? "/student/sessions" : viewer === "volunteer" ? "/volunteer/sessions" : "/admin/safety";

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href={backHref} className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-ink-soft hover:text-coral">
            <ArrowLeft className="text-sm" /> {l("Back to sessions", "Volver a sesiones")}
          </Link>
          <div className="flex items-center gap-2">
            <Badge color={session.status === "completed" ? "sage" : "coral"}>
              {session.status === "completed" ? "Completed" : "Live room"}
            </Badge>
            <Badge color="yellow">{session.subject}</Badge>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ink-soft"><Lock className="text-xs" /> Private session</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold leading-tight">
              {l("Session room", "Sala de sesión")}
            </h1>
            <p className="mt-1 text-sm font-semibold text-ink-soft">{formatDateTime(session.scheduled_at)} · {session.duration_min} min · ET</p>
          </div>
          <div className="flex items-center gap-2">
            <Avatar name={session.student_name} color={session.student_color} size="sm" />
            <div className="text-[10px] font-bold leading-tight">
              <p>{session.student_name}</p>
              <p className="font-semibold text-ink-soft">Student</p>
            </div>
            <span className="px-1 text-ink-soft">+</span>
            <Avatar name={session.volunteer_name} color={session.volunteer_color} size="sm" />
            <div className="text-[10px] font-bold leading-tight">
              <p>{session.volunteer_name}</p>
              <p className="font-semibold text-ink-soft">Tutor</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-[30px] border border-ink/10 bg-ink p-6 text-cream">
              <div className="pointer-events-none absolute -bottom-10 -right-10 opacity-20"><StarMascot size={240} /></div>
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-cream/80">
                  <Video className="text-xs" /> Google Meet
                </span>
                <h2 className="mt-3 text-2xl font-semibold leading-tight">
                  {session.status === "completed" ? l("Session complete — nice work.", "Sesión completa — buen trabajo.") : l("Your room is ready.", "Tu sala está lista.")}
                </h2>
                <p className="mt-1.5 max-w-md text-xs font-semibold leading-relaxed text-cream/70">
                  {l(
                    "Open Google Meet for video, and use the translator and room chat on this page for extra support.",
                    "Abre Google Meet para el video y usa el traductor y el chat de la sala en esta página para apoyo extra.",
                  )}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a href={meet} target="_blank" rel="noreferrer" className="btn btn-yellow">
                    <Video className="text-base" /> {session.status === "completed" ? l("Rejoin Meet", "Volver a Meet") : l("Join Google Meet", "Entrar a Google Meet")}
                  </a>
                  <a href={calendarUrl} target="_blank" rel="noreferrer" className="btn btn-white">
                    <Calendar className="text-base" /> {l("Add to calendar", "Agregar al calendario")}
                  </a>
                  <a href={`/api/calendar/${session.id}`} className="btn btn-white" title="Download .ics">
                    <Download className="text-base" />
                  </a>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-bold text-cream/70">
                  <span className="inline-flex items-center gap-1"><Clock className="text-xs" /> {formatTime(session.scheduled_at)} start</span>
                  <span className="inline-flex items-center gap-1"><Shield className="text-xs text-sage" /> Admin-monitored room</span>
                  <span className="inline-flex items-center gap-1"><Sparkles className="text-xs text-yellow" /> Translator on the right</span>
                </div>
              </div>
            </div>

            {feedback ? (
              <div className="card p-5">
                <p className="flex items-center gap-1.5 text-sm font-extrabold"><Check className="text-base text-sage" /> {l("Session notes", "Notas de la sesión")}</p>
                <p className="mt-2 text-[13px] font-semibold leading-relaxed text-ink-soft">{feedback.summary}</p>
                {feedback.homework ? (
                  <p className="mt-2.5 rounded-xl bg-yellow-soft/60 px-3 py-2 text-[11px] font-bold text-[#7a5a0c]">Take-home practice: {feedback.homework}</p>
                ) : null}
                <p className="mt-2 text-[10px] font-semibold text-ink-soft/70">Logged by {session.volunteer_name}. Skill scores update the student's learning plan automatically.</p>
              </div>
            ) : (
              <div className="card p-5">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-sm font-extrabold"><Calendar className="text-base text-coral" /> {l("45-minute session flow", "Flujo de 45 minutos")}</p>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-ink-soft">{l("Suggested", "Sugerido")}</span>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {[
                    ["5 min", "Warm-up & check-in", "Calentamiento"],
                    ["15 min", "Mini-lesson on the focus skill", "Mini-lección"],
                    ["15 min", "Guided practice together", "Práctica guiada"],
                    ["10 min", "Wrap-up + next step", "Cierre + próximo paso"],
                  ].map(([time, label, labelEs]) => (
                    <div key={label} className="flex items-center gap-2.5 rounded-xl bg-cream px-3 py-2.5">
                      <span className="rounded-full bg-white px-2 py-1 text-[9px] font-extrabold text-ink-soft">{time}</span>
                      <span className="text-[11px] font-bold">{l(label, labelEs)}</span>
                    </div>
                  ))}
                </div>
                {viewer === "volunteer" && session.status !== "completed" ? (
                  <Link href={`/volunteer/sessions?log=${session.id}`} className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold text-coral">
                    Log feedback after the session <External className="text-xs" />
                  </Link>
                ) : null}
              </div>
            )}

            <div className="rounded-3xl border border-ink/10 bg-sky-soft/60 px-4 py-3">
              <p className="flex items-start gap-1.5 text-[10px] font-semibold leading-relaxed text-ink-soft">
                <Shield className="mt-0.5 shrink-0 text-sm text-[#326176]" />
                {l(
                  "This room is part of the Juntos safety system. Contact details are filtered from chat and flagged messages go to a human admin. Never share personal information.",
                  "Esta sala es parte del sistema de seguridad de Juntos. Los datos de contacto se filtran del chat y los mensajes marcados llegan a un administrador. Nunca compartas información personal.",
                )}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card overflow-hidden">
              <TranslatorPanel maxHeight="480px" />
            </div>
            <SessionChat
              sessionId={session.id}
              meId={current.id}
              myLang={current.languages}
              initialMessages={chat.map((message) => ({
                id: message.id,
                sender_id: message.sender_id,
                sender_name: message.sender_name,
                avatar_color: message.avatar_color,
                body: message.body,
                translated_body: message.translated_body,
                translated_lang: message.translated_lang,
                created_at: message.created_at,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
