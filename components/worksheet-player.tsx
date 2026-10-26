"use client";

import { useState } from "react";
import { Check, Download, Printer, Sparkles, Target, X } from "./icons";

type Question = { id: number; prompt: string; hint: string | null };
type ResultRow = { questionId: number; correct: boolean; expected: string };
type Result = { score: number; correctCount: number; total: number; results: ResultRow[] };

export function WorksheetPlayer({
  assignmentId,
  worksheetTitle,
  subject,
  gradeBand,
  description,
  tutorName,
  questions,
  initialResponses,
  initialResult,
}: {
  assignmentId: number;
  worksheetTitle: string;
  subject: string;
  gradeBand: string | null;
  description: string | null;
  tutorName: string;
  questions: Question[];
  initialResponses: Record<number, string>;
  initialResult: Result | null;
}) {
  const [responses, setResponses] = useState<Record<number, string>>(initialResponses);
  const [result, setResult] = useState<Result | null>(initialResult);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [openHints, setOpenHints] = useState<Set<number>>(new Set());

  const expectedById = new Map((result?.results || []).map((row) => [row.questionId, row]));
  const answeredCount = questions.filter((question) => (responses[question.id] || "").trim()).length;

  async function submit() {
    if (answeredCount < questions.length) {
      setError("Answer every question before submitting — partial guesses don't help us build your plan.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/worksheets/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId,
          answers: questions.map((question) => ({ questionId: question.id, response: responses[question.id] || "" })),
        }),
      });
      const data = (await response.json()) as Result & { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not submit your answers.");
      setResult({ score: data.score, correctCount: data.correctCount, total: data.total, results: data.results });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not submit your answers.");
    } finally {
      setBusy(false);
    }
  }

  function retry() {
    setResult(null);
    setResponses({});
    setShowKey(false);
    setError("");
  }

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 bg-yellow-soft/70 px-5 py-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#7a5a0c]">{subject} · {gradeBand || "All grades"}</p>
            <h2 className="mt-1 text-xl font-extrabold">{worksheetTitle}</h2>
            <p className="mt-0.5 text-[11px] font-semibold text-ink-soft">From {tutorName} · {questions.length} questions</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => window.print()} className="btn btn-white btn-sm no-print">
              <Printer className="text-sm" /> Print
            </button>
            <a href={`/api/offline-kit?assignment=${assignmentId}`} className="btn btn-white btn-sm no-print">
              <Download className="text-sm" /> Offline kit
            </a>
          </div>
        </div>
        {description ? (
          <div className="whitespace-pre-wrap border-t border-ink/10 bg-paper px-5 py-4 text-[13px] font-semibold leading-relaxed text-ink-soft">
            {description}
          </div>
        ) : null}
      </div>

      {result ? (
        <div className="card overflow-hidden">
          <div className={`flex flex-wrap items-center justify-between gap-4 px-5 py-4 ${result.score >= 70 ? "bg-sage-soft" : "bg-coral-soft"}`}>
            <div className="flex items-center gap-3">
              <div
                className="grid h-16 w-16 place-items-center rounded-full"
                style={{ background: `conic-gradient(${result.score >= 70 ? "#9BB068" : "#FF5252"} ${result.score}%, #efe9dc 0)` }}
              >
                <div className="grid h-[52px] w-[52px] place-items-center rounded-full bg-white text-sm font-extrabold">{result.score}%</div>
              </div>
              <div>
                <p className="text-lg font-extrabold">{result.score >= 70 ? "Nice work! 🎉" : "Good effort — let's review 💪"}</p>
                <p className="text-[11px] font-semibold text-ink-soft">
                  {result.correctCount} of {result.total} correct. Submitted to {tutorName}.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setShowKey((value) => !value)} className="btn btn-white btn-sm">
                {showKey ? "Hide answer key" : "Show answer key"}
              </button>
              <button type="button" onClick={retry} className="btn btn-ink btn-sm no-print">Try again</button>
            </div>
          </div>
          {showKey ? (
            <div className="grid gap-2 px-5 py-4 sm:grid-cols-2">
              {questions.map((question, index) => (
                <div key={question.id} className="rounded-xl bg-cream px-3 py-2">
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-ink-soft">Question {index + 1}</p>
                  <p className="text-xs font-extrabold">{expectedById.get(question.id)?.expected || "—"}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-ink/10 bg-white px-4 py-2.5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-ink-soft">
            <Target className="text-sm text-coral" /> {answeredCount}/{questions.length} answered · auto-graded instantly
          </p>
          <span className="text-[10px] font-extrabold text-ink-soft">Answers save to your tutor</span>
        </div>
      )}

      <div className="space-y-3">
        {questions.map((question, index) => {
          const row = expectedById.get(question.id);
          const hintOpen = openHints.has(question.id);
          return (
            <div key={question.id} className={`card p-4 sm:p-5 ${row ? (row.correct ? "border-sage/40" : "border-coral/30") : ""}`}>
              <div className="flex items-start gap-3">
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-extrabold ${
                    row ? (row.correct ? "bg-sage text-white" : "bg-coral text-white") : "bg-cream text-ink-soft"
                  }`}
                >
                  {row ? row.correct ? <Check className="text-sm" /> : <X className="text-sm" /> : index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-extrabold leading-relaxed">{question.prompt}</p>
                  {question.hint ? (
                    <button
                      type="button"
                      onClick={() =>
                        setOpenHints((current) => {
                          const next = new Set(current);
                          if (next.has(question.id)) next.delete(question.id);
                          else next.add(question.id);
                          return next;
                        })
                      }
                      className="mt-1.5 text-[10px] font-extrabold text-coral underline decoration-dotted underline-offset-2"
                    >
                      {hintOpen ? "Hide hint" : "Need a hint?"}
                    </button>
                  ) : null}
                  {hintOpen ? <p className="mt-1 rounded-lg bg-yellow-soft/60 px-2.5 py-1.5 text-[10px] font-semibold text-[#7a5a0c]">💡 {question.hint}</p> : null}

                  <div className="mt-3">
                    {row ? (
                      <div className="space-y-1.5">
                        <div className={`rounded-xl px-3 py-2 text-xs font-bold ${row.correct ? "bg-sage-soft/70 text-[#52622f]" : "bg-coral-soft/70 text-[#a02727]"}`}>
                          Your answer: {responses[question.id] || "—"}
                        </div>
                        {!row.correct ? (
                          <div className="rounded-xl bg-cream px-3 py-2 text-xs font-bold text-ink-soft">
                            Correct answer: {row.expected}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <input
                        value={responses[question.id] || ""}
                        onChange={(event) => setResponses((current) => ({ ...current, [question.id]: event.target.value.slice(0, 500) }))}
                        placeholder="Type your answer…"
                        className="input py-2.5 text-sm"
                        aria-label={`Answer to question ${index + 1}`}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {error ? <p className="rounded-xl border border-coral/30 bg-coral-soft/70 px-3 py-2.5 text-xs font-bold text-[#a02727]">{error}</p> : null}

      {!result ? (
        <div className="sticky bottom-3 flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-paper/95 px-4 py-3 shadow-lg backdrop-blur">
          <p className="hidden text-[10px] font-semibold text-ink-soft sm:block">
            <Sparkles className="mr-1 inline text-sm text-coral" /> Answers are graded instantly and shared with your tutor.
          </p>
          <button type="button" onClick={() => void submit()} disabled={busy} className="btn btn-coral w-full sm:w-auto">
            {busy ? "Checking…" : "Submit answers"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
