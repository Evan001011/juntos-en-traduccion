"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./brand";
import { LanguageToggle, useI18n } from "./i18n";
import { ArrowRight, Menu, X } from "./icons";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  const links: Array<[string, string]> = [
    ["/#mission", t("nav.mission")],
    ["/#how", t("nav.how")],
    ["/#impact", t("nav.impact")],
    ["/#faq", t("nav.faq")],
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur-md no-print">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-full px-3.5 py-2 text-[13px] font-bold text-ink-soft transition hover:bg-ink/5 hover:text-ink"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageToggle compact />
          </div>
          <Link href="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">
            {t("nav.login")}
          </Link>
          <Link href="/signup/student" className="btn btn-coral btn-sm">
            {t("nav.join")}
            <ArrowRight className="text-base" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink/10 bg-white lg:hidden"
            aria-expanded={open}
            aria-label={open ? t("common.close") : t("common.openMenu")}
          >
            {open ? <X className="text-lg" /> : <Menu className="text-lg" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-ink/10 bg-cream px-4 pb-5 pt-3 lg:hidden">
          <nav className="grid gap-1" aria-label="Mobile navigation">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-bold text-ink-soft hover:bg-white"
              >
                {label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/signup/student" onClick={() => setOpen(false)} className="btn btn-coral text-xs">
                {t("nav.students")}
              </Link>
              <Link href="/signup/volunteer" onClick={() => setOpen(false)} className="btn btn-ink text-xs">
                {t("nav.volunteers")}
              </Link>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-ink/10 bg-white px-3 py-2">
              <span className="text-xs font-bold text-ink-soft">{t("common.language")}</span>
              <LanguageToggle compact />
            </div>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl px-3 py-2.5 text-sm font-bold text-ink-soft hover:bg-white"
            >
              {t("nav.login")}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
