export const SUBJECTS = [
  "Math",
  "English",
  "Science",
  "Writing",
  "Spanish",
  "History",
  "Test Prep",
] as const;

export type Subject = (typeof SUBJECTS)[number];

export const SKILLS = [
  "Fractions",
  "Algebra",
  "Reading Comprehension",
  "Writing",
  "Vocabulary",
  "Science",
  "Study Skills",
  "Spanish Literacy",
  "Test Strategy",
] as const;

export type Skill = (typeof SKILLS)[number];

export const SKILLS_BY_SUBJECT: Record<string, string[]> = {
  Math: ["Fractions", "Algebra", "Study Skills"],
  English: ["Reading Comprehension", "Vocabulary", "Writing"],
  Science: ["Science", "Study Skills"],
  Writing: ["Writing", "Reading Comprehension"],
  Spanish: ["Spanish Literacy", "Vocabulary"],
  History: ["Reading Comprehension", "Writing"],
  "Test Prep": ["Test Strategy", "Study Skills"],
};

export const SCHOOL_TZ = process.env.NEXT_PUBLIC_SCHOOL_TZ || "America/New_York";
export const TZ_LABEL = "ET";

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** 3:00 PM to 8:00 PM in 30 minute blocks — the after-school window. */
export const GRID_START_MIN = 15 * 60;
export const GRID_END_MIN = 20 * 60;
export const GRID_STEP_MIN = 30;
export const GRID_SLOTS = Array.from(
  { length: (GRID_END_MIN - GRID_START_MIN) / GRID_STEP_MIN },
  (_, i) => GRID_START_MIN + i * GRID_STEP_MIN,
);

export const ACCENTS = {
  coral: { bg: "#FFD9D4", ink: "#B62B2B", solid: "#FF5252" },
  yellow: { bg: "#FFF0C2", ink: "#8A6412", solid: "#FFC83B" },
  sage: { bg: "#E4EBCF", ink: "#5A6B35", solid: "#9BB068" },
  lilac: { bg: "#F0E2F6", ink: "#7A4E8C", solid: "#CCA4DB" },
  pink: { bg: "#FFE1E6", ink: "#A63E55", solid: "#FFB7C5" },
  mint: { bg: "#DDF0E8", ink: "#3E7A68", solid: "#9BD3BF" },
  blue: { bg: "#DCEFF6", ink: "#376C82", solid: "#A9D6E5" },
} as const;

export type AccentKey = keyof typeof ACCENTS;

export const AVATAR_ACCENTS: AccentKey[] = ["coral", "yellow", "sage", "lilac", "pink", "mint", "blue"];

export const ROLE_HOME: Record<string, string> = {
  student: "/student",
  volunteer: "/volunteer",
  admin: "/admin",
};

export const DEMO_PASSWORD = "demo1234";
