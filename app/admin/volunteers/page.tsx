import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getVolunteerRoster } from "@/lib/data";
import { getLocale, localized } from "@/lib/locale";
import { PageHeader, StatCard } from "@/components/ui";
import { VolunteerApprovals } from "@/components/volunteer-approvals";
import { Check, Clipboard, Shield, Users } from "@/components/icons";

export const metadata: Metadata = { title: "Volunteer approvals" };
export const dynamic = "force-dynamic";

export default async function AdminVolunteersPage() {
  await requireRole("admin");
  const locale = await getLocale();
  const l = localized(locale);
  const roster = await getVolunteerRoster();
  const pending = roster.filter((volunteer) => !volunteer.approved);
  const approved = roster.filter((volunteer) => volunteer.approved);
  const totalHours = roster.reduce((sum, volunteer) => sum + volunteer.completed_sessions * 0.75, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={l("People & trust", "Personas y confianza")}
        title={l("Volunteer approvals", "Aprobación de voluntarios")}
        sub={l(
          "Every tutor is reviewed by a human before they can be matched, message students or create worksheets. Approval is logged and announced in Google Chat.",
          "Cada tutor es revisado por una persona antes de ser conectado, escribir a estudiantes o crear hojas. La aprobación se registra y se anuncia en Google Chat.",
        )}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={l("Total volunteers", "Voluntarios totales")} value={roster.length} accent="lilac" emoji="👥" />
        <StatCard label={l("Approved", "Aprobados")} value={approved.length} accent="sage" emoji="✅" hint={`${totalHours.toFixed(0)}h ${l("tutored by approved tutors", "tutorizadas")}`} />
        <StatCard label={l("Pending review", "Pendientes")} value={pending.length} accent="yellow" emoji="⏳" hint={l("Target: reviewed within 48 hours", "Meta: revisar en 48 horas")} />
        <StatCard label={l("Subjects covered", "Materias cubiertas")} value={new Set(roster.flatMap((volunteer) => volunteer.subjects)).size} accent="coral" emoji="📚" />
      </div>

      <div className="rounded-2xl border border-ink/10 bg-sky-soft/50 px-4 py-3">
        <p className="flex items-start gap-2 text-[10px] font-semibold leading-relaxed text-ink-soft">
          <Shield className="mt-0.5 shrink-0 text-sm text-[#326176]" />
          {l(
            "Review checklist: confirm the volunteer's school email, check subject fit, look for at least two availability blocks, and verify guardian permission for volunteers under 18. Pausing keeps the account and history intact.",
            "Lista de verificación: confirma el correo escolar, revisa las materias, busca al menos dos bloques de disponibilidad y verifica el permiso del tutor legal para menores de 18. Pausar conserva la cuenta y el historial.",
          )}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: <Clipboard className="text-base" />, title: "Application complete", detail: "Name, email and at least one subject are present." },
          { icon: <Check className="text-base" />, title: "Availability opened", detail: "Volunteer has set weekly blocks students can book." },
          { icon: <Users className="text-base" />, title: "Safety orientation", detail: "Mandated-reporter and contact-filter rules acknowledged." },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-ink/10 bg-paper px-3.5 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-sage-soft text-[#52622f]">{item.icon}</span>
            <p className="mt-2 text-[11px] font-extrabold">{item.title}</p>
            <p className="mt-0.5 text-[10px] font-semibold leading-relaxed text-ink-soft">{item.detail}</p>
          </div>
        ))}
      </div>

      <VolunteerApprovals volunteers={roster} />
    </div>
  );
}
