import Link from "next/link";
import { Avatar, Badge } from "./ui";
import { Calendar, Check, Chat, Clock, Download, External, Video } from "./icons";
import type { SessionWithPeople } from "@/lib/data";
import { formatDate, formatTime, googleCalendarUrl, relativeDay } from "@/lib/time";
import { googleMeetLink } from "@/lib/google";

export function SessionCard({
  session,
  viewer,
  compact = false,
}: {
  session: SessionWithPeople;
  viewer: "student" | "volunteer" | "admin";
  compact?: boolean;
}) {
  const other =
    viewer === "student"
      ? { name: session.volunteer_name, color: session.volunteer_color, label: "Tutor" }
      : viewer === "volunteer"
        ? { name: session.student_name, color: session.student_color, label: "Student" }
        : { name: `${session.student_name} + ${session.volunteer_name}`, color: session.student_color, label: "Pair" };
  const isUpcoming = session.status === "scheduled";
  const meet = googleMeetLink(session.meeting_link);
  const calendarUrl = googleCalendarUrl({
    title: `Juntos tutoring · ${session.subject}`,
    details: `Tutoring session for ${session.student_name} with ${session.volunteer_name}.\nJoin: ${meet}`,
    location: meet,
    startISO: session.scheduled_at,
    durationMin: session.duration_min,
  });

  return (
    <div className={`card-hover card flex flex-col gap-4 ${compact ? "p-4" : "p-4 sm:p-5"}`}>
      <div className="flex items-start gap-3">
        <div className="grid w-[62px] shrink-0 place-items-center rounded-2xl border border-ink/10 bg-cream py-2">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-ink-soft">{relativeDay(session.scheduled_at)}</span>
          <span className="mt-0.5 text-sm font-extrabold">{formatDate(session.scheduled_at).replace(",", "")}</span>
          <span className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-bold text-ink-soft">
            <Clock className="text-[10px]" /> {formatTime(session.scheduled_at)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge color={isUpcoming ? "coral" : session.status === "completed" ? "sage" : "lilac"}>
              {session.status === "scheduled" ? "Upcoming" : session.status === "completed" ? "Completed" : "Cancelled"}
            </Badge>
            <Badge color="yellow">{session.subject}</Badge>
            {!session.meeting_link ? <Badge color="pink">Link pending</Badge> : null}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Avatar name={other.name} color={other.color} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">{other.name}</p>
              <p className="text-[10px] font-semibold text-ink-soft">
                {other.label} · {session.duration_min} min · ET
              </p>
            </div>
          </div>
        </div>
      </div>

      {session.status === "completed" && session.has_feedback ? (
        <div className="flex items-center gap-1.5 rounded-xl bg-sage-soft/60 px-3 py-2 text-[11px] font-bold text-[#52622f]">
          <Check className="text-xs" /> Session notes and skill ratings are on file
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {isUpcoming ? (
          <>
            <a href={meet} target="_blank" rel="noreferrer" className="btn btn-coral btn-sm">
              <Video className="text-sm" /> Join Meet
            </a>
            <Link href={`/session/${session.id}`} className="btn btn-white btn-sm">
              <Chat className="text-sm" /> Room
            </Link>
            <a href={calendarUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" title="Add to Google Calendar">
              <Calendar className="text-sm" /> Calendar
            </a>
            <a href={`/api/calendar/${session.id}`} className="btn btn-ghost btn-sm" title="Download .ics">
              <Download className="text-sm" />
            </a>
          </>
        ) : (
          <>
            <Link href={`/session/${session.id}`} className="btn btn-white btn-sm">
              <Chat className="text-sm" /> Session room
            </Link>
            {viewer === "volunteer" && !session.has_feedback ? (
              <Link href={`/volunteer/sessions?log=${session.id}`} className="btn btn-coral btn-sm">
                <Check className="text-sm" /> Log feedback
              </Link>
            ) : null}
            {viewer === "volunteer" && session.has_feedback ? (
              <span className="btn btn-ghost btn-sm text-sage">
                <Check className="text-sm" /> Feedback logged
              </span>
            ) : null}
          </>
        )}
        <a href={meet} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-ink-soft hover:text-coral">
          Google Meet <External className="text-xs" />
        </a>
      </div>
    </div>
  );
}
