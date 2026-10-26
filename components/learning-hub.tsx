"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ACCENTS, type AccentKey } from "@/lib/constants";
import type { LearningModule } from "@/lib/data";
import { Badge } from "./ui";
import { ArrowRight, Book, Check, Download, Play, Search, Sparkles, Target, Trophy, X } from "./icons";

type AttemptSummary = { module_id: number; score: number; total: number; created_at: string };
type Recommendation = { moduleId: number; reason: string; focusSkill: string | null };

type Mode = "menu" | "flash" | "quiz" | "done";

export function LearningHub({
  modules,
  attempts,
  recommendations,
  initialModuleId,
}: {
  modules: LearningModule[];
  attempts: AttemptSummary[];
  recommendations: Recommendation[];
  initialModuleId: number | null;
}) {
  const [filter, setFilter] = useState<"for-you" | "all">("for-you");
  const [subject, setSubject] = useState("All");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(initialModuleId);
  const [mode, setMode] = useState<Mode>("menu");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [xp, setXp] = useState<number | null>(null);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const savedRef = useRef(false);

  const recMap = useMemo(() => new Map(recommendations.map((rec) => [rec.moduleId, rec])), [recommendations]);
  const bestAttempts = useMemo(() => {
    const map = new Map<number, AttemptSummary>();
    for (const attempt of attempts) {
      const current = map.get(attempt.module_id);
      if (!current || attempt.score / attempt.total > current.score / current.total) map.set(attempt.module_id, attempt);
    }
    return map;
  }, [attempts]);

  const subjects = useMemo(() => ["All", ...Array.from(new Set(modules.map((m) => m.subject)))], [modules]);

  const visible = useMemo(() => {
    let list = [...modules];
    if (filter === "for-you") {
      list = list
        .filter((module) => recMap.has(module.id))
        .sort((a, b) => {
          const ai = recommendations.findIndex((r) => r.moduleId === a.id);
          const bi = recommendations.findIndex((r) => r.moduleId === b.id);
          return ai - bi;
        });
    }
    if (subject !== "All") list = list.filter((module) => module.subject === subject);
    if (query.trim()) {
      const term = query.toLowerCase();
      list = list.filter((module) => `${module.title} ${module.skill} ${module.blurb}`.toLowerCase().includes(term));
    }
    return list;
  }, [modules, filter, subject, query, recMap, recommendations]);

  const activeModule = modules.find((module) => module.id === openId) || null;

  useEffect(() => {
    if (!activeModule) return;
    setMode("menu");
    setIndex(0);
    setFlipped(false);
    setKnown(0);
    setCorrect(0);
    setSelected(null);
    setXp(null);
    setResult(null);
    setSaving(false);
    savedRef.current = false;
  }, [activeModule?.id]);

  function close() {
    setOpenId(null);
  }

  function nextFlash(nextKnown: number) {
    if (!activeModule) return;
    if (index + 1 >= activeModule.cards.length) {
      void finish(nextKnown, activeModule.cards.length);
      return;
    }
    setNowKnown(nextKnown);
  }

  function setNowKnown(nextKnown: number) {
    setKnown(nextKnown);
    setIndex((current) => current + 1);
    setFlipped(false);
  }

  async function finish(score: number, total: number) {
    if (!activeModule || savedRef.current) return;
    savedRef.current = true;
    setResult({ score, total });
    setMode("done");
    setSaving(true);
    try {
      const response = await fetch("/api/learning/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId: activeModule.id, score, total }),
      });
      if (response.ok) {
        const data = (await response.json()) as { xp?: number };
        setXp(data.xp ?? null);
      }
    } catch {
      setXp(null);
    } finally {
      setSaving(false);
    }
  }

  function startFlash() {
    setMode("flash");
    setIndex(0);
    setFlipped(false);
    setKnown(0);
    setCorrect(0);
    setSelected(null);
    setXp(null);
    setResult(null);
    savedRef.current = false;
  }

  function startQuiz() {
    setMode("quiz");
    setIndex(0);
    setSelected(null);
    setCorrect(0);
    setKnown(0);
    setXp(null);
    setResult(null);
    savedRef.current = false;
  }

  function quizOptions(module: LearningModule, cardIndex: number) {
    const card = module.cards[cardIndex];
    const pool = module.cards.filter((_, i) => i !== cardIndex).map((c) => c.back);
    const extra = [
      "Not enough information",
      "Subtract the numerator only",
      "It stays the same",
      "Multiply the denominators",
    ];
    const options = new Set<string>([card.back]);
    for (const value of [...pool, ...extra]) {
      if (options.size >= 4) break;
      if (value !== card.back) options.add(value);
    }
    return Array.from(options).sort((a, b) => a.localeCompare(b));
  }

  const progress = activeModule ? Math.round(((index + (mode === "done" ? 1 : 0)) / activeModule.cards.length) * 100) : 0;

  return (
    <>
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-cream p-1">
            <button
              type="button"
              onClick={() => setFilter("for-you")}
              className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold transition ${filter === "for-you" ? "bg-coral text-white" : "text-ink-soft"}`}
            >
              <Sparkles className="mr-1 inline text-xs" /> For you
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold transition ${filter === "all" ? "bg-ink text-white" : "text-ink-soft"}`}
            >
              All decks
            </button>
          </div>
          <div className="relative min-w-[160px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-soft" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search skills, e.g. fractions"
              className="w-full rounded-full border border-ink/10 bg-white py-2 pl-8 pr-3 text-[11px] font-semibold outline-none focus:border-coral"
              aria-label="Search learning decks"
            />
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {subjects.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSubject(item)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold transition ${
                subject === item ? "bg-ink text-white" : "border border-ink/10 bg-white text-ink-soft hover:border-ink/25"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-ink/15 px-6 py-10 text-center">
          <p className="text-2xl">🔍</p>
          <p className="mt-2 text-sm font-extrabold">No decks here yet</p>
          <p className="mt-1 text-xs font-semibold text-ink-soft">Try another subject or clear your search.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((module) => {
            const rec = recMap.get(module.id);
            const best = bestAttempts.get(module.id);
            const accent = ACCENTS[(module.accent || "yellow") as AccentKey];
            return (
              <div key={module.id} className="card-hover card flex flex-col overflow-hidden">
                <div className="relative flex items-start justify-between p-4 pb-3" style={{ backgroundColor: accent.bg }}>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white bg-white/70 text-2xl shadow-sm">{module.emoji}</span>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-wide" style={{ color: accent.ink }}>{module.grade_band}</span>
                    {best ? <span className="rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-extrabold text-ink">{Math.round((best.score / best.total) * 100)}% best</span> : null}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge color={module.accent}>{module.subject}</Badge>
                    <Badge color="sage">{module.skill}</Badge>
                  </div>
                  <h3 className="mt-2 text-base font-extrabold leading-tight">{module.title}</h3>
                  <p className="mt-1 flex-1 text-[11px] font-semibold leading-relaxed text-ink-soft">{module.blurb}</p>
                  {rec ? (
                    <p className="mt-2 flex items-start gap-1 rounded-xl bg-cream px-2 py-1.5 text-[10px] font-bold text-ink-soft">
                      <Target className="mt-0.5 shrink-0 text-xs text-coral" /> {rec.reason}
                    </p>
                  ) : null}
                  <div className="mt-3 flex items-center gap-1.5">
                    <button type="button" onClick={() => setOpenId(module.id)} className="btn btn-ink btn-sm flex-1 text-[11px]">
                      <Play className="text-xs" /> {best ? "Play again" : "Start deck"}
                    </button>
                    <a
                      href={`/api/offline-kit?module=${module.id}`}
                      className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 bg-white text-ink-soft transition hover:text-coral"
                      title="Download offline kit"
                      aria-label={`Download offline kit for ${module.title}`}
                    >
                      <Download className="text-sm" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeModule ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/55 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={activeModule.title}>
          <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-[28px] bg-paper sm:max-w-2xl sm:rounded-[28px]">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-ink/10 bg-paper/95 px-4 py-3 backdrop-blur">
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cream text-lg">{activeModule.emoji}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold">{activeModule.title}</p>
                  <p className="text-[10px] font-semibold text-ink-soft">{activeModule.skill} · {activeModule.grade_band}</p>
                </div>
              </div>
              <button type="button" onClick={close} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink/5 text-ink-soft hover:bg-ink/10" aria-label="Close deck">
                <X className="text-sm" />
              </button>
            </div>

            <div className="p-5">
              {mode === "menu" ? (
                <div>
                  <div className="rounded-2xl bg-cream p-4">
                    <p className="font-hand text-2xl text-coral">Ready?</p>
                    <p className="mt-1 text-sm font-bold leading-snug">{activeModule.blurb}</p>
                    <p className="mt-2 text-[11px] font-semibold text-ink-soft">
                      {activeModule.cards.length} cards · about 4 minutes · practice or quiz mode.
                    </p>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button type="button" onClick={startFlash} className="btn btn-coral w-full py-3">
                      <Book className="text-base" /> Flashcards
                    </button>
                    <button type="button" onClick={startQuiz} className="btn btn-ink w-full py-3">
                      <Trophy className="text-base" /> Quick quiz
                    </button>
                  </div>
                  <a href={`/api/offline-kit?module=${activeModule.id}`} className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-ink-soft hover:text-coral">
                    <Download className="text-sm" /> Download printable / offline kit
                  </a>
                </div>
              ) : null}

              {mode === "flash" ? (
                <div>
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">
                    <span>Card {index + 1} of {activeModule.cards.length}</span>
                    <span>{known} known</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/10">
                    <div className="h-full rounded-full bg-coral transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFlipped((value) => !value)}
                    className="mt-4 grid min-h-[240px] w-full place-items-center rounded-3xl border-2 border-ink/10 bg-white p-6 text-center transition hover:border-coral/30"
                  >
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-ink-soft">{flipped ? "Answer" : "Question"}</p>
                      <p className="mt-3 text-[clamp(1.15rem,3vw,1.6rem)] font-extrabold leading-snug">
                        {flipped ? activeModule.cards[index].back : activeModule.cards[index].front}
                      </p>
                      {flipped ? (
                        <p className="mt-3 rounded-full bg-yellow-soft px-3 py-1.5 text-[10px] font-bold text-[#7a5a0c]">💡 {activeModule.cards[index].hint}</p>
                      ) : (
                        <p className="mt-4 text-[10px] font-bold text-ink-soft">Tap the card to reveal the answer</p>
                      )}
                    </div>
                  </button>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!flipped) {
                          setFlipped(true);
                          return;
                        }
                        setIndex((current) => (current + 1 >= activeModule.cards.length ? current : current + 1));
                        setFlipped(false);
                      }}
                      disabled={index + 1 >= activeModule.cards.length && flipped}
                      className="btn btn-white py-2.5 text-xs"
                    >
                      Review again
                    </button>
                    <button
                      type="button"
                      onClick={() => (flipped ? nextFlash(known + 1) : setFlipped(true))}
                      className="btn btn-sage py-2.5 text-xs"
                    >
                      <Check className="text-sm" /> {flipped ? "Got it" : "Reveal"}
                    </button>
                  </div>
                  <div className="mt-3 text-center">
                    <button type="button" onClick={() => void finish(known, activeModule.cards.length)} className="text-[10px] font-bold text-ink-soft underline underline-offset-2">
                      Finish and save XP
                    </button>
                  </div>
                </div>
              ) : null}

              {mode === "quiz" ? (
                <div>
                  <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">
                    <span>Question {index + 1} of {activeModule.cards.length}</span>
                    <span>{correct} correct</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/10">
                    <div className="h-full rounded-full bg-sage transition-all" style={{ width: `${(index / activeModule.cards.length) * 100}%` }} />
                  </div>
                  <p className="mt-4 text-lg font-extrabold leading-snug">{activeModule.cards[index].front}</p>
                  <div className="mt-4 grid gap-2">
                    {quizOptions(activeModule, index).map((option) => {
                      const isSelected = selected === option;
                      const isCorrect = option === activeModule.cards[index].back;
                      let classes = "border-ink/10 bg-white hover:border-ink/25";
                      if (selected) {
                        if (isCorrect) classes = "border-sage bg-sage-soft text-[#52622f]";
                        else if (isSelected) classes = "border-coral bg-coral-soft text-[#a02727]";
                        else classes = "border-ink/10 bg-white opacity-60";
                      }
                      return (
                        <button
                          key={option}
                          type="button"
                          disabled={Boolean(selected)}
                          onClick={() => {
                            setSelected(option);
                            if (isCorrect) setCorrect((value) => value + 1);
                          }}
                          className={`rounded-xl border-2 px-3.5 py-2.5 text-left text-xs font-bold transition ${classes}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {selected ? (
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-cream px-3.5 py-3">
                      <p className={`text-xs font-extrabold ${selected === activeModule.cards[index].back ? "text-[#52622f]" : "text-[#a02727]"}`}>
                        {selected === activeModule.cards[index].back ? "Correct! 🎉" : `Not quite — answer: ${activeModule.cards[index].back}`}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (index + 1 >= activeModule.cards.length) {
                            void finish(correct, activeModule.cards.length);
                          } else {
                            setIndex((current) => current + 1);
                            setSelected(null);
                          }
                        }}
                        className="btn btn-ink btn-sm shrink-0"
                      >
                        {index + 1 >= activeModule.cards.length ? "Finish" : "Next"} <ArrowRight className="text-sm" />
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {mode === "done" ? (
                <div className="py-4 text-center">
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-yellow-soft text-4xl">🏆</div>
                  <p className="mt-3 text-2xl font-extrabold">Deck complete!</p>
                  <p className="mt-1 text-sm font-semibold text-ink-soft">{activeModule.title}</p>
                  <div className="mx-auto mt-4 grid max-w-xs grid-cols-2 gap-2">
                    <div className="rounded-2xl bg-cream p-3">
                      <p className="text-xl font-extrabold">{result?.score ?? 0}/{result?.total ?? activeModule.cards.length}</p>
                      <p className="text-[9px] font-extrabold uppercase tracking-wide text-ink-soft">Correct</p>
                    </div>
                    <div className="rounded-2xl bg-sage-soft p-3">
                      <p className="text-xl font-extrabold text-[#52622f]">{saving ? "…" : xp ? `+${xp}` : "—"}</p>
                      <p className="text-[9px] font-extrabold uppercase tracking-wide text-ink-soft">XP earned</p>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] font-semibold text-ink-soft">
                    {mode === "done" ? "This attempt now feeds your learning plan." : ""}
                  </p>
                  <div className="mx-auto mt-5 grid max-w-sm gap-2 sm:grid-cols-2">
                    <button type="button" onClick={startFlash} className="btn btn-white btn-sm">Play again</button>
                    <button type="button" onClick={close} className="btn btn-coral btn-sm">Back to decks</button>
                  </div>
                  <a href={`/api/offline-kit?module=${activeModule.id}`} className="mt-3 inline-flex items-center gap-1 text-[10px] font-extrabold text-ink-soft hover:text-coral">
                    <Download className="text-xs" /> Take it offline
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
