import { cookies } from "next/headers";

export type Locale = "en" | "es";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get("juntos_lang")?.value === "es" ? "es" : "en";
}

export function pick<T>(locale: Locale, en: T, es: T): T {
  return locale === "es" ? es : en;
}

export function localized(locale: Locale) {
  return function choose<T>(en: T, es: T): T {
    return pick(locale, en, es);
  };
}
