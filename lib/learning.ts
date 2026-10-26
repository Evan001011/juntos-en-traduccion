import {
  getAttempts,
  getLatestSkillScores,
  getModuleRows,
  getSessionsForStudent,
  getSkillScores,
  getStudentWorksheets,
  type LearningModule,
} from "./data";
import { isoWeekKey, parseLocal } from "./time";

export type Recommendation = {
  module: LearningModule;
  reason: string;
  weight: number;
  focusSkill: string | null;
};

export type Badge = {
  id: string;
  label: string;
  emoji: string;
  earned: boolean;
  hint: string;
};

export type StudentLearning = {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForNext: number;
  streak: number;
  badges: Badge[];
  recommendations: Recommendation[];
  skills: Awaited<ReturnType<typeof getLatestSkillScores>>;
  completedSessions: number;
  completedWorksheets: number;
};

export async function getRecommendations(studentId: number, needs: string[]): Promise<Recommendation[]> {
  const modules = await getModuleRows();
  const scores = await getLatestSkillScores(studentId);
  const scoreBySkill = new Map(scores.map((s) => [s.skill, s.score]));
  const attemptRows = await getAttempts(studentId);
  const attempted = new Map<string, number>();
  for (const attempt of attemptRows) attempted.set(attempt.skill, (attempted.get(attempt.skill) || 0) + 1);

  return modules
    .map((module) => {
      const score = scoreBySkill.get(module.skill);
      const isWeak = typeof score === "number" && score <= 3;
      const isStrong = typeof score === "number" && score >= 4;
      const subjectNeed = needs.includes(module.subject);
      let weight = 10;
      let reason = "A fresh skill to explore";
      if (isWeak) {
        weight = 60 + (4 - score!) * 12;
        reason = `${module.skill} is at ${score}/5 — this deck targets it directly`;
      } else if (subjectNeed) {
        weight = 42 + (attempted.has(module.skill) ? 0 : 8);
        reason = `Matches your ${module.subject} goal and keeps practice fun`;
      } else if (isStrong) {
        weight = 18;
        reason = `You are strong here — try it as a confidence boost`;
      }
      if (attempted.has(module.skill)) weight -= 10;
      return { module, reason, weight, focusSkill: isWeak ? module.skill : null };
    })
    .sort((a, b) => b.weight - a.weight || a.module.id - b.module.id);
}

export async function getStudentLearning(studentId: number, needs: string[]): Promise<StudentLearning> {
  const sessions = (await getSessionsForStudent(studentId)).filter((s) => s.status === "completed");
  const attempts = await getAttempts(studentId);
  const worksheets = (await getStudentWorksheets(studentId)).filter((w) => w.assignment_status === "completed");
  const xp =
    sessions.length * 40 +
    attempts.reduce((sum, a) => sum + a.xp, 0) +
    worksheets.reduce((sum, w) => sum + 10 + Math.round((w.score || 0) / 5), 0);

  const level = Math.floor(xp / 120) + 1;
  const xpIntoLevel = xp % 120;

  const activityDates: Date[] = [
    ...sessions.map((s) => parseLocal(s.scheduled_at).date),
    ...attempts.map((a) => new Date(a.created_at.replace(" ", "T"))),
    ...worksheets.map((w) => new Date((w.completed_at || w.assigned_at).replace(" ", "T"))),
  ].filter((d) => !Number.isNaN(d.getTime()));

  const weeks = new Set(activityDates.map((d) => isoWeekKey(d)));
  let streak = 0;
  const cursor = new Date();
  if (!weeks.has(isoWeekKey(cursor))) cursor.setDate(cursor.getDate() - 7);
  while (weeks.has(isoWeekKey(cursor)) && streak < 52) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }

  const skills = await getLatestSkillScores(studentId);
  const skillMap = new Map(skills.map((s) => [s.skill, s.score]));
  const attemptedSkills = new Set(attempts.map((a) => a.skill));
  const readingSkills = new Set(["Reading Comprehension", "Vocabulary", "Spanish Literacy"]);
  const allScores = await getSkillScores(studentId);

  const badges: Badge[] = [
    {
      id: "first-session",
      label: "First Step",
      emoji: "🌱",
      earned: sessions.length >= 1,
      hint: "Complete your first tutoring session",
    },
    {
      id: "five-sessions",
      label: "Five & Thriving",
      emoji: "🔥",
      earned: sessions.length >= 5,
      hint: "Complete five sessions",
    },
    {
      id: "worksheet-whiz",
      label: "Worksheet Whiz",
      emoji: "📒",
      earned: worksheets.length >= 2,
      hint: "Finish two worksheets",
    },
    {
      id: "fraction-fan",
      label: "Fraction Fan",
      emoji: "🍕",
      earned: attemptedSkills.has("Fractions"),
      hint: "Play the Fraction Party deck",
    },
    {
      id: "bookworm",
      label: "Bookworm",
      emoji: "📚",
      earned: Array.from(readingSkills).some((skill) => attemptedSkills.has(skill)),
      hint: "Try a reading deck",
    },
    {
      id: "streak",
      label: "On a Roll",
      emoji: "⚡",
      earned: streak >= 2,
      hint: "Learn two weeks in a row",
    },
    {
      id: "math-maven",
      label: "Math Maven",
      emoji: "🧠",
      earned: (skillMap.get("Algebra") || 0) >= 4 || (skillMap.get("Fractions") || 0) >= 4,
      hint: "Reach 4/5 in a math skill",
    },
    {
      id: "bilingual",
      label: "Bilingual Bridge",
      emoji: "🌉",
      earned: allScores.some((s) => s.skill === "Spanish Literacy") || attempts.some((a) => a.skill === "Spanish Literacy"),
      hint: "Practise a Spanish literacy deck",
    },
  ];

  return {
    xp,
    level,
    xpIntoLevel,
    xpForNext: 120,
    streak,
    badges,
    recommendations: await getRecommendations(studentId, needs),
    skills,
    completedSessions: sessions.length,
    completedWorksheets: worksheets.length,
  };
}

export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,!?;:'"]/g, "")
    .replace(/\s*cups?$/, "")
    .replace(/\s*of\s*a\s*cup$/, "");
}

export function isAnswerCorrect(response: string, expected: string): boolean {
  const a = normalizeAnswer(response);
  const b = normalizeAnswer(expected);
  if (a === b) return true;
  const fractionValue = (text: string) => {
    const frac = /^(-?\d+)\s*\/\s*(\d+)$/.exec(text);
    if (frac) return Number(frac[1]) / Number(frac[2]);
    const mixed = /^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(text);
    if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
    const num = Number(text);
    return Number.isNaN(num) ? null : num;
  };
  const av = fractionValue(a);
  const bv = fractionValue(b);
  if (av !== null && bv !== null) return Math.abs(av - bv) < 0.0001;
  return b.includes(a) && a.length > 3;
}
