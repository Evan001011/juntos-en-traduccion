import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { getAttempts, getModuleRows } from "@/lib/data";
import { getStudentLearning } from "@/lib/learning";
import { getLocale, localized } from "@/lib/locale";
import { PageHeader, Badge, StatCard } from "@/components/ui";
import { LearningHub } from "@/components/learning-hub";
import { Download, Flame, Sparkles, Target, Trophy } from "@/components/icons";

export const metadata: Metadata = { title: "Learning hub" };
export const dynamic = "force-dynamic";

export default async function StudentLearningPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string }>;
}) {
  const user = await requireRole("student");
  const { module: moduleParam } = await searchParams;
  const locale = await getLocale();
  const l = localized(locale);
  const modules = await getModuleRows();
  const attempts = await getAttempts(user.id);
  const learning = await getStudentLearning(user.id, user.needs);
  const requested = Number(moduleParam);
  const initialModuleId = modules.some((module) => module.id === requested) ? requested : null;
  const weakest = learning.skills.find((skill) => skill.score <= 3) || learning.skills[0];
  const focusSkill = weakest?.skill || learning.recommendations[0]?.module.skill || "Fractions";

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={l("Your learning hub", "Tu centro de aprendizaje")}
        title={l("Practice what actually needs practice.", "Practica lo que de verdad necesitas.")}
        sub={l(
          "When a tutor marks a skill, decks targeting that exact gap move to the top. Games, flashcards and offline kits — all in one place.",
          "Cuando un tutor evalúa una habilidad, las barajas para esa brecha suben al inicio. Juegos, tarjetas y kits sin conexión — todo en un lugar.",
        )}
        actions={
          <a href={`/api/offline-kit?module=${learning.recommendations[0]?.module.id || modules[0]?.id || ""}`} className="btn btn-white btn-sm">
            <Download className="text-sm" /> {l("Offline kit", "Kit sin conexión")}
          </a>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={l("Level", "Nivel")} value={learning.level} accent="coral" emoji="✨" hint={`${learning.xpIntoLevel}/120 XP ${l("to next", "al siguiente")}`} />
        <StatCard label={l("Total XP", "XP total")} value={learning.xp} accent="yellow" emoji="⭐" hint={`${learning.completedSessions} ${l("sessions", "sesiones")}`} />
        <StatCard label={l("Week streak", "Racha")} value={`${learning.streak}w`} accent="sage" emoji="🔥" hint={l("Keep it alive", "Mantenla viva")} />
        <StatCard label={l("Focus skill", "Habilidad foco")} value={focusSkill} accent="lilac" emoji="🎯" hint={weakest ? `${weakest.score}/5 ${l("latest score", "última nota")}` : l("Start a session", "Empieza una sesión")} />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-ink/10 bg-yellow-soft/50 px-4 py-3">
        <Sparkles className="text-lg text-[#7a5a0c]" />
        <p className="text-[12px] font-bold text-[#7a5a0c]">
          {l("Recommended first:", "Recomendado primero:")} {learning.recommendations[0]?.module.title}
        </p>
        <Badge color="yellow">{learning.recommendations[0]?.module.skill}</Badge>
        <p className="text-[10px] font-semibold text-ink-soft">{learning.recommendations[0]?.reason}</p>
      </div>

      <LearningHub
        modules={modules}
        attempts={attempts.map((attempt) => ({ module_id: attempt.module_id, score: attempt.score, total: attempt.total, created_at: attempt.created_at }))}
        recommendations={learning.recommendations.map((rec) => ({ moduleId: rec.module.id, reason: rec.reason, focusSkill: rec.focusSkill }))}
        initialModuleId={initialModuleId}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-4">
          <p className="flex items-center gap-1.5 text-xs font-extrabold"><Target className="text-sm text-coral" /> {l("How decks are picked", "Cómo se eligen las barajas")}</p>
          <p className="mt-1.5 text-[11px] font-semibold leading-relaxed text-ink-soft">
            {l(
              "Tutor skill ratings are stored after every session. Anything at 3/5 or below gets a matching deck and moves to the top.",
              "Las notas del tutor se guardan después de cada sesión. Todo lo que esté en 3/5 o menos recibe una baraja y sube al inicio.",
            )}
          </p>
        </div>
        <div className="card p-4">
          <p className="flex items-center gap-1.5 text-xs font-extrabold"><Trophy className="text-sm text-[#7a5a0c]" /> {l("How XP works", "Cómo funciona el XP")}</p>
          <p className="mt-1.5 text-[11px] font-semibold leading-relaxed text-ink-soft">
            {l("Sessions earn 40 XP, decks earn 10 + 2 per correct answer, worksheets earn up to 30.", "Las sesiones dan 40 XP, las barajas 10 + 2 por respuesta correcta, las hojas hasta 30.")}
          </p>
        </div>
        <div className="card p-4">
          <p className="flex items-center gap-1.5 text-xs font-extrabold"><Flame className="text-sm text-coral" /> {l("Built for low bandwidth", "Hecho para poco internet")}</p>
          <p className="mt-1.5 text-[11px] font-semibold leading-relaxed text-ink-soft">
            {l("Every deck downloads as a self-contained HTML kit that flips and prints without internet.", "Cada baraja se descarga como un HTML autónomo que funciona e imprime sin internet.")}
          </p>
        </div>
      </div>
    </div>
  );
}
