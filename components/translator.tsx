"use client";

import { useCallback, useRef, useState } from "react";
import { QUICK_PHRASES, translateText } from "@/lib/translator";
import { useI18n, type Locale } from "./i18n";
import { Check, Globe, Sparkles, Volume } from "./icons";

type Mode = "phrasebook" | "partial" | "unchanged";

export function TranslatorPanel({ maxHeight }: { maxHeight?: string }) {
  const { locale, t } = useI18n();
  const [from, setFrom] = useState<Locale>(locale === "es" ? "es" : "en");
  const [to, setTo] = useState<Locale>(locale === "es" ? "en" : "es");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [mode, setMode] = useState<Mode | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const requestRef = useRef(0);

  const swap = () => {
    setFrom(to);
    setTo(from);
    if (result) {
      setText(result);
      setResult(text);
      setMode(null);
    }
  };

  const run = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      const requestId = ++requestRef.current;
      setBusy(true);
      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed, from, to }),
        });
        if (!response.ok) throw new Error("translate failed");
        const data = (await response.json()) as { text: string; mode: Mode };
        if (requestRef.current === requestId) {
          setResult(data.text);
          setMode(data.mode);
        }
      } catch {
        const fallback = translateText(trimmed, from, to);
        if (requestRef.current === requestId) {
          setResult(fallback.text);
          setMode(fallback.mode);
        }
      } finally {
        if (requestRef.current === requestId) setBusy(false);
      }
    },
    [from, to],
  );

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard permissions can be blocked; the text is still selectable.
    }
  };

  const speak = () => {
    if (!result || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(result);
    utterance.lang = to === "es" ? "es-ES" : "en-US";
    utterance.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const phraseOptions = QUICK_PHRASES.map((pair) => (from === "en" ? pair.en : pair.es));

  return (
    <div className="flex min-h-0 flex-col" style={{ maxHeight }}>
      <div className="border-b border-ink/10 bg-yellow-soft/60 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
              {t("translator.title")}
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-ink-soft">{t("translator.sub")}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-sage/40 bg-white px-2 py-1 text-[10px] font-extrabold text-[#52622f]">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            {t("translator.offline")}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        <div className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-white p-1.5">
          <button
            type="button"
            onClick={() => setFrom("en")}
            className={`flex-1 rounded-xl px-2 py-1.5 text-xs font-extrabold transition ${
              from === "en" ? "bg-ink text-white" : "text-ink-soft hover:bg-ink/5"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={swap}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-yellow-soft text-ink transition hover:rotate-180"
            aria-label={t("common.swap")}
            title={t("common.swap")}
          >
            <Globe className="text-base" />
          </button>
          <button
            type="button"
            onClick={() => setFrom("es")}
            className={`flex-1 rounded-xl px-2 py-1.5 text-xs font-extrabold transition ${
              from === "es" ? "bg-ink text-white" : "text-ink-soft hover:bg-ink/5"
            }`}
          >
            Español
          </button>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink-soft">
              {from === "en" ? "English" : "Español"} → {to === "en" ? "English" : "Español"}
            </span>
            <span className="text-[10px] font-semibold text-ink-soft/80">{text.length}/500</span>
          </div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value.slice(0, 500))}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                void run(text);
              }
            }}
            rows={3}
            placeholder={t("translator.placeholder")}
            className="input min-h-[84px] resize-y text-sm"
            aria-label={t("translator.placeholder")}
          />
        </div>

        <button
          type="button"
          onClick={() => void run(text)}
          disabled={!text.trim() || busy}
          className="btn btn-coral w-full py-2.5 text-xs"
        >
          <Sparkles className="text-sm" />
          {busy ? t("common.loading") : t("common.translate")}
        </button>

        {result ? (
          <div className="animate-fade-up rounded-2xl border-2 border-ink/10 bg-sage-soft/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink-soft">{t("translator.result")}</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={copy}
                  className="rounded-full bg-white px-2 py-1 text-[10px] font-extrabold text-ink-soft transition hover:text-ink"
                >
                  {copied ? t("common.copied") : t("common.copy")}
                </button>
                <button
                  type="button"
                  onClick={speak}
                  className="grid h-6 w-6 place-items-center rounded-full bg-white text-ink-soft transition hover:text-ink"
                  aria-label={t("common.listen")}
                  title={t("common.listen")}
                >
                  <Volume className="text-xs" />
                </button>
              </div>
            </div>
            <p className="mt-1.5 whitespace-pre-line text-[15px] font-bold leading-snug">{result}</p>
            {mode && mode !== "phrasebook" ? (
              <p className="mt-2 flex items-start gap-1 text-[10px] font-semibold leading-snug text-ink-soft">
                {mode === "partial" ? "✏️ " : "🤔 "}
                {mode === "partial" ? t("translator.modePartial") : t("translator.modeUnchanged")}
              </p>
            ) : (
              <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#52622f]">
                <Check className="text-xs" /> {t("translator.modePhrasebook")}
              </p>
            )}
          </div>
        ) : null}

        <div>
          <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-ink-soft">{t("common.quickPhrases")}</p>
          <div className="flex flex-wrap gap-1.5">
            {phraseOptions.slice(0, 6).map((phrase) => (
              <button
                key={phrase}
                type="button"
                onClick={() => {
                  setText(phrase);
                  void run(phrase);
                }}
                className="rounded-full border border-ink/10 bg-white px-2.5 py-1.5 text-left text-[11px] font-bold text-ink-soft transition hover:-translate-y-0.5 hover:border-coral/40 hover:text-ink"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>

        <p className="flex items-start gap-1.5 text-[10px] font-semibold leading-snug text-ink-soft/80">
          <span aria-hidden="true">🔒</span>
          {t("common.privacy")}
        </p>
      </div>
    </div>
  );
}
