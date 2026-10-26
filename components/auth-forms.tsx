"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Avatar, Sticker } from "./ui";
import { ArrowRight, Check, Lock, Shield, Sparkles } from "./icons";
import { SUBJECTS } from "@/lib/constants";
import type { Locale } from "@/lib/locale";

function l(locale: Locale, en: string, es: string) {
  return locale === "es" ? es : en;
}

const DEMO_ACCOUNTS = [
  {
    name: "Lucía Fernández",
    email: "lucia@juntos.org",
    role: "Student",
    roleEs: "Estudiante",
    color: "coral",
    detail: "Grade 7 · learning fractions",
    detailEs: "7.º grado · aprendiendo fracciones",
  },
  {
    name: "Mateo Álvarez",
    email: "mateo@juntos.org",
    role: "Volunteer",
    roleEs: "Voluntario",
    color: "yellow",
    detail: "Math + Science tutor",
    detailEs: "Tutor de Matemáticas + Ciencias",
  },
  {
    name: "Elena Ruiz",
    email: "admin@juntos.org",
    role: "Admin",
    roleEs: "Administradora",
    color: "lilac",
    detail: "Safety + program lead",
    detailEs: "Seguridad + líder del programa",
  },
];

export function LoginForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingDemo, setPendingDemo] = useState<string | null>(null);

  async function signIn(nextEmail: string, nextPassword: string) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nextEmail, password: nextPassword }),
      });
      const data = (await response.json()) as { ok?: boolean; role?: string; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error || l(locale, "We could not sign you in.", "No pudimos iniciar sesión."));
        return;
      }
      router.push(`/${data.role}`);
      router.refresh();
    } catch {
      setError(l(locale, "Something went wrong. Please try again.", "Algo salió mal. Intenta de nuevo."));
    } finally {
      setBusy(false);
      setPendingDemo(null);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void signIn(email, password);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[clamp(1.9rem,4vw,2.5rem)] font-semibold leading-tight">
          {l(locale, "Log in to Juntos", "Inicia sesión en Juntos")}
        </h1>
        <p className="mt-2 text-sm font-semibold text-ink-soft">
          {l(
            locale,
            "Students, volunteers and admins all use the same door.",
            "Estudiantes, voluntarios y administradores usan la misma puerta.",
          )}
        </p>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4 p-5 sm:p-6">
        <div>
          <label className="label" htmlFor="email">
            {l(locale, "Email", "Correo electrónico")}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input"
            placeholder="you@school.org"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            {l(locale, "Password", "Contraseña")}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input"
            placeholder="••••••••"
          />
        </div>
        {error ? (
          <p role="alert" className="rounded-xl border border-coral/30 bg-coral-soft/70 px-3 py-2.5 text-xs font-bold text-[#a02727]">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={busy} className="btn btn-coral w-full py-3">
          {busy && !pendingDemo ? l(locale, "Signing in…", "Iniciando sesión…") : l(locale, "Log in", "Iniciar sesión")}
          <ArrowRight className="text-base" />
        </button>
        <p className="flex items-center justify-center gap-1.5 text-center text-[10px] font-semibold text-ink-soft">
          <Lock className="text-xs" />
          {l(locale, "Sessions are private and expire automatically.", "Las sesiones son privadas y expiran automáticamente.")}
        </p>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-ink/10" />
        <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-ink-soft">
          {l(locale, "Or jump into a demo", "O entra a una demo")}
        </span>
        <span className="h-px flex-1 bg-ink/10" />
      </div>

      <div className="space-y-2">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            type="button"
            onClick={() => {
              setPendingDemo(account.email);
              setEmail(account.email);
              setPassword("demo1234");
              void signIn(account.email, "demo1234");
            }}
            disabled={busy}
            className="group flex w-full items-center gap-3 rounded-2xl border border-ink/10 bg-white px-3 py-2.5 text-left transition hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-[0_4px_0_rgba(48,42,37,0.06)] disabled:opacity-60"
          >
            <Avatar name={account.name} color={account.color} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-extrabold">{account.name}</span>
                <span className="rounded-full bg-cream px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-ink-soft">
                  {l(locale, account.role, account.roleEs)}
                </span>
              </span>
              <span className="mt-0.5 block truncate text-[10px] font-semibold text-ink-soft">
                {l(locale, account.detail, account.detailEs)} · {account.email}
              </span>
            </span>
            <span className="text-[10px] font-extrabold text-coral opacity-0 transition group-hover:opacity-100">
              {pendingDemo === account.email ? l(locale, "Opening…", "Abriendo…") : l(locale, "Open", "Abrir")}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-2.5 text-center text-[10px] font-semibold text-ink-soft">
        {l(locale, "All demo accounts use the password", "Todas las cuentas demo usan la contraseña")}{" "}
        <code className="rounded bg-white px-1.5 py-0.5 font-extrabold">demo1234</code>
      </p>

      <p className="mt-6 text-center text-xs font-semibold text-ink-soft">
        {l(locale, "New here?", "¿Primera vez?")}{" "}
        <Link href="/signup/student" className="link-underline">
          {l(locale, "Create a student account", "Crea una cuenta de estudiante")}
        </Link>{" "}
        {l(locale, "or", "o")}{" "}
        <Link href="/signup/volunteer" className="link-underline">
          {l(locale, "apply to tutor", "aplica para tutor")}
        </Link>
        .
      </p>
    </div>
  );
}

export function SignupForm({ role, locale }: { role: "student" | "volunteer"; locale: Locale }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState(role === "student" ? "7" : "11");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(["en"]);
  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isStudent = role === "student";

  function toggle(list: string[], value: string) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!selectedSubjects.length) {
      setError(l(locale, "Pick at least one subject so we can match you well.", "Elige al menos una materia para conectarte mejor."));
      return;
    }
    if (isStudent && !guardianConsent) {
      setError(l(locale, "A parent or guardian must approve this account.", "Un tutor legal debe aprobar esta cuenta."));
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          gradeLevel: Number(grade),
          subjects: selectedSubjects,
          languages,
          guardianName,
          guardianEmail,
          guardianConsent,
          bio,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; role?: string; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error || l(locale, "We could not create your account.", "No pudimos crear tu cuenta."));
        return;
      }
      router.push(`/${data.role}`);
      router.refresh();
    } catch {
      setError(l(locale, "Something went wrong. Please try again.", "Algo salió mal. Intenta de nuevo."));
    } finally {
      setBusy(false);
    }
  }

  const grades = isStudent
    ? ["4", "5", "6", "7", "8", "9", "10", "11", "12"]
    : ["9", "10", "11", "12", "13"];

  return (
    <div>
      <div className="mb-5 flex items-center gap-1 rounded-full border border-ink/10 bg-white p-1">
        <Link
          href="/signup/student"
          className={`flex-1 rounded-full px-3 py-2 text-center text-xs font-extrabold transition ${
            isStudent ? "bg-ink text-white" : "text-ink-soft hover:bg-ink/5"
          }`}
        >
          {l(locale, "I need a tutor", "Necesito un tutor")}
        </Link>
        <Link
          href="/signup/volunteer"
          className={`flex-1 rounded-full px-3 py-2 text-center text-xs font-extrabold transition ${
            !isStudent ? "bg-ink text-white" : "text-ink-soft hover:bg-ink/5"
          }`}
        >
          {l(locale, "I want to tutor", "Quiero ser tutor")}
        </Link>
      </div>

      <div className="mb-5">
        <h1 className="text-[clamp(1.9rem,4vw,2.5rem)] font-semibold leading-tight">
          {isStudent
            ? l(locale, "Let's build your learning plan.", "Construyamos tu plan de aprendizaje.")
            : l(locale, "Apply to become a tutor.", "Aplica para ser tutor.")}
        </h1>
        <p className="mt-2 text-sm font-semibold text-ink-soft">
          {isStudent
            ? l(locale, "A guardian approves the account. Then the matching begins.", "Un tutor legal aprueba la cuenta. Después empieza el emparejamiento.")
            : l(locale, "An admin reviews every application before your first match.", "Un administrador revisa cada solicitud antes de tu primera conexión.")}
        </p>
      </div>

      <form onSubmit={onSubmit} className="card space-y-5 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">{l(locale, "Full name", "Nombre completo")}</label>
            <input id="name" className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder={l(locale, "Alex Rivera", "Alex Rivera")} autoComplete="name" />
          </div>
          <div>
            <label className="label" htmlFor="grade">{l(locale, isStudent ? "Grade" : "Year in school", isStudent ? "Grado" : "Año escolar")}</label>
            <select id="grade" className="input" value={grade} onChange={(e) => setGrade(e.target.value)}>
              {grades.map((value) => (
                <option key={value} value={value}>
                  {value === "13" ? l(locale, "College / gap year", "Universidad / año libre") : `${l(locale, "Grade", "Grado")} ${value}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="signup-email">{l(locale, "Email", "Correo electrónico")}</label>
            <input id="signup-email" type="email" className="input" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.org" />
          </div>
          <div>
            <label className="label" htmlFor="signup-password">{l(locale, "Password", "Contraseña")}</label>
            <input id="signup-password" type="password" className="input" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={l(locale, "8+ characters", "8+ caracteres")} />
          </div>
        </div>

        <fieldset>
          <legend className="label">{l(locale, isStudent ? "What do you want help with?" : "What can you tutor?", isStudent ? "¿Con qué quieres ayuda?" : "¿Qué puedes tutorar?")}</legend>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((subject) => {
              const active = selectedSubjects.includes(subject);
              return (
                <button
                  key={subject}
                  type="button"
                  onClick={() => setSelectedSubjects((current) => toggle(current, subject))}
                  aria-pressed={active}
                  className={`chip ${active ? "chip-active" : "hover:border-ink/25"}`}
                >
                  {active ? <Check className="text-xs" /> : null}
                  {subject}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="label">{l(locale, "Languages you're comfortable with", "Idiomas con los que te sientes cómodo")}</legend>
          <div className="flex flex-wrap gap-2">
            {[
              ["en", "English"],
              ["es", "Español"],
            ].map(([code, label]) => {
              const active = languages.includes(code);
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguages((current) => toggle(current, code))}
                  aria-pressed={active}
                  className={`chip ${active ? "chip-active" : "hover:border-ink/25"}`}
                >
                  {active ? <Check className="text-xs" /> : null}
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {isStudent ? (
          <div className="rounded-2xl border-2 border-dashed border-ink/15 bg-yellow-soft/40 p-4">
            <div className="flex items-center gap-2">
              <Shield className="text-base text-[#7a5a0c]" />
              <p className="text-xs font-extrabold">{l(locale, "Guardian approval", "Aprobación del tutor legal")}</p>
            </div>
            <p className="mt-1.5 text-[11px] font-semibold leading-relaxed text-ink-soft">
              {l(
                locale,
                "Because most students are minors, we collect a guardian's permission before the account is activated. In production, they'd receive a confirmation email.",
                "Como la mayoría de estudiantes son menores, pedimos permiso a un tutor legal antes de activar la cuenta. En producción, recibirían un correo de confirmación.",
              )}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="guardian-name">{l(locale, "Guardian name", "Nombre del tutor")}</label>
                <input id="guardian-name" className="input" required value={guardianName} onChange={(e) => setGuardianName(e.target.value)} placeholder={l(locale, "Marta Fernández", "Marta Fernández")} />
              </div>
              <div>
                <label className="label" htmlFor="guardian-email">{l(locale, "Guardian email", "Correo del tutor")}</label>
                <input id="guardian-email" type="email" className="input" required value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} placeholder="guardian@example.org" />
              </div>
            </div>
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-[11px] font-semibold leading-snug text-ink-soft">
              <input
                type="checkbox"
                checked={guardianConsent}
                onChange={(e) => setGuardianConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#FF5252]"
                required
              />
              {l(
                locale,
                "I am this student's parent or guardian, and I consent to Juntos en Traducción collecting this information to provide free tutoring.",
                "Soy el padre, la madre o el tutor legal de este estudiante y doy permiso a Juntos en Traducción para usar esta información y brindar tutoría gratuita.",
              )}
            </label>
          </div>
        ) : (
          <>
            <div>
              <label className="label" htmlFor="bio">{l(locale, "Short bio", "Biografía corta")}</label>
              <textarea id="bio" className="input min-h-[80px] resize-y" value={bio} onChange={(e) => setBio(e.target.value)} placeholder={l(locale, "I explain algebra with skateboard ramps and pizza fractions.", "Explico álgebra con rampas de patineta y fracciones de pizza.")} />
            </div>
            <div className="flex items-start gap-2.5 rounded-2xl bg-sky-soft/60 p-3.5">
              <Shield className="mt-0.5 text-base text-[#326176]" />
              <p className="text-[11px] font-semibold leading-relaxed text-ink-soft">
                {l(
                  locale,
                  "Applications are reviewed by a program admin. You can explore the volunteer portal immediately, but matches stay paused until you're approved.",
                  "Un administrador revisa las solicitudes. Puedes explorar el portal de voluntario de inmediato, pero las conexiones quedan en pausa hasta tu aprobación.",
                )}
              </p>
            </div>
          </>
        )}

        {error ? (
          <p role="alert" className="rounded-xl border border-coral/30 bg-coral-soft/70 px-3 py-2.5 text-xs font-bold text-[#a02727]">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={busy} className="btn btn-coral w-full py-3">
          {busy
            ? l(locale, "Creating your account…", "Creando tu cuenta…")
            : isStudent
              ? l(locale, "Create my student account", "Crear mi cuenta de estudiante")
              : l(locale, "Submit my application", "Enviar mi solicitud")}
          <ArrowRight className="text-base" />
        </button>
        <p className="flex items-center justify-center gap-1.5 text-center text-[10px] font-semibold text-ink-soft">
          <Sparkles className="text-xs text-coral" />
          {l(locale, "You can change your subjects and availability any time.", "Puedes cambiar tus materias y disponibilidad cuando quieras.")}
        </p>
      </form>

      <p className="mt-5 text-center text-xs font-semibold text-ink-soft">
        {l(locale, "Already have an account?", "¿Ya tienes una cuenta?")}{" "}
        <Link href="/login" className="link-underline">{l(locale, "Log in", "Iniciar sesión")}</Link>
      </p>
      <div className="mt-5 flex justify-center">
        <Sticker color="yellow" rotate={-2}>
          <Lock className="text-xs" /> {l(locale, "Private by default", "Privado por defecto")}
        </Sticker>
      </div>
    </div>
  );
}
