import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getAvailability } from "@/lib/data";
import { getLocale, localized } from "@/lib/locale";
import { AvailabilityGrid } from "@/components/availability-grid";
import { PageHeader } from "@/components/ui";
import { Calendar, Clock, Sparkles } from "@/components/icons";
import { StarMascot } from "@/components/mascots";

export const metadata: Metadata = { title: "My availability" };
export const dynamic = "force-dynamic";

export default async function StudentAvailabilityPage() {
  const user = await requireRole("student");
  const blocks = await getAvailability(user.id);
  const locale = await getLocale();
  const l = localized(locale);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={l("Smart scheduling", "Horarios inteligentes")}
        title={l("When can you learn?", "¿Cuándo puedes aprender?")}
        sub={l(
          "The matching engine only shows tutors whose free time overlaps with yours. More blocks means more matches.",
          "El motor de conexión solo muestra tutores cuya disponibilidad coincide con la tuya. Más bloques significa más conexiones.",
        )}
      />

      <div className="grid gap-4 lg:grid-cols-[1.65fr_1fr]">
        <AvailabilityGrid initialBlocks={blocks} accent="coral" />

        <div className="space-y-4">
          <div className="rounded-3xl border border-ink/10 bg-coral-soft/60 p-5">
            <StarMascot size={54} />
            <h2 className="mt-2 text-lg font-extrabold">{l("A little time goes far.", "Un poco de tiempo rinde mucho.")}</h2>
            <p className="mt-1.5 text-xs font-semibold leading-relaxed text-ink-soft">
              {l(
                "Sessions are 45 minutes. Two afternoons a week is plenty to see skill growth — and the grid updates your matches instantly.",
                "Las sesiones duran 45 minutos. Dos tardes por semana alcanzan para ver progreso — y la cuadrícula actualiza tus conexiones al instante.",
              )}
            </p>
          </div>

          <div className="card p-5">
            <h3 className="flex items-center gap-1.5 text-sm font-extrabold"><Calendar className="text-base text-coral" /> {l("How we schedule", "Cómo agendamos")}</h3>
            <ul className="mt-3 space-y-3 text-[11px] font-semibold text-ink-soft">
              <li className="flex gap-2"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cream"><Clock className="text-xs" /></span>{l("Only shared, future slots appear in the booking list.", "Solo aparecen horarios futuros y compartidos.")}</li>
              <li className="flex gap-2"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cream"><Sparkles className="text-xs" /></span>{l("Every booking creates a Google Meet room and calendar invite.", "Cada reserva crea una sala de Google Meet y una invitación.")}</li>
              <li className="flex gap-2"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cream"><Calendar className="text-xs" /></span>{l("Times are stored in school time (ET) so everyone sees the same clock.", "Las horas se guardan en la hora escolar (ET) para que todos vean el mismo reloj.")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
