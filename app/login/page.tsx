import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/constants";
import { getLocale } from "@/lib/locale";

export const metadata: Metadata = { title: "Log in" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(ROLE_HOME[user.role] || "/");
  const locale = await getLocale();
  return (
    <AuthShell variant="login">
      <LoginForm locale={locale} />
    </AuthShell>
  );
}
