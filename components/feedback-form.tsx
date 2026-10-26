"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "./ui";
import { Check, Clipboard, Sparkles, Target } from "./icons";

export function FeedbackForm({
  sessionId,
  studentName,
  studentColor,
  subject,
  dateLabel,
  skillOptions,
  autoOpen = false,
}: {
  sessionId: number;
  studentName: string;
  studentColor: string;
  subject: string;
  dateLabel: string;
  skillOptions: string[];
  autoOpen?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(autoOpen);
  const [summary, setSummary] = useState("");
  const [homework, setHomework] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    setError("");
    if (summary.trim().length < 10) {
      setError("Add a short summary — what clicked, what still needs work.");
      return;
    }
    if (!Object.keys(scores).length) {
      setError("Rate at least one micro-skill so the learning plan can update.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          homework,
          scores: Object.entries(scores).map(([skill, score]) => ({ skill, score })),
        }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not save feedback.");
      setDone(true);
      window.setTimeout(() => router.refresh(), 900);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save feedback.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-sage/40 bg-sage-soft/60 p-5">
        <p className="flex items-center gap-2 text-sm font-extrabold text-[#52622f]"><Check className="text-lg" /> Feedback saved for {studentName}</p>
        <p className="mt-1 text-[11px] font-semibold text-ink-soft">
          The session is marked complete, skill scores are on the student's profile, and their learning plan just updated.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <Avatar name={studentName} color={studentColor} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold">{studentName} · {subject}</p>
          <p className="text-[10px] font-semibold text-ink-soft">{dateLabel}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold ${open ? "bg-ink text-white" : "bg-coral-soft text-[#a02727]"}`}>
          {open ? "Close" : "Log feedback"}
        </span>
      </button>
      {open ? (
        <div className="border-t border-ink/10 p-4">
          <div>
            <label className="label" htmlFor={`summary-${sessionId}`}>Session summary</label>
            <textarea
              id={`summary-${sessionId}`}
              value={summary}
              onChange={(event) => setSummary(event.target.value.slice(0, 2000))}
              rows={3}
              className="input resize-y text-sm"
              placeholder="What clicked? What should we revisit next time?"
            />
          </div>
          <div className="mt-3">
            <label className="label" htmlFor={`homework-${sessionId}`}>Practice for next time (optional)</label>
            <input
              id={`homework-${sessionId}`}
              value={homework}
              onChange={(event) => setHomework(event.target.value.slice(0, 500))}
              className="input text-sm"
              placeholder="e.g. Fractions worksheet, questions 1–3"
            />
          </div>

          <div className="mt-4">
            <p className="label flex items-center gap-1"><Target className="text-xs" /> Micro-skill ratings</p>
            <p className="mb-2 text-[10px] font-semibold text-ink-soft">1 = needs a lot of support · 5 = independent. These update the student's next learning plan.</p>
            <div className="space-y-2">
              {skillOptions.map((skill) => (
                <div key={skill} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink/8 bg-white px-3 py-2">
                  <span className="text-[11px] font-extrabold">{skill}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setScores((current) => ({ ...current, [skill]: rating }))}
                        aria-pressed={scores[skill] === rating}
                        aria-label={`${skill} ${rating} out of 5`}
                        className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-extrabold transition ${
                          scores[skill] === rating
                            ? rating <= 2
                              ? "bg-coral text-white"
                              : rating === 3
                                ? "bg-yellow text-ink"
                                : "bg-sage text-white"
                            : "bg-cream text-ink-soft hover:bg-ink/10"
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error ? <p className="mt-3 rounded-xl bg-coral-soft/70 px-3 py-2 text-[10px] font-bold text-[#a02727]">{error}</p> : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1 text-[9px] font-semibold text-ink-soft">
              <Sparkles className="text-xs text-coral" /> Automatically updates the student's learning plan
            </p>
            <button type="button" onClick={() => void submit()} disabled={busy} className="btn btn-sage">
              <Clipboard className="text-sm" /> {busy ? "Saving…" : "Save feedback & complete"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
