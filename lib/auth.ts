import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { randomBytes } from "node:crypto";
import type { NextResponse } from "next/server";
import { batch, db } from "./db";
import { hashPassword, verifyPassword } from "./password";
import { ROLE_HOME } from "./constants";

export type Role = "student" | "volunteer" | "admin";

export type AppUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  grade_level: number | null;
  timezone: string;
  languages: string;
  bio: string | null;
  guardian_name: string | null;
  guardian_email: string | null;
  guardian_consent_at: string | null;
  approved: number;
  avatar_color: string;
  created_at: string;
  subjects: string[];
  needs: string[];
};

const COOKIE = "juntos_session";
const DAYS = 30;

type UserRow = Omit<AppUser, "subjects" | "needs">;

async function hydrateSubjects(user: UserRow): Promise<AppUser> {
  const subjects = await db
    .prepare("SELECT subject FROM user_subjects WHERE user_id = ? AND kind = 'teach' ORDER BY subject")
    .all<{ subject: string }>(user.id);
  const needs = await db
    .prepare("SELECT subject FROM user_subjects WHERE user_id = ? AND kind = 'need' ORDER BY subject")
    .all<{ subject: string }>(user.id);
  return { ...user, subjects: subjects.map((s) => s.subject), needs: needs.map((s) => s.subject) };
}

export async function findUserByEmail(email: string): Promise<(UserRow & { password_hash: string }) | undefined> {
  return db
    .prepare("SELECT * FROM users WHERE lower(email) = lower(?)")
    .get<UserRow & { password_hash: string }>(email.trim());
}

export async function findUserById(id: number): Promise<AppUser | undefined> {
  const row = await db.prepare("SELECT * FROM users WHERE id = ?").get<UserRow>(id);
  return row ? hydrateSubjects(row) : undefined;
}

export const getCurrentUser = cache(async (): Promise<AppUser | null> => {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const row = await db
    .prepare(
      `SELECT u.* FROM auth_sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`,
    )
    .get<UserRow>(token, new Date().toISOString());
  return row ? hydrateSubjects(row) : null;
});

export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: Role): Promise<AppUser> {
  const user = await requireUser();
  if (user.role !== role) redirect(ROLE_HOME[user.role] || "/");
  return user;
}

export async function apiUser(roles?: Role[]): Promise<{ user: AppUser } | { error: NextResponse }> {
  const { NextResponse } = await import("next/server");
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Please sign in to continue." }, { status: 401 }) };
  if (roles && !roles.includes(user.role)) {
    return { error: NextResponse.json({ error: "You do not have access to this action." }, { status: 403 }) };
  }
  return { user };
}

export async function createLoginSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + DAYS * 86_400_000).toISOString();
  await db.prepare("INSERT INTO auth_sessions (token, user_id, expires_at) VALUES (?, ?, ?)").run(token, userId, expires);
  return token;
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DAYS * 86_400,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) await db.prepare("DELETE FROM auth_sessions WHERE token = ?").run(token);
  store.delete(COOKIE);
}

export async function authenticate(email: string, password: string): Promise<{ user?: AppUser; error?: string }> {
  const row = await findUserByEmail(email);
  if (!row || !verifyPassword(password, row.password_hash)) {
    return { error: "That email and password don't match. Try the demo accounts below." };
  }
  const user = await findUserById(row.id);
  return { user };
}

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: "student" | "volunteer";
  gradeLevel?: number | null;
  subjects?: string[];
  languages?: string[];
  guardianName?: string;
  guardianEmail?: string;
  guardianConsent?: boolean;
  bio?: string;
};

export async function registerUser(input: RegisterInput): Promise<{ user?: AppUser; error?: string }> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (name.length < 2) return { error: "Please share your full name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email address." };
  if (input.password.length < 8) return { error: "Your password needs at least 8 characters." };
  if (await findUserByEmail(email)) return { error: "An account with that email already exists. Try signing in." };

  if (input.role === "student") {
    if (!input.guardianName?.trim() || !input.guardianEmail?.trim()) {
      return { error: "A parent or guardian name and email are required for student accounts." };
    }
    if (!input.guardianConsent) return { error: "A guardian must approve the account before it can be created." };
  }

  const languages = (input.languages && input.languages.length ? input.languages : ["en"]).join(",");
  const avatarColors = ["coral", "yellow", "sage", "lilac", "pink", "mint", "blue"];
  const kind = input.role === "student" ? "need" : "teach";

  // One atomic D1 batch: the user row is inserted first, and the follow-up rows
  // look the new id up by the unique email so no round trip is required.
  const statements = [
    {
      sql: `INSERT INTO users (name, email, password_hash, role, grade_level, languages, bio, guardian_name, guardian_email, guardian_consent_at, approved, avatar_color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        name,
        email,
        hashPassword(input.password),
        input.role,
        input.gradeLevel ?? null,
        languages,
        input.bio?.trim() || null,
        input.role === "student" ? input.guardianName?.trim() || null : null,
        input.role === "student" ? input.guardianEmail?.trim() || null : null,
        input.role === "student" ? new Date().toISOString() : null,
        input.role === "volunteer" ? 0 : 1,
        avatarColors[Math.floor(Math.random() * avatarColors.length)],
      ],
    },
    ...(input.subjects || []).map((subject) => ({
      sql: "INSERT OR IGNORE INTO user_subjects (user_id, subject, kind) SELECT id, ?, ? FROM users WHERE email = ?",
      params: [subject, kind, email],
    })),
    ...(input.role === "student"
      ? [1, 2, 3, 4].map((day) => ({
          sql: "INSERT INTO availability (user_id, day_of_week, start_min, end_min) SELECT id, ?, ?, ? FROM users WHERE email = ?",
          params: [day, 16 * 60, 19 * 60, email],
        }))
      : []),
    {
      sql: "INSERT INTO audit_log (actor_id, action, detail) SELECT id, ?, ? FROM users WHERE email = ?",
      params: [
        input.role === "volunteer" ? "volunteer_applied" : "student_registered",
        `${name} joined as a ${input.role}.`,
        email,
      ],
    },
  ];

  try {
    await batch(statements);
    const created = await findUserByEmail(email);
    return created ? { user: await findUserById(created.id) } : { error: "We could not create your account. Please try again." };
  } catch (error) {
    console.error("register failed", error);
    return { error: "We could not create your account. Please try again." };
  }
}

export function touchLastSeen(_userId: number) {
  // Reserved for future presence tracking.
}
