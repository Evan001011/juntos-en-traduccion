import { NextResponse, type NextRequest } from "next/server";
import { createLoginSession, registerUser, setSessionCookie } from "@/lib/auth";
import { SUBJECTS } from "@/lib/constants";
import { notifyGoogleChat } from "@/lib/google";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const role = body.role === "volunteer" ? "volunteer" : body.role === "student" ? "student" : null;
  if (!role) return NextResponse.json({ error: "Choose a valid account type." }, { status: 400 });

  const subjects = Array.isArray(body.subjects)
    ? body.subjects.filter((subject): subject is string => typeof subject === "string" && (SUBJECTS as readonly string[]).includes(subject))
    : [];
  const languages = Array.isArray(body.languages)
    ? body.languages.filter((lang): lang is string => lang === "en" || lang === "es")
    : ["en"];
  const gradeLevel = typeof body.gradeLevel === "number" && Number.isFinite(body.gradeLevel) ? body.gradeLevel : null;

  const result = await registerUser({
    name: typeof body.name === "string" ? body.name : "",
    email: typeof body.email === "string" ? body.email : "",
    password: typeof body.password === "string" ? body.password : "",
    role,
    gradeLevel,
    subjects,
    languages,
    guardianName: typeof body.guardianName === "string" ? body.guardianName : undefined,
    guardianEmail: typeof body.guardianEmail === "string" ? body.guardianEmail : undefined,
    guardianConsent: body.guardianConsent === true,
    bio: typeof body.bio === "string" ? body.bio : undefined,
  });

  if (!result.user) return NextResponse.json({ error: result.error }, { status: 400 });

  const token = await createLoginSession(result.user.id);
  await setSessionCookie(token);

  if (role === "volunteer") {
    void notifyGoogleChat(
      `New volunteer application: ${result.user.name} (${result.user.email}) — subjects: ${subjects.join(", ")}. Review in the admin dashboard.`,
    );
  }

  return NextResponse.json({ ok: true, role: result.user.role, approved: result.user.approved, name: result.user.name });
}
