import Link from "next/link";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getAdminSessions, getAuditLog, getFlaggedMessages, getImpactReport } from "@/lib/data";
import { getLocale, localized } from "@/lib/locale";
import { formatDateTime, timeAgo } from "@/lib/time";
import { Badge, PageHeader, StatCard } from "@/components/ui";
import { SafetyReview } from "@/components/safety-review";
import { ArrowRight, Calendar, Check, Chat, Clock, Globe, Lock, Shield, Users } from "@/components/icons";

export const metadata: Metadata = { title: "Safety & moderation" };
export const dynamic = "force-dynamic";

export default async function AdminSafetyPage() {
  await requireRole("admin");
  const locale = await getLocale();
  const l = localized(locale);
  const flagged = await getFlaggedMessages();
  const sessions = await getAdminSessions(12);
  const audit = await getAuditLog(14);
  const impact = await getImpactReport();
  const live = sessions.filter((session) => session.status === "scheduled");
  const missingNotes = sessions.filter((session) => session.status === "completed" && !session.has_feedback);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={l("Trust & safety", "Confianza y seguridad")}
        title={l("Safety center", "Centro de seguridad")}
        sub={l(
          "Contact details never reach a minor. The filter flags the attempt, redacts it, and routes the context to this human review queue.",
          "Los datos de contacto nunca llegan a un menor. El filtro marca el intento, lo redacta y envía el contexto a esta cola de revisión humana.",
        )}
        actions={<Link href="/admin/impact" className="btn btn-white btn-sm"><Shield className="text-sm" /> {l("Impact proof", "Prueba de impacto")}</Link>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={l("Flagged messages", "Mensajes marcados")} value={flagged.length} accent="coral" emoji="🚩" hint={l("Awaiting human review", "Esperando revisión")} />
        <StatCard label={l("Live rooms", "Salas activas")} value={live.length} accent="sage" emoji="🎥" hint={l("Admin-monitored sessions", "Sesiones monitoreadas")} />
        <StatCard label={l("Guardian consent", "Consentimiento")} value={`${impact.guardian.rate}%`} accent="yellow" emoji="🛡️" hint={`${impact.guardian.consented}/${impact.guardian.students} ${l("students with a guardian on file", "estudiantes con tutor legal")}`} />
        <StatCard label={l("Notes missing", "Notas faltantes")} value={missingNotes.length} accent="lilac" emoji="📝" hint={l("Completed sessions without feedback", "Sesiones sin comentarios")} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: <Lock className="text-base" />, title: "Contact filter", detail: "Phone numbers, emails and social handles are redacted before delivery.", accent: "bg-coral-soft text-[#a02727]" },
          { icon: <Users className="text-base" />, title: "Guardian gate", detail: "Student accounts require a guardian name, email and consent at signup.", accent: "bg-sage-soft text-[#52622f]" },
          { icon: <Globe className="text-base" />, title: "Human escalation", detail: "Admins review context, delete harmful messages and log every action.", accent: "bg-sky-soft text-[#326176]" },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-ink/10 bg-paper px-3.5 py-3">
            <span className={`grid h-8 w-8 place-items-center rounded-lg ${item.accent}`}>{item.icon}</span>
            <p className="mt-2 text-[11px] font-extrabold">{item.title}</p>
            <p className="mt-0.5 text-[10px] font-semibold leading-relaxed text-ink-soft">{item.detail}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-base font-extrabold"><Chat className="text-base text-coral" /> {l("Review queue", "Cola de revisión")}</h2>
          <span className="rounded-full bg-coral-soft px-2.5 py-1 text-[9px] font-extrabold text-[#a02727]">{flagged.length} open</span>
        </div>
        <SafetyReview
          messages={flagged.map((message) => ({
            id: message.id,
            body: message.body,
            flag_reason: message.flag_reason,
            created_at: message.created_at,
            sender_name: message.sender_name,
            sender_role: message.sender_role,
            recipient_name: message.recipient_name,
            recipient_role: message.recipient_role,
          }))}
        />
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="card p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-1.5 text-base font-extrabold"><Calendar className="text-base text-sage" /> {l("Room monitor", "Monitor de salas")}</h2>
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-ink-soft"><span className="h-1.5 w-1.5 rounded-full bg-sage" /> {l("Admin access", "Acceso admin")}</span>
          </div>
          <p className="mt-0.5 text-[10px] font-semibold text-ink-soft">{l("Open any room to read the translated chat and confirm the session is appropriate.", "Abre cualquier sala para leer el chat traducido y confirmar que la sesión es apropiada.")}</p>
          <div className="mt-3 divide-y divide-ink/8">
            {sessions.map((session) => (
              <div key={session.id} className="flex flex-wrap items-center gap-2 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-extrabold">{session.student_name} + {session.volunteer_name}</p>
                  <p className="text-[9px] font-semibold text-ink-soft">{session.subject} · {formatDateTime(session.scheduled_at)}</p>
                </div>
                <Badge color={session.status === "completed" ? "sage" : session.status === "cancelled" ? "coral" : "yellow"}>{session.status}</Badge>
                <a href={`/session/${session.id}`} className="inline-flex items-center gap-1 text-[10px] font-extrabold text-coral">
                  {l("Inspect", "Inspeccionar")} <ArrowRight className="text-xs" />
                </a>
              </div>
            ))}
            {sessions.length === 0 ? <p className="py-5 text-xs font-semibold text-ink-soft">No sessions to monitor yet.</p> : null}
          </div>
        </section>

        <div className="space-y-5">
          <section className="card p-5">
            <h2 className="flex items-center gap-1.5 text-base font-extrabold"><Clock className="text-base text-coral" /> {l("Moderation log", "Registro de moderación")}</h2>
            <div className="mt-3 space-y-3">
              {audit.map((entry) => (
                <div key={entry.id} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-lilac" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold leading-relaxed text-ink-soft">{entry.detail || entry.action}</p>
                    <p className="text-[8px] font-bold uppercase tracking-wide text-ink-soft/60">{entry.actor_name || "System"} · {timeAgo(entry.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-ink/10 bg-yellow-soft/50 p-4">
            <p className="flex items-center gap-1.5 text-xs font-extrabold"><Shield className="text-sm text-[#7a5a0c]" /> {l("Escalation protocol", "Protocolo de escalamiento")}</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-[10px] font-semibold leading-relaxed text-ink-soft">
              <li>Review the full thread in the room before acting.</li>
              <li>Delete messages that share or request personal contact details.</li>
              <li>Message the guardian through the admin account and document it.</li>
              <li>Pause volunteer access immediately if harm is suspected.</li>
              <li>Call emergency services if a student is in immediate danger.</li>
            </ol>
            <p className="mt-2 flex items-center gap-1 text-[9px] font-bold text-ink-soft/80"><Check className="text-xs text-sage" /> Every action lands in the audit log automatically.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
