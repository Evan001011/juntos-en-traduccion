import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getAvailability } from "@/lib/data";
import { getLocale, localized } from "@/lib/locale";
import { AvailabilityGrid } from "@/components/availability-grid";
import { PageHeader } from "@/components/ui";
import { Calendar, Clock, Shield, Sparkles } from "@/components/icons";
import { OctopusMascot } from "@/components/mascots";

export const metadata: Metadata = { title: "My availability" };
export const dynamic = "force-dynamic";

export default async function VolunteerAvailabilityPage() {
  const user = await requireRole("volunteer");
  const blocks = await getAvailability(user.id);
  const locale = await getLocale();
  const l = localized(locale);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={l("Smart scheduling", "Horarios inteligentes")}
        title={l("When can you tutor?", "¿Cuándo puedes tutorar?")}
        sub={l(
          "Only these slots are shown to students whose own availability overlaps. More blocks means more matches — and you can change them any time.",
          "Solo estos horarios se muestran a estudiantes cuya disponibilidad coincide. Más bloques significa más conexiones — y puedes cambiarlos cuando quieras.",
        )}
      />

      <div className="grid gap-4 lg:grid-cols-[1.65fr_1fr]">
        <AvailabilityGrid initialBlocks={blocks} accent="sage" />

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-sage-soft/70 p-5">
            <OctopusMascot size={80} className="absolute -right-2 -top-2 opacity-70" />
            <h2 className="mt-1 max-w-[14ch] text-lg font-extrabold">{l("One hour. Big ripple.", "Una hora. Gran impacto.")}</h2>
            <p className="mt-1.5 max-w-[220px] text-xs font-semibold leading-relaxed text-ink-soft">
              {l(
                "Two 45-minute sessions a week is enough to move a skill from 2/5 to 3/5. That's the loop you can see in every student's progress.",
                "Dos sesiones de 45 minutos por semana bastan para subir una habilidad de 2/5 a 3/5. Ese es el ciclo que se ve en el progreso de cada estudiante.",
              )}
            </p>
          </div>

          <div className="card p-5">
            <h3 className="flex items-center gap-1.5 text-sm font-extrabold"><Calendar className="text-base text-sage" /> {l("Scheduling rules", "Reglas de agenda")}</h3>
            <ul className="mt-3 space-y-3 text-[11px] font-semibold text-ink-soft">
              <li className="flex gap-2"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cream"><Clock className="text-xs" /></span>{l("Sessions are 45 minutes inside a selected block.", "Las sesiones duran 45 minutos dentro de un bloque.")}</li>
              <li className="flex gap-2"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cream"><Sparkles className="text-xs" /></span>{l("A booking creates a Google Meet room and calendar invite instantly.", "Una reserva crea una sala de Google Meet e invitación al instante.")}</li>
              <li className="flex gap-2"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cream"><Shield className="text-xs" /></span>{l("Students can only see your open slots, never your personal calendar.", "Los estudiantes solo ven tus horarios abiertos, nunca tu calendario personal.")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
