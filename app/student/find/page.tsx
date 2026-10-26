import Link from "next/link";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getAvailability, getUpcomingSessionsForStudent } from "@/lib/data";
import { getVolunteerMatches } from "@/lib/matching";
import { getLocale, localized } from "@/lib/locale";
import { DAY_SHORT, SUBJECTS, TZ_LABEL } from "@/lib/constants";
import { minutesLabel } from "@/lib/time";
import { Avatar, Badge, EmptyState, PageHeader } from "@/components/ui";
import { BookingSlots } from "@/components/booking-slots";
import { Calendar, Check, Clock, Search, Sparkles, Target, Users, Globe } from "@/components/icons";
import { StarMascot } from "@/components/mascots";

export const metadata: Metadata = { title: "Find a tutor" };
export const dynamic = "force-dynamic";

export default async function FindTutorPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const user = await requireRole("student");
  const { subject } = await searchParams;
  const locale = await getLocale();
  const l = localized(locale);

  const matches = await getVolunteerMatches(user.id);
  const filtered = subject && subject !== "All" ? matches.filter((m) => m.volunteer.subjects.includes(subject)) : matches;
  const availability = await getAvailability(user.id);
  const upcoming = await getUpcomingSessionsForStudent(user.id);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={l("Smart matching", "Conexión inteligente")}
        title={l("Find your fit.", "Encuentra tu match.")}
        sub={l(
          "No endless profiles. We rank tutors by subject overlap, shared free time, language and history — then show only slots that fit both calendars.",
          "Sin perfiles infinitos. Ordenamos a los tutores por materias, horarios compartidos, idioma e historial — y mostramos solo horarios que encajan en ambos calendarios.",
        )}
        actions={
          <Link href="/student/availability" className="btn btn-white btn-sm">
            <Clock className="text-sm" /> {l("Edit my availability", "Editar mi disponibilidad")}
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">
          <Target className="text-xs" /> Subject
        </span>
        <Link href="/student/find" className={`chip ${!subject || subject === "All" ? "chip-active" : ""}`}>All</Link>
        {SUBJECTS.map((item) => (
          <Link key={item} href={`/student/find?subject=${encodeURIComponent(item)}`} className={`chip ${subject === item ? "chip-active" : ""}`}>
            {item}
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <EmptyState emoji="🔎" title={l("No tutors in this subject yet", "Aún no hay tutores en esta materia")}>
              {l("Try another subject or clear the filter. New volunteers join every month.", "Prueba otra materia o quita el filtro. Se unen nuevos voluntarios cada mes.")}
            </EmptyState>
          ) : (
            filtered.map((match, index) => (
              <div key={match.volunteer.id} className={`card overflow-hidden ${index === 0 ? "ring-2 ring-coral/25" : ""}`}>
                {index === 0 ? (
                  <div className="flex items-center gap-2 bg-coral-soft/80 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#a02727]">
                    <Sparkles className="text-sm" /> {l("Best overall fit for you", "La mejor opción para ti")}
                  </div>
                ) : null}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="relative">
                      <Avatar name={match.volunteer.name} color={match.volunteer.avatar_color} size="lg" />
                      <span className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-sage px-1.5 py-0.5 text-[8px] font-extrabold text-white">✓</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h2 className="text-lg font-extrabold">{match.volunteer.name}</h2>
                        <Badge color="sage">{match.matchPercent}% {l("match", "afinidad")}</Badge>
                        {match.sessionsTogether > 0 ? <Badge color="yellow">{match.sessionsTogether} {l("sessions together", "sesiones juntos")}</Badge> : null}
                      </div>
                      <p className="mt-0.5 text-[11px] font-semibold text-ink-soft">
                        {match.volunteer.grade_level && match.volunteer.grade_level >= 13
                          ? l("College volunteer", "Voluntario universitario")
                          : `${l("Grade", "Grado")} ${match.volunteer.grade_level}`} · {match.volunteer.languages.split(",").map((code) => (code === "es" ? "Español" : "English")).join(" + ")}
                      </p>
                      {match.volunteer.bio ? <p className="mt-2 text-xs font-semibold leading-relaxed text-ink-soft">“{match.volunteer.bio}”</p> : null}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {match.volunteer.subjects.map((sub) => (
                          <Badge key={sub} color={match.sharedSubjects.includes(sub) ? "coral" : "blue"}>{sub}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="hidden shrink-0 sm:block">
                      <div
                        className="grid h-16 w-16 place-items-center rounded-full"
                        style={{ background: `conic-gradient(#9BB068 ${match.matchPercent}%, #efe9dc 0)` }}
                      >
                        <div className="grid h-[52px] w-[52px] place-items-center rounded-full bg-white text-[13px] font-extrabold">{match.matchPercent}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-2xl bg-cream px-3 py-2 text-[10px] font-bold text-ink-soft">
                    <span className="inline-flex items-center gap-1"><Check className="text-xs text-sage" /> {match.reason}</span>
                    {match.overlapMinutes > 0 ? (
                      <span className="inline-flex items-center gap-1"><Clock className="text-xs" /> {(match.overlapMinutes / 60).toFixed(1)}h {l("shared per week", "compartidas por semana")}</span>
                    ) : null}
                    <span className="inline-flex items-center gap-1"><Globe className="text-xs" /> {match.volunteer.languages.split(",").includes("es") && user.languages.includes("es") ? l("Spanish-friendly", "Compatible con español") : l("English-friendly", "Compatible con inglés")}</span>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-ink-soft">
                      <Calendar className="text-sm" /> {l("Open slots that fit you both", "Horarios que les sirven a ambos")}
                      <span className="ml-auto text-[9px] font-bold normal-case tracking-normal text-sage">● {l("live availability", "disponibilidad en vivo")}</span>
                    </p>
                    {match.slots.length ? (
                      <BookingSlots volunteerId={match.volunteer.id} slots={match.slots} subjects={match.sharedSubjects.length ? match.sharedSubjects : match.volunteer.subjects.slice(0, 2)} />
                    ) : (
                      <div className="rounded-xl border border-dashed border-ink/15 bg-cream/60 px-3 py-3 text-[11px] font-semibold text-ink-soft">
                        {l(
                          "No overlapping free time this week. Add more availability and we'll re-match instantly.",
                          "No hay horarios libres en común esta semana. Agrega más disponibilidad y volveremos a conectar al instante.",
                        )}{" "}
                        <Link href="/student/availability" className="font-extrabold text-coral">{l("Update mine", "Actualizar la mía")}</Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="space-y-4">
          <div className="card overflow-hidden">
            <div className="bg-yellow-soft px-4 py-3">
              <p className="flex items-center gap-1.5 text-sm font-extrabold"><StarMascot size={22} /> {l("Your matching profile", "Tu perfil de conexión")}</p>
            </div>
            <div className="p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">{l("Subjects you need", "Materias que necesitas")}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {user.needs.length ? user.needs.map((need) => <Badge key={need} color="coral">{need}</Badge>) : <span className="text-[11px] font-semibold text-ink-soft">Add a subject from your profile.</span>}
              </div>
              <p className="mt-4 text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">{l("Your free time", "Tu tiempo libre")}</p>
              <div className="mt-1.5 space-y-1">
                {availability.length ? availability.map((block) => (
                  <div key={block.id} className="flex items-center justify-between rounded-lg bg-cream px-2.5 py-1.5 text-[10px] font-bold">
                    <span>{DAY_SHORT[block.day_of_week]}</span>
                    <span className="text-ink-soft">{minutesLabel(block.start_min)} – {minutesLabel(block.end_min)}</span>
                  </div>
                )) : <p className="text-[11px] font-semibold text-ink-soft">No availability saved yet.</p>}
              </div>
              <Link href="/student/availability" className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold text-coral">
                <Clock className="text-sm" /> {l("Adjust availability", "Ajustar disponibilidad")}
              </Link>
              <p className="mt-2 text-[9px] font-semibold text-ink-soft">All times shown in {TZ_LABEL}.</p>
            </div>
          </div>

          <div className="card p-4">
            <p className="flex items-center gap-1.5 text-sm font-extrabold"><Search className="text-base text-coral" /> {l("How the score works", "Cómo funciona la puntuación")}</p>
            <ul className="mt-2.5 space-y-2 text-[11px] font-semibold leading-relaxed text-ink-soft">
              <li className="flex gap-2"><span className="font-extrabold text-coral">01</span> {l("Subject overlap with your learning needs", "Coincidencia con tus materias")}</li>
              <li className="flex gap-2"><span className="font-extrabold text-coral">02</span> {l("Minutes of shared weekly availability", "Minutos de disponibilidad compartida")}</li>
              <li className="flex gap-2"><span className="font-extrabold text-coral">03</span> {l("Shared language for clearer explanations", "Idioma compartido para explicar mejor")}</li>
              <li className="flex gap-2"><span className="font-extrabold text-coral">04</span> {l("History of sessions together", "Historial de sesiones juntos")}</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-ink/10 bg-sky-soft/60 p-4">
            <p className="flex items-center gap-1.5 text-xs font-extrabold"><Users className="text-sm" /> {l("Already booked", "Ya reservado")}</p>
            <p className="mt-1 text-[11px] font-semibold text-ink-soft">
              {upcoming.length
                ? `${upcoming.length} upcoming session${upcoming.length > 1 ? "s" : ""} on your calendar.`
                : l("Your first booking unlocks the session room and translator.", "Tu primera reserva desbloquea la sala de sesión y el traductor.")}
            </p>
            <Link href="/student/sessions" className="mt-2 inline-flex items-center gap-1 text-[11px] font-extrabold text-coral">
              {l("View my sessions", "Ver mis sesiones")} →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
