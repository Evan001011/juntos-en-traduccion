import Link from "next/link";
import type { CSSProperties } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Avatar, Badge, RainbowText, SectionHeading, Squiggle, Sticker, StatCard } from "@/components/ui";
import { HeartMascot, OctopusMascot, StarMascot, SunMascot } from "@/components/mascots";
import { ArrowRight, Book, Calendar, Chat, Check, Clipboard, Globe, Heart, Lock, Play, Shield, Sparkles, Star, Target, Video } from "@/components/icons";
import { getLocale, localized } from "@/lib/locale";
import { getAdminMetrics, getApprovedVolunteers, getPlatformStats } from "@/lib/data";
import { TranslatorPanel } from "@/components/translator";

export const dynamic = "force-dynamic";

function MiniCalendarCard() {
  return (
    <div className="absolute -bottom-4 left-2 w-[205px] rotate-[-5deg] rounded-3xl border border-ink/10 bg-white p-3 shadow-[0_8px_20px_rgba(48,42,37,0.14)] sm:-left-6">
      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">
        <Calendar className="text-xs text-coral" /> Next session
      </div>
      <p className="mt-1 text-xs font-extrabold">Mon · 4:30 PM</p>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="rounded-full bg-sage-soft px-2 py-0.5 text-[9px] font-extrabold text-[#52622f]">Calendar synced</span>
        <span className="rounded-full bg-coral-soft px-2 py-0.5 text-[9px] font-extrabold text-[#a02727]">ES ⇄ EN</span>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const locale = await getLocale();
  const l = localized(locale);
  const stats = await getPlatformStats();
  const metrics = await getAdminMetrics();
  const volunteers = await getApprovedVolunteers();

  const faqs: Array<[string, string]> = [
    [
      l("Is it really free?", "¿Realmente es gratis?"),
      l(
        "Yes. Juntos is a student-led community program. There is no fee for students or families, and no paid tier hiding the good stuff.",
        "Sí. Juntos es un programa comunitario liderado por estudiantes. No hay costo para estudiantes ni familias, y no hay versión de pago escondiendo lo mejor.",
      ),
    ],
    [
      l("How do you keep students safe?", "¿Cómo protegen a los estudiantes?"),
      l(
        "Students need guardian approval to join. Volunteers are approved by an admin. Every message is scanned for phone numbers, emails and social handles, and flagged conversations go to a human safety review.",
        "Los estudiantes necesitan la aprobación de un tutor legal. Los voluntarios son aprobados por un administrador. Cada mensaje se revisa buscando teléfonos, correos y redes, y las conversaciones marcadas llegan a una revisión humana.",
      ),
    ],
    [
      l("Who are the volunteers?", "¿Quiénes son los voluntarios?"),
      l(
        "Local high-school and college students who apply, share their subject strengths, and are approved by our program team. You can see their languages, subjects and availability before booking.",
        "Estudiantes locales de secundaria y universidad que aplican, comparten sus materias fuertes y son aprobados por nuestro equipo. Puedes ver idiomas, materias y disponibilidad antes de reservar.",
      ),
    ],
    [
      l("What if my family speaks Spanish at home?", "¿Y si mi familia habla español en casa?"),
      l(
        "Then you are exactly who we built this for. Bilingual volunteers, a floating translator on every page, and a side-panel translator during meetings keep everyone in the conversation.",
        "Entonces eres exactamente para quien lo construimos. Voluntarios bilingües, un traductor flotante en cada página y un panel lateral durante las reuniones mantienen a todos en la conversación.",
      ),
    ],
    [
      l("What if our internet is unreliable?", "¿Y si nuestro internet es inestable?"),
      l(
        "Every learning deck can become an offline kit, and worksheets print cleanly. The translator also works from a built-in classroom phrasebook with no connection.",
        "Cada baraja de aprendizaje puede convertirse en un kit sin conexión, y las hojas se imprimen bien. El traductor también funciona con un diccionario integrado sin conexión.",
      ),
    ],
    [
      l("Can I use it on my phone?", "¿Puedo usarlo en mi teléfono?"),
      l(
        "Absolutely. The portals, booking flow, meeting room and translator are built mobile-first — no app download required.",
        "Claro. Los portales, las reservas, la sala de reunión y el traductor están diseñados primero para móvil — sin descargar aplicaciones.",
      ),
    ],
  ];

  return (
    <>
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[44%] stripes-warm lg:block" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-r from-cream via-transparent to-transparent" />
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-cream to-transparent" />
          </div>
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:gap-8 lg:px-8 lg:pb-24 lg:pt-20">
            <div className="relative z-10">
              <span className="eyebrow">
                <StarMascot size={16} />
                {l("Free · Bilingual · Student-led", "Gratis · Bilingüe · Liderado por estudiantes")}
              </span>
              <h1 className="mt-5 max-w-[15ch] text-[clamp(2.7rem,6vw,4.9rem)] font-semibold leading-[0.94]">
                {l("Every student deserves a tutor who ", "Cada estudiante merece un tutor que ")}
                <span className="relative inline-block">
                  <RainbowText text={l("gets them.", "lo entienda.")} />
                  <Squiggle className="absolute -bottom-2 left-0 w-full text-yellow" />
                </span>
              </h1>
              <p className="font-hand mt-5 text-[22px] font-semibold leading-tight text-coral">
                {l("Tutoría gratis, en tu idioma, con alguien que ya pasó por ahí.", "Tutoría gratis, en tu idioma, con alguien que ya pasó por ahí.")}
              </p>
              <p className="mt-4 max-w-xl text-[15px] font-semibold leading-relaxed text-ink-soft">
                {l(
                  "Juntos en Traducción pairs local student volunteers with peers who need a lift — matched by real availability, subject needs and shared language. No cost. No waiting list.",
                  "Juntos en Traducción conecta a voluntarios estudiantes de la comunidad con compañeros que necesitan apoyo — según su disponibilidad real, sus materias y su idioma. Sin costo. Sin lista de espera.",
                )}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/signup/student" className="btn btn-coral px-6 py-3.5">
                  {l("Find my tutor", "Buscar mi tutor")}
                  <ArrowRight className="text-lg" />
                </Link>
                <Link href="/signup/volunteer" className="btn btn-white px-5 py-3.5">
                  {l("Become a tutor", "Quiero ser tutor")}
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold text-ink-soft">
                <span className="inline-flex items-center gap-1.5"><Check className="text-sm text-sage" /> {l("100% free", "100% gratis")}</span>
                <span className="inline-flex items-center gap-1.5"><Shield className="text-sm text-sage" /> {l("Guardian-approved", "Aprobado por tutores")}</span>
                <span className="inline-flex items-center gap-1.5"><Globe className="text-sm text-sage" /> {l("Spanish + English", "Español + inglés")}</span>
              </div>
              <div className="mt-8 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {volunteers.slice(0, 4).map((volunteer) => (
                    <Avatar key={volunteer.id} name={volunteer.name} color={volunteer.avatar_color} size="sm" />
                  ))}
                </div>
                <p className="max-w-[230px] text-[11px] font-semibold leading-snug text-ink-soft">
                  {l(
                    `${stats.volunteers} approved student tutors ready to help this week.`,
                    `${stats.volunteers} tutores estudiantes aprobados listos para ayudar esta semana.`,
                  )}
                </p>
              </div>
            </div>

            {/* Hero illustration */}
            <div className="relative mx-auto w-full max-w-[500px] px-3 pb-10 pt-4 sm:px-8 lg:pb-0">
              <div className="absolute inset-x-6 inset-y-6 rotate-3 rounded-[44px] bg-lilac-soft" aria-hidden="true" />
              <div className="relative rotate-[-1.5deg] rounded-[34px] border-2 border-ink/10 bg-paper p-5 shadow-[0_18px_40px_rgba(48,42,37,0.14)] sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
                    <Sparkles className="text-xs text-yellow" /> {l("Smart match", "Conexión inteligente")}
                  </span>
                  <span className="rounded-full bg-sage-soft px-2.5 py-1 text-[10px] font-extrabold text-[#52622f]">98% {l("match", "afinidad")}</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Avatar name="Mateo Álvarez" color="yellow" size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-base font-extrabold">Mateo Álvarez</p>
                    <p className="text-[11px] font-semibold text-ink-soft">{l("12th grade · Math + Science", "12.º grado · Matemáticas + Ciencias")}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-sage">
                      <Check className="text-xs" /> {l("Admin verified", "Verificado por admin")}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <Badge color="coral">Math</Badge>
                  <Badge color="sage">Science</Badge>
                  <Badge color="lilac">{l("Spanish + English", "Español + inglés")}</Badge>
                </div>
                <div className="mt-4 rounded-2xl border border-ink/10 bg-white p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">{l("Open slots that fit you", "Horarios que te sirven")}</p>
                  <div className="mt-2 grid gap-1.5">
                    {[
                      l("Mon · 4:30 PM", "Lun · 4:30 PM"),
                      l("Wed · 5:00 PM", "Mié · 5:00 PM"),
                    ].map((slot) => (
                      <div key={slot} className="flex items-center justify-between rounded-xl bg-cream px-3 py-2">
                        <span className="text-xs font-bold">{slot}</span>
                        <span className="rounded-full bg-coral px-2.5 py-1 text-[9px] font-extrabold text-white">{l("Book", "Reservar")}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-2xl bg-yellow-soft px-3 py-2.5">
                  <p className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#7a5a0c]">
                    <Video className="text-sm" /> Google Meet + Calendar
                  </p>
                  <span className="text-[9px] font-bold text-[#7a5a0c]/70">45 min</span>
                </div>
                <MiniCalendarCard />
              </div>
              <StarMascot size={92} className="animate-bob absolute -right-3 -top-7 sm:-right-4" style={{ "--tilt": "8deg" } as CSSProperties} />
              <OctopusMascot size={86} className="animate-floaty absolute -left-4 top-14 hidden sm:block" />
              <HeartMascot size={58} className="absolute -right-1 bottom-20 rotate-12" />
              <Sticker color="coral" rotate={7} className="absolute -left-2 top-0 hidden sm:inline-flex">✦ {l("Free forever", "Gratis siempre")}</Sticker>
            </div>
          </div>

          {/* Live stats */}
          <div className="relative mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
            <div className="card flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.13em] text-ink-soft">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sage" />
                </span>
                {l("Live from our pilot", "En vivo desde nuestro piloto")}
              </div>
              <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-3xl">
                {[
                  { value: `${stats.hours}`, label: l("Tutoring hours", "Horas de tutoría"), accent: "yellow" as const, emoji: "⏱️" },
                  { value: `${stats.active_matches}`, label: l("Active matches", "Conexiones activas"), accent: "coral" as const, emoji: "🤝" },
                  { value: `${stats.students}`, label: l("Students supported", "Estudiantes apoyados"), accent: "sage" as const, emoji: "🎒" },
                  { value: `${stats.volunteers}`, label: l("Approved tutors", "Tutores aprobados"), accent: "lilac" as const, emoji: "🌟" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <span className="text-lg">{item.emoji}</span>
                    <div>
                      <p className="text-xl font-extrabold leading-none" style={{ fontFamily: "var(--font-display)" }}>{item.value}</p>
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-soft">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* MISSION */}
        <section id="mission" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <SectionHeading
              eyebrow={l("Why we exist", "Por qué existimos")}
              title={
                <>
                  {l("The gap is real. ", "La brecha es real. ")}
                  <span className="relative inline-block">
                    {l("The help is already here.", "La ayuda ya está aquí.")}
                    <Squiggle className="absolute -bottom-1.5 left-0 w-full text-coral/60" />
                  </span>
                </>
              }
            />
            <p className="text-[15px] font-semibold leading-relaxed text-ink-soft">
              {l(
                "Post-pandemic learning loss didn't hit every block equally. Private tutoring can cost more than a family's monthly groceries — while the strongest math and reading students sit one row over. Juntos closes that loop inside the school community, with structure and safety built in.",
                "El retroceso educativo no afectó a todos por igual. La tutoría privada puede costar más que la comida de un mes, mientras los estudiantes más fuertes están a un pupitre de distancia. Juntos cierra ese círculo dentro de la comunidad escolar, con estructura y seguridad integradas.",
              )}
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                emoji: "🚪",
                accent: "coral",
                title: l("Access", "Acceso"),
                body: l(
                  "Private tutoring is a luxury. We make it a Tuesday.",
                  "La tutoría privada es un lujo. Nosotros la hacemos parte de la semana.",
                ),
                detail: l("Free for every family, with no paywall hiding the good stuff.", "Gratis para cada familia, sin muros de pago."),
              },
              {
                emoji: "🧩",
                accent: "sage",
                title: l("Momentum", "Impulso"),
                body: l(
                  "One missing skill can make every class feel uphill. We find the exact gap.",
                  "Una habilidad faltante puede hacer que toda clase cueste. Encontramos la brecha exacta.",
                ),
                detail: l("Skill scores after every session feed the student's learning plan automatically.", "Las puntuaciones de cada sesión alimentan automáticamente el plan del estudiante."),
              },
              {
                emoji: "🌉",
                accent: "lilac",
                title: l("Language", "Idioma"),
                body: l(
                  "No family should have to translate their own support.",
                  "Ninguna familia debería traducir su propio apoyo.",
                ),
                detail: l("A classroom translator lives on every page and beside every meeting.", "Un traductor de clase vive en cada página y junto a cada reunión."),
              },
            ].map((card) => (
              <div key={card.title} className={`card-hover card overflow-hidden p-0`}>
                <div
                  className={`flex items-center justify-between px-6 py-5 ${
                    card.accent === "coral" ? "bg-coral-soft" : card.accent === "sage" ? "bg-sage-soft" : "bg-lilac-soft"
                  }`}
                >
                  <span className="text-3xl">{card.emoji}</span>
                  <span className="font-hand text-lg font-semibold text-ink-soft/80">0{card.accent === "coral" ? 1 : card.accent === "sage" ? 2 : 3}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold">{card.title}</h3>
                  <p className="mt-2 text-base font-bold leading-snug">{card.body}</p>
                  <p className="mt-2 text-xs font-semibold leading-relaxed text-ink-soft">{card.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <figure className="relative mt-8 overflow-hidden rounded-[30px] border border-ink/10 bg-ink px-6 py-8 text-cream sm:px-10">
            <div className="absolute -right-8 -top-8 opacity-20"><StarMascot size={150} /></div>
            <div className="absolute bottom-4 right-6 hidden sm:block"><SunMascot size={74} /></div>
            <blockquote className="max-w-3xl text-[clamp(1.2rem,2.4vw,1.7rem)] font-bold leading-snug">
              <span className="font-hand text-3xl text-yellow">“</span>
              {l(
                "For the first time, fractions didn't make me want to hide my paper. Mateo drew the whole pizza and suddenly it made sense.",
                "Por primera vez, las fracciones no me dieron ganas de esconder mi hoja. Mateo dibujó la pizza completa y de repente todo tuvo sentido.",
              )}
              <span className="font-hand text-3xl text-yellow">”</span>
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-2.5">
              <Avatar name="Lucía Fernández" color="coral" size="sm" />
              <span className="text-xs font-bold text-cream/80">Lucía, 7th grade · {l("Math + English", "Matemáticas + Inglés")}</span>
            </figcaption>
          </figure>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="scroll-mt-24 border-y border-ink/10 bg-paper py-14 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              center
              eyebrow={l("How it works", "Cómo funciona")}
              title={l("Less searching. More learning.", "Menos búsqueda. Más aprendizaje.")}
              sub={l(
                "A closed loop: profile → match → session → feedback → updated plan. Every step is visible to the student and their guardian.",
                "Un círculo cerrado: perfil → conexión → sesión → comentarios → plan actualizado. Cada paso es visible para el estudiante y su tutor legal.",
              )}
            />
            <div className="relative mt-12 grid gap-5 md:grid-cols-3">
              <div className="absolute left-[16%] right-[16%] top-12 hidden border-t-2 border-dashed border-ink/15 md:block" aria-hidden="true" />
              {[
                {
                  n: "01",
                  icon: <Clipboard className="text-xl" />,
                  color: "bg-coral-soft text-[#a02727]",
                  title: l("Join through the right door", "Entra por la puerta correcta"),
                  body: l(
                    "Students share what feels hard and when they're free. Volunteers share subjects and availability. Guardians approve student accounts.",
                    "Los estudiantes comparten qué les cuesta y cuándo están libres. Los voluntarios comparten materias y horarios. Los tutores legales aprueban las cuentas.",
                  ),
                  chip: l("Dual onboarding funnels", "Dos rutas de registro"),
                },
                {
                  n: "02",
                  icon: <Target className="text-xl" />,
                  color: "bg-yellow-soft text-[#7a5a0c]",
                  title: l("Get matched, not lost", "Encuentra tu match, sin perderte"),
                  body: l(
                    "A matching engine scores subject overlap, shared availability, language and history — then only shows slots that genuinely fit both calendars.",
                    "Un motor de emparejamiento puntúa materias, horarios, idioma e historial — y solo muestra horarios que encajan con ambos calendarios.",
                  ),
                  chip: l("Real-time availability", "Disponibilidad en tiempo real"),
                },
                {
                  n: "03",
                  icon: <Play className="text-xl" />,
                  color: "bg-sage-soft text-[#52622f]",
                  title: l("Meet, learn, see growth", "Conéctense, aprendan, crezcan"),
                  body: l(
                    "Join from Google Meet, keep the translator open, and finish with a quick feedback form. Skill scores update the student's next learning plan.",
                    "Únete por Google Meet, mantén el traductor abierto y termina con un formulario rápido. Las puntuaciones actualizan el próximo plan del estudiante.",
                  ),
                  chip: l("Google Meet + Calendar", "Google Meet + Calendar"),
                },
              ].map((step) => (
                <div key={step.n} className="card relative p-6">
                  <div className="flex items-center justify-between">
                    <span className={`grid h-12 w-12 place-items-center rounded-2xl ${step.color}`}>{step.icon}</span>
                    <span className="font-hand text-3xl font-semibold text-ink/20">{step.n}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-[13px] font-semibold leading-relaxed text-ink-soft">{step.body}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 text-[10px] font-extrabold text-ink-soft">
                    <Check className="text-xs text-sage" /> {step.chip}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PORTALS */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow={l("Two portals, one loop", "Dos portales, un círculo")}
            title={l("Built for the people doing the work.", "Hecho para quienes hacen el trabajo.")}
            sub={l(
              "Students get a personalised hub. Volunteers get a teaching cockpit. Admins get safety and proof.",
              "Los estudiantes reciben un centro personalizado. Los voluntarios, un panel de enseñanza. Los administradores, seguridad y pruebas.",
            )}
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-[32px] border border-ink/10 bg-sage-soft/60 p-6 sm:p-8">
              <div className="pointer-events-none absolute -right-6 -top-5 opacity-50"><HeartMascot size={130} /></div>
              <Badge color="sage">{l("Student portal", "Portal del estudiante")}</Badge>
              <h3 className="relative mt-4 max-w-[15ch] text-[clamp(1.5rem,3vw,2.1rem)] font-semibold leading-tight">
                {l("A learning plan that updates itself.", "Un plan de aprendizaje que se actualiza solo.")}
              </h3>
              <ul className="relative mt-5 grid gap-2.5">
                {[
                  l("Smart matches ranked by real availability", "Conexiones ordenadas por disponibilidad real"),
                  l("Mini-games targeting the exact weak skill", "Minijuegos para la habilidad exacta a reforzar"),
                  l("Worksheets with answer keys + auto-grading", "Hojas de trabajo con respuestas y corrección automática"),
                  l("Offline kits and printable packs", "Kits sin conexión y paquetes imprimibles"),
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] font-bold">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-sage"><Check className="text-xs" /></span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="relative mt-6 flex flex-wrap gap-2">
                <Link href="/login" className="btn btn-ink btn-sm">{l("Open student demo", "Abrir demo de estudiante")} <ArrowRight className="text-sm" /></Link>
                <Link href="/signup/student" className="btn btn-white btn-sm">{l("Create a profile", "Crear un perfil")}</Link>
              </div>
              <div className="relative mt-6 grid grid-cols-3 gap-2">
                {[
                  { label: l("Fractions", "Fracciones"), value: "2/5", color: "bg-yellow" },
                  { label: l("Reading", "Lectura"), value: "3/5", color: "bg-coral" },
                  { label: l("Streak", "Racha"), value: "2 wks", color: "bg-lilac" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-ink/10 bg-white p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold uppercase tracking-wide text-ink-soft">{s.label}</span>
                      <span className={`h-2 w-2 rounded-full ${s.color}`} />
                    </div>
                    <p className="mt-1 text-lg font-extrabold">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[32px] border border-ink/10 bg-sky-soft/70 p-6 sm:p-8">
              <div className="pointer-events-none absolute -right-8 top-2 opacity-40"><OctopusMascot size={140} /></div>
              <Badge color="blue">{l("Volunteer portal", "Portal del voluntario")}</Badge>
              <h3 className="relative mt-4 max-w-[16ch] text-[clamp(1.5rem,3vw,2.1rem)] font-semibold leading-tight">
                {l("Teach without the busywork.", "Enseña sin el trabajo extra.")}
              </h3>
              <ul className="relative mt-5 grid gap-2.5">
                {[
                  l("Drag-and-toggle availability grid", "Cuadrícula de disponibilidad fácil de usar"),
                  l("Searchable open lesson library", "Biblioteca de lecciones con búsqueda"),
                  l("Google Calendar sync + Meet links", "Sincronización con Google Calendar + Meet"),
                  l("60-second feedback that updates the plan", "Comentarios en 60 segundos que actualizan el plan"),
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] font-bold">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-[#3e7a68]"><Check className="text-xs" /></span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="relative mt-6 flex flex-wrap gap-2">
                <Link href="/login" className="btn btn-ink btn-sm">{l("Open volunteer demo", "Abrir demo de voluntario")} <ArrowRight className="text-sm" /></Link>
                <Link href="/signup/volunteer" className="btn btn-white btn-sm">{l("Apply to tutor", "Aplicar para tutor")}</Link>
              </div>
              <div className="relative mt-6 flex items-center gap-3 rounded-2xl border border-ink/10 bg-white p-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-yellow-soft text-[#7a5a0c]"><Calendar className="text-lg" /></div>
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold">Next up · {l("Mon 4:30 PM", "Lun 4:30 PM")}</p>
                  <p className="truncate text-[10px] font-semibold text-ink-soft">Lucía F. · Math · {l("Fractions", "Fracciones")}</p>
                </div>
                <span className="ml-auto rounded-full bg-sage-soft px-2 py-1 text-[9px] font-extrabold text-[#52622f]">{l("Meet ready", "Meet listo")}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-[26px] border border-ink/10 bg-white px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lilac-soft text-[#6e4680]"><Shield className="text-lg" /></span>
              <div>
                <p className="text-sm font-extrabold">{l("Admin & safety dashboard", "Panel de administración y seguridad")}</p>
                <p className="text-[11px] font-semibold text-ink-soft">
                  {l("Volunteer approvals · flagged-message review · live match oversight · program impact reporting", "Aprobación de voluntarios · revisión de mensajes marcados · supervisión · informes de impacto del programa")}
                </p>
              </div>
            </div>
            <Link href="/login" className="btn btn-white btn-sm">{l("Peek inside", "Ver por dentro")} <ArrowRight className="text-sm" /></Link>
          </div>
        </section>

        {/* TRANSLATION */}
        <section className="relative overflow-hidden border-y border-ink/10 bg-paper">
          <div className="absolute inset-y-0 right-0 w-1/2 stripes-cool opacity-60" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-8 lg:py-20">
            <div>
              <SectionHeading
                eyebrow={l("Translation, built in", "Traducción integrada")}
                title={
                  <>
                    {l("A bridge, not a barrier.", "Un puente, no una barrera.")}
                  </>
                }
                sub={l(
                  "A translator floats on every page and opens beside every meeting. Quick classroom phrases work offline, and no student text is sent to a third party.",
                  "Un traductor flota en cada página y se abre junto a cada reunión. Las frases de clase funcionan sin conexión y ningún texto se envía a terceros.",
                )}
              />
              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {[
                  [l("Floating on every page", "Flotante en cada página"), "🌍"],
                  [l("Side panel in meetings", "Panel lateral en reuniones"), "💬"],
                  [l("Private by design", "Privado por diseño"), "🔒"],
                  [l("Works offline", "Funciona sin conexión"), "📴"],
                ].map(([label, emoji]) => (
                  <div key={label} className="flex items-center gap-2.5 rounded-2xl border border-ink/10 bg-white/80 px-3.5 py-3 text-xs font-extrabold">
                    <span className="text-base">{emoji}</span>
                    {label}
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2.5">
                <div className="ml-auto max-w-[85%] rounded-3xl rounded-br-md border border-ink/10 bg-lilac-soft px-4 py-2.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#6e4680]">Lucía · Español</p>
                  <p className="text-[13px] font-bold">¿Puedes repetir eso más despacio?</p>
                  <p className="mt-1 text-[10px] font-semibold text-ink-soft/80">↳ Can you repeat that slower?</p>
                </div>
                <div className="max-w-[85%] rounded-3xl rounded-bl-md border border-ink/10 bg-white px-4 py-2.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#52622f]">Mateo · English</p>
                  <p className="text-[13px] font-bold">Of course — one slice at a time.</p>
                  <p className="mt-1 text-[10px] font-semibold text-ink-soft/80">↳ Claro — una rebanada a la vez.</p>
                </div>
              </div>

              <p className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-ink-soft">
                <Lock className="text-sm text-sage" /> {l("Phrasebook runs locally — no student data leaves the device.", "El diccionario funciona localmente: ningún dato sale del dispositivo.")}
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-[390px] lg:mr-0">
              <div className="absolute inset-3 -rotate-2 rounded-[32px] bg-lilac/40" aria-hidden="true" />
              <div className="relative rotate-1 overflow-hidden rounded-[30px] border-2 border-ink/10 bg-paper shadow-[0_18px_40px_rgba(48,42,37,0.15)]">
                <div className="washi h-5" aria-hidden="true" />
                <TranslatorPanel maxHeight="none" />
              </div>
              <Sticker color="yellow" rotate={-6} className="absolute -left-4 -top-3">{l("Try it →", "Pruébalo →")}</Sticker>
            </div>
          </div>
        </section>

        {/* IMPACT */}
        <section id="impact" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow={l("Proof, not promises", "Pruebas, no promesas")}
              title={l("A small pilot. A measurable loop.", "Un piloto pequeño. Un círculo medible.")}
            />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">
              <Sparkles className="text-sm text-coral" /> {l("Live data from the portal", "Datos en vivo del portal")}
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label={l("Hours logged", "Horas registradas")} value={stats.hours} accent="yellow" emoji="⏱️" hint={l("Every completed session", "Cada sesión completada")} />
            <StatCard label={l("Sessions completed", "Sesiones completadas")} value={stats.completed_sessions} accent="coral" emoji="✅" hint={l("With volunteer feedback", "Con comentarios del tutor")} />
            <StatCard label={l("Worksheets finished", "Hojas completadas")} value={stats.worksheets_completed} accent="sage" emoji="📒" hint={l("Auto-graded instantly", "Corregidas al instante")} />
            <StatCard label={l("Average skill score", "Puntuación media")} value={`${metrics.avgSkill}/5`} accent="lilac" emoji="📈" hint={l("Across assessed micro-skills", "En microhabilidades evaluadas")} />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="card p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold">{l("Where the hours go", "A dónde van las horas")}</h3>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">{l("By subject", "Por materia")}</span>
              </div>
              <div className="mt-5 space-y-4">
                {metrics.bySubject.length === 0 ? (
                  <p className="text-sm font-semibold text-ink-soft">{l("First sessions are being logged now.", "Las primeras sesiones se están registrando.")}</p>
                ) : (
                  metrics.bySubject.map((row, index) => {
                    const max = Math.max(...metrics.bySubject.map((r) => r.sessions));
                    const colors = ["bg-coral", "bg-yellow", "bg-sage", "bg-lilac", "bg-pink", "bg-mint"];
                    return (
                      <div key={row.subject}>
                        <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
                          <span>{row.subject}</span>
                          <span className="text-ink-soft">{row.sessions} {l("sessions", "sesiones")} · {Math.round((row.minutes / 60) * 10) / 10}h</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-ink/8">
                          <div className={`h-full rounded-full ${colors[index % colors.length]}`} style={{ width: `${Math.max(8, (row.sessions / max) * 100)}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="mt-6 rounded-2xl bg-cream px-4 py-3">
                <p className="text-[11px] font-semibold leading-relaxed text-ink-soft">
                  {l(
                    "Each session ends with 1–5 ratings on specific micro-skills. Those scores — not vibes — drive the next learning recommendation.",
                    "Cada sesión termina con puntuaciones de 1 a 5 en microhabilidades concretas. Esas notas —no corazonadas— guían la siguiente recomendación.",
                  )}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                {
                  icon: <Shield className="text-lg" />,
                  color: "bg-sage-soft text-[#52622f]",
                  title: l("Guardian consent, recorded", "Consentimiento registrado"),
                  body: l("Student accounts capture guardian name, email and a timestamped consent step.", "Las cuentas de estudiantes registran nombre, correo y consentimiento con fecha."),
                },
                {
                  icon: <Lock className="text-lg" />,
                  color: "bg-coral-soft text-[#a02727]",
                  title: l("Contact info filtered", "Datos de contacto filtrados"),
                  body: l("Phone numbers, emails and social handles are stripped and sent to human review.", "Se eliminan teléfonos, correos y redes sociales y se envían a revisión humana."),
                },
                {
                  icon: <Book className="text-lg" />,
                  color: "bg-yellow-soft text-[#7a5a0c]",
                  title: l("Offline by default", "Sin conexión por defecto"),
                  body: l("One-click offline learning kits and print-friendly worksheets for the digital divide.", "Kits de aprendizaje y hojas imprimibles para la brecha digital."),
                },
              ].map((item) => (
                <div key={item.title} className="card flex gap-4 p-5">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${item.color}`}>{item.icon}</span>
                  <div>
                    <h3 className="text-sm font-extrabold">{item.title}</h3>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-ink-soft">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              {
                quote: l(
                  "I like that I can see exactly what to practise next. It doesn't feel like extra homework — it feels like a game I can win.",
                  "Me gusta ver exactamente qué practicar después. No se siente como tarea extra, sino como un juego que puedo ganar.",
                ),
                name: "Marcus J.",
                role: l("9th grade · Algebra", "9.º grado · Álgebra"),
                color: "sage",
              },
              {
                quote: l(
                  "The feedback form takes a minute, and then the student's portal already knows what to show them. That's the part that feels like magic.",
                  "El formulario de comentarios toma un minuto y el portal del estudiante ya sabe qué mostrarle. Esa parte se siente mágica.",
                ),
                name: "Priya S.",
                role: l("Volunteer tutor · Reading", "Tutora voluntaria · Lectura"),
                color: "lilac",
              },
            ].map((item) => (
              <figure key={item.name} className="card p-6">
                <div className="flex gap-0.5 text-yellow">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="text-sm" fill="currentColor" />)}
                </div>
                <blockquote className="mt-3 text-[15px] font-bold leading-relaxed">“{item.quote}”</blockquote>
                <figcaption className="mt-4 flex items-center gap-2.5">
                  <Avatar name={item.name} color={item.color} size="sm" />
                  <div>
                    <p className="text-xs font-extrabold">{item.name}</p>
                    <p className="text-[10px] font-semibold text-ink-soft">{item.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 border-y border-ink/10 bg-paper py-14 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div>
              <SectionHeading
                eyebrow={l("Questions, answered", "Preguntas, respuestas")}
                title={l("For students, families and future tutors.", "Para estudiantes, familias y futuros tutores.")}
                sub={l(
                  "Still unsure? Our safety team answers guardian questions within one school day.",
                  "¿Aún tienes dudas? Nuestro equipo responde a las familias en un día escolar.",
                )}
              />
              <a href="mailto:hello@juntosentraduccion.org" className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-coral">
                <Chat className="text-base" /> hello@juntosentraduccion.org
              </a>
              <div className="relative mt-8 hidden lg:block">
                <HeartMascot size={86} className="animate-bob" />
                <p className="font-hand mt-2 max-w-[200px] rotate-[-2deg] text-xl font-semibold text-ink-soft">
                  {l("You belong here.", "Aquí perteneces.")}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {faqs.map(([question, answer], index) => (
                <details key={question} className="group rounded-2xl border border-ink/10 bg-white open:shadow-[0_4px_0_rgba(48,42,37,0.05)]" open={index === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-extrabold [&::-webkit-details-marker]:hidden">
                    {question}
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cream text-ink-soft transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="px-5 pb-5 text-[13px] font-semibold leading-relaxed text-ink-soft">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="relative overflow-hidden rounded-[36px] border border-ink/10 stripes-warm px-6 py-12 text-center sm:px-10 lg:py-16">
            <div className="absolute left-4 top-6 opacity-90"><StarMascot size={70} className="animate-bob" /></div>
            <div className="absolute -bottom-4 right-6 opacity-90"><OctopusMascot size={96} /></div>
            <div className="absolute right-1/4 top-4 hidden opacity-70 sm:block"><HeartMascot size={44} /></div>
            <span className="eyebrow bg-white/80">{l("Your next session is one click away", "Tu próxima sesión está a un clic")}</span>
            <h2 className="mx-auto mt-4 max-w-2xl text-[clamp(2rem,4.5vw,3.4rem)] font-semibold leading-[1.02]">
              {l("Learn with someone who ", "Aprende con alguien que ")}
              <RainbowText text={l("sees you.", "te ve.")} />
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm font-semibold text-ink-soft">
              {l(
                "Free, bilingual peer tutoring for our community — with guardian approval, safe messaging and humans checking the details.",
                "Tutoría gratuita y bilingüe para nuestra comunidad — con aprobación de tutores, mensajes seguros y personas revisando los detalles.",
              )}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/signup/student" className="btn btn-coral px-6 py-3.5">{l("I need a tutor", "Necesito un tutor")} <ArrowRight className="text-lg" /></Link>
              <Link href="/signup/volunteer" className="btn btn-white px-6 py-3.5">{l("I want to tutor", "Quiero ser tutor")}</Link>
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-ink-soft/80">
              {l("No cost · Guardian-approved · Spanish + English", "Sin costo · Aprobado por tutores · Español + inglés")}
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
