import { NextResponse, type NextRequest } from "next/server";
import { authenticate, createLoginSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

  const result = await authenticate(email, password);
  if (!result.user) return NextResponse.json({ error: result.error }, { status: 401 });

  const token = await createLoginSession(result.user.id);
  await setSessionCookie(token);
  return NextResponse.json({ ok: true, role: result.user.role, approved: result.user.approved, name: result.user.name });
}
