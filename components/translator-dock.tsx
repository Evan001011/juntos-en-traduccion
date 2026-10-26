"use client";

import { useState } from "react";
import { useI18n } from "./i18n";
import { Globe, X } from "./icons";
import { TranslatorPanel } from "./translator";

export function TranslatorDock() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <div className="no-print">
      {open ? (
        <div className="fixed inset-x-0 bottom-0 z-[70] sm:inset-x-auto sm:bottom-24 sm:right-5 sm:w-[392px]">
          <div className="mx-auto flex max-h-[86vh] w-full flex-col overflow-hidden rounded-t-[28px] border-2 border-ink/15 bg-paper shadow-[0_-8px_60px_rgba(48,42,37,0.22)] sm:rounded-[28px] sm:shadow-[0_16px_60px_rgba(48,42,37,0.25)]">
            <div className="flex items-center justify-between border-b border-ink/10 bg-white px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-coral text-white">
                  <Globe className="text-xs" />
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-soft">
                  {t("common.translate")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-full bg-ink/5 text-ink-soft transition hover:bg-ink/10 hover:text-ink"
                aria-label={t("common.close")}
              >
                <X className="text-sm" />
              </button>
            </div>
            <TranslatorPanel maxHeight="calc(86vh - 44px)" />
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-4 z-[65] inline-flex items-center gap-2 rounded-full border-2 border-white/70 bg-ink px-4 py-3 text-xs font-extrabold text-cream shadow-[0_8px_25px_rgba(48,42,37,0.32)] transition hover:-translate-y-0.5 hover:bg-coral sm:bottom-6 sm:right-6"
        aria-expanded={open}
        aria-label={t("common.translate")}
      >
        <Globe className="text-base" />
        <span className="hidden sm:inline">{t("common.translate")}</span>
      </button>
    </div>
  );
}
