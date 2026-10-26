import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/constants";
import { getLocale } from "@/lib/locale";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ role: string }> }): Promise<Metadata> {
  const { role } = await params;
  return { title: role === "volunteer" ? "Become a tutor" : "Student sign-up" };
}

export default async function SignupPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (role !== "student" && role !== "volunteer") notFound();
  const user = await getCurrentUser();
  if (user) redirect(ROLE_HOME[user.role] || "/");
  const locale = await getLocale();
  return (
    <AuthShell variant={role}>
      <SignupForm role={role} locale={locale} />
    </AuthShell>
  );
}
