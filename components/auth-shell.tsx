import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./brand";
import { LanguageToggle } from "./i18n";
import { HeartMascot, OctopusMascot, StarMascot } from "./mascots";
import { ArrowLeft, Check, Shield } from "./icons";
import { RainbowText, Squiggle, Sticker } from "./ui";
import { getLocale, localized } from "@/lib/locale";

export async function AuthShell({
  variant,
  children,
}: {
  variant: "login" | "student" | "volunteer";
  children: ReactNode;
}) {
  const locale = await getLocale();
  const l = localized(locale);

  const copy =
    variant === "login"
      ? {
          eyebrow: l("Welcome back", "Bienvenido de nuevo"),
          title: l("Pick up right where you left off.", "Retoma justo donde lo dejaste."),
          body: l(
            "Your matches, lesson plans and learning streak are exactly where you left them.",
            "Tus conexiones, planes y racha de aprendizaje están justo donde los dejaste.",
          ),
          points: [
            l("One login for all three roles", "Un acceso para los tres roles"),
            l("Your sessions stay in sync", "Tus sesiones siguen sincronizadas"),
            l("Translation is one tap away", "La traducción está a un toque"),
          ],
        }
      : variant === "student"
        ? {
            eyebrow: l("Student sign-up", "Registro de estudiante"),
            title: l("Your learning plan starts here.", "Tu plan de aprendizaje empieza aquí."),
            body: l(
              "Tell us what feels hard and when you're free. We'll find a tutor — and a plan — that actually fits.",
              "Cuéntanos qué te cuesta y cuándo estás libre. Encontraremos un tutor —y un plan— que de verdad encaje.",
            ),
            points: [
              l("Free, forever", "Gratis, siempre"),
              l("Guardian approval built in", "Aprobación de tutor legal incluida"),
              l("Mini-games for your exact gaps", "Minijuegos para tus brechas exactas"),
            ],
          }
        : {
            eyebrow: l("Volunteer application", "Solicitud de voluntario"),
            title: l("Your hour can change a Tuesday.", "Tu hora puede cambiar un martes."),
            body: l(
              "Share what you're great at and when you're free. An admin reviews every application before matches go live.",
              "Comparte en qué eres bueno y cuándo estás libre. Un administrador revisa cada solicitud antes de activar las conexiones.",
            ),
            points: [
              l("Flexible after-school hours", "Horarios flexibles después de clase"),
              l("Lesson plans already written", "Lecciones ya preparadas"),
              l("Service hours + real impact", "Horas de servicio + impacto real"),
            ],
          };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[0.92fr_1.08fr]">
      <aside className="relative hidden overflow-hidden stripes-warm lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div className="relative z-10">
          <Logo />
        </div>
        <div className="relative z-10 max-w-md py-8">
          <span className="eyebrow bg-white/75">{copy.eyebrow}</span>
          <h1 className="mt-5 text-[clamp(2.1rem,3.4vw,3.4rem)] font-semibold leading-[0.98]">
            {copy.title}
          </h1>
          <Squiggle className="mt-3 w-40 text-coral/60" />
          <p className="mt-4 text-sm font-semibold leading-relaxed text-ink-soft">{copy.body}</p>
          <ul className="mt-6 grid gap-3">
            {copy.points.map((point) => (
              <li key={point} className="flex items-center gap-2.5 text-[13px] font-extrabold">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-sage shadow-sm"><Check className="text-xs" /></span>
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-7 inline-flex items-center gap-2 rounded-2xl border border-ink/10 bg-white/75 px-3.5 py-2.5 text-[11px] font-bold text-ink-soft backdrop-blur">
            <Shield className="text-base text-sage" />
            {l("Guardian consent · filtered messaging · admin review", "Consentimiento · mensajes filtrados · revisión de admin")}
          </div>
        </div>
        <div className="relative z-10 flex items-end gap-1">
          <StarMascot size={92} className="animate-bob" />
          <OctopusMascot size={76} className="animate-floaty" />
          <HeartMascot size={54} />
        </div>
        <div className="pointer-events-none absolute -bottom-16 -right-16 opacity-30" aria-hidden="true">
          <StarMascot size={280} />
        </div>
        <Sticker color="yellow" rotate={-9} className="absolute right-10 top-24 z-10">
          <RainbowText text={l("Free", "Gratis")} />
        </Sticker>
      </aside>

      <main className="relative flex min-h-screen flex-col px-4 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-3 lg:max-w-md">
          <div className="lg:hidden"><Logo compact /></div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-ink-soft transition hover:text-coral">
            <ArrowLeft className="text-sm" /> {l("Back home", "Volver al inicio")}
          </Link>
          <LanguageToggle compact />
        </div>
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center py-8 lg:max-w-md lg:py-6">
          {children}
        </div>
        <p className="mx-auto w-full max-w-lg text-center text-[10px] font-semibold leading-relaxed text-ink-soft/80 lg:max-w-md">
          {l(
            "Juntos en Traducción is a student-built community program. Never share personal contact information with a tutor or student.",
            "Juntos en Traducción es un programa comunitario creado por estudiantes. Nunca compartas datos personales con un tutor o estudiante.",
          )}
        </p>
      </main>
    </div>
  );
}
