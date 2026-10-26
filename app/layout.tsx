import type { Metadata } from "next";
import { Caveat, Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/lib/locale";
import { I18nProvider } from "@/components/i18n";
import { TranslatorDock } from "@/components/translator-dock";

const display = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: "swap" });
const body = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });
const hand = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Juntos en Traducción — Free peer tutoring, in your language",
    template: "%s · Juntos en Traducción",
  },
  description:
    "A student-led, bilingual tutoring community. Smart matching, real lesson plans, private messaging and built-in translation — free for every student.",
  openGraph: {
    title: "Juntos en Traducción",
    description: "Free peer tutoring, in your language. Student-built, guardian-approved, community-powered.",
    type: "website",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${display.variable} ${body.variable} ${hand.variable}`}>
      <body>
        <I18nProvider initialLocale={locale}>
          {children}
          <TranslatorDock />
        </I18nProvider>
      </body>
    </html>
  );
}
