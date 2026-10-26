"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export type Locale = "en" | "es";

type Dict = Record<string, { en: string; es: string }>;

const strings: Dict = {
  "nav.mission": { en: "Our mission", es: "Nuestra misión" },
  "nav.how": { en: "How it works", es: "Cómo funciona" },
  "nav.impact": { en: "Impact", es: "Impacto" },
  "nav.faq": { en: "FAQ", es: "Preguntas" },
  "nav.login": { en: "Log in", es: "Iniciar sesión" },
  "nav.logout": { en: "Log out", es: "Cerrar sesión" },
  "nav.join": { en: "Join free", es: "Únete gratis" },
  "nav.students": { en: "I need a tutor", es: "Necesito un tutor" },
  "nav.volunteers": { en: "I want to tutor", es: "Quiero ser tutor" },
  "common.language": { en: "Language", es: "Idioma" },
  "common.menu": { en: "Menu", es: "Menú" },
  "common.openMenu": { en: "Open menu", es: "Abrir menú" },
  "common.close": { en: "Close", es: "Cerrar" },
  "common.copy": { en: "Copy", es: "Copiar" },
  "common.copied": { en: "Copied!", es: "¡Copiado!" },
  "common.listen": { en: "Listen", es: "Escuchar" },
  "common.swap": { en: "Swap languages", es: "Cambiar idiomas" },
  "common.send": { en: "Send", es: "Enviar" },
  "common.translate": { en: "Translate", es: "Traducir" },
  "common.quickPhrases": { en: "Quick phrases", es: "Frases rápidas" },
  "common.privacy": {
    en: "Privacy-first: student text never leaves this device.",
    es: "Privacidad primero: el texto nunca sale de este dispositivo.",
  },
  "translator.title": { en: "Classroom translator", es: "Traductor de clase" },
  "translator.sub": { en: "English ↔ Spanish, built for tutoring sessions.", es: "Inglés ↔ Español, hecho para tutorías." },
  "translator.placeholder": { en: "Type something to translate…", es: "Escribe algo para traducir…" },
  "translator.toSpanish": { en: "English → Spanish", es: "Inglés → Español" },
  "translator.toEnglish": { en: "Spanish → English", es: "Español → Inglés" },
  "translator.offline": { en: "Works offline", es: "Funciona sin internet" },
  "translator.modePhrasebook": { en: "Phrasebook match", es: "Frase del diccionario" },
  "translator.modePartial": { en: "Word-by-word draft — check with the student", es: "Borrador palabra por palabra" },
  "translator.modeUnchanged": { en: "No match yet — try a shorter classroom phrase", es: "Aún sin coincidencia — prueba una frase más corta" },
  "translator.result": { en: "Translation", es: "Traducción" },
  "translator.meetingHint": {
    en: "Tip: keep this open during a meeting for back-and-forth support.",
    es: "Consejo: déjalo abierto durante la reunión para apoyar la conversación.",
  },
  "portal.student": { en: "Student portal", es: "Portal del estudiante" },
  "portal.volunteer": { en: "Volunteer portal", es: "Portal del voluntario" },
  "portal.admin": { en: "Admin dashboard", es: "Panel de administración" },
  "portal.overview": { en: "Overview", es: "Resumen" },
  "portal.sessions": { en: "Sessions", es: "Sesiones" },
  "portal.messages": { en: "Messages", es: "Mensajes" },
  "portal.learning": { en: "Learning hub", es: "Centro de aprendizaje" },
  "portal.worksheets": { en: "Worksheets", es: "Hojas de trabajo" },
  "portal.availability": { en: "Availability", es: "Disponibilidad" },
  "portal.lessons": { en: "Lesson library", es: "Biblioteca de lecciones" },
  "portal.safety": { en: "Safety", es: "Seguridad" },
  "portal.volunteers": { en: "Volunteers", es: "Voluntarios" },
  "portal.impact": { en: "Impact report", es: "Informe de impacto" },
  "portal.findTutor": { en: "Find a tutor", es: "Buscar tutor" },
  "portal.students": { en: "My students", es: "Mis estudiantes" },
  "role.student": { en: "Student", es: "Estudiante" },
  "role.volunteer": { en: "Volunteer", es: "Voluntario" },
  "role.admin": { en: "Admin", es: "Administrador" },
  "common.backHome": { en: "Back to home", es: "Volver al inicio" },
  "common.viewAll": { en: "View all", es: "Ver todo" },
  "common.loading": { en: "Loading…", es: "Cargando…" },
};

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue>({
  locale: "en",
  setLocale: () => undefined,
  t: (key) => key,
});

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      document.cookie = `juntos_lang=${next}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    },
    [router],
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const entry = strings[key];
      let value = entry ? entry[locale] : key;
      if (vars) {
        for (const [name, replacement] of Object.entries(vars)) {
          value = value.replaceAll(`{${name}}`, String(replacement));
        }
      }
      return value;
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function T({ k, vars, className }: { k: string; vars?: Record<string, string | number>; className?: string }) {
  const { t } = useI18n();
  return <span className={className}>{t(k, vars)}</span>;
}

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();
  return (
    <div
      className={`inline-flex items-center rounded-full border-2 border-ink/10 bg-white p-1 ${compact ? "" : "shadow-[0_2px_0_rgba(48,42,37,0.06)]"}`}
      role="group"
      aria-label="Language"
    >
      {(["en", "es"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLocale(lang)}
          aria-pressed={locale === lang}
          className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide transition ${
            locale === lang ? "bg-ink text-white" : "text-ink-soft hover:bg-ink/5"
          }`}
        >
          {lang === "en" ? "EN" : "ES"}
        </button>
      ))}
    </div>
  );
}
