"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SUBJECTS } from "@/lib/constants";
import { Avatar } from "./ui";
import { Check, Clipboard, Plus, Sparkles, X } from "./icons";

type Student = { id: number; name: string; avatar_color: string; grade_level: number | null };
type Question = { prompt: string; answer: string; hint: string };

const blankQuestion = (): Question => ({ prompt: "", answer: "", hint: "" });

export function WorksheetBuilder({ students, defaultOpen = false, canCreate }: { students: Student[]; defaultOpen?: boolean; canCreate: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Math");
  const [gradeBand, setGradeBand] = useState("Grades 5–7");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([blankQuestion(), blankQuestion()]);
  const [selected, setSelected] = useState<Set<number>>(new Set(students[0] ? [students[0].id] : []));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState("");

  function updateQuestion(index: number, patch: Partial<Question>) {
    setQuestions((current) => current.map((question, i) => (i === index ? { ...question, ...patch } : question)));
  }

  function toggleStudent(id: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit() {
    setError("");
    setCreated("");
    const cleanQuestions = questions.filter((question) => question.prompt.trim() && question.answer.trim());
    if (title.trim().length < 3) return setError("Add a clear worksheet title.");
    if (cleanQuestions.length === 0) return setError("Add at least one question with an answer.");
    if (selected.size === 0) return setError("Choose at least one student to receive it.");
    setBusy(true);
    try {
      const response = await fetch("/api/worksheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subject,
          gradeBand,
          description,
          questions: cleanQuestions,
          studentIds: Array.from(selected),
        }),
      });
      const data = (await response.json()) as { ok?: boolean; id?: number; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not create the worksheet.");
      setCreated(title);
      setTitle("");
      setDescription("");
      setQuestions([blankQuestion(), blankQuestion()]);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create the worksheet.");
    } finally {
      setBusy(false);
    }
  }

  if (!canCreate) {
    return (
      <div className="rounded-3xl border border-yellow/40 bg-yellow-soft/50 p-4 text-[11px] font-bold text-[#7a5a0c]">
        Your volunteer application is pending. Worksheet creation unlocks after an admin approves you.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden" id="new-worksheet">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left" aria-expanded={open}>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-coral-soft text-[#a02727]"><Plus className="text-base" /></span>
        <div className="flex-1">
          <p className="text-sm font-extrabold">Create a worksheet</p>
          <p className="text-[10px] font-semibold text-ink-soft">Questions + answer key + assign to a student</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold ${open ? "bg-ink text-white" : "bg-coral-soft text-[#a02727]"}`}>
          {open ? "Close" : "New"}
        </span>
      </button>

      {created ? (
        <div className="border-t border-sage/30 bg-sage-soft/60 px-4 py-2.5 text-[11px] font-bold text-[#52622f]">
          <Check className="mr-1 inline text-sm" /> "{created}" is now in your students' portals with its answer key.
        </div>
      ) : null}

      {open ? (
        <div className="border-t border-ink/10 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="ws-title">Title</label>
              <input id="ws-title" value={title} onChange={(event) => setTitle(event.target.value)} className="input text-sm" placeholder="Pizza Fractions Practice" />
            </div>
            <div>
              <label className="label" htmlFor="ws-subject">Subject</label>
              <select id="ws-subject" value={subject} onChange={(event) => setSubject(event.target.value)} className="input text-sm">
                {SUBJECTS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="ws-grade">Grade band</label>
              <input id="ws-grade" value={gradeBand} onChange={(event) => setGradeBand(event.target.value)} className="input text-sm" placeholder="Grades 5–7" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="ws-description">Instructions or reading passage (optional)</label>
              <textarea id="ws-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="input resize-y text-sm" placeholder="Directions, a short passage, or encouragement…" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="label mb-0 flex items-center gap-1"><Clipboard className="text-xs" /> Questions & answers</p>
              <button
                type="button"
                onClick={() => setQuestions((current) => (current.length >= 15 ? current : [...current, blankQuestion()]))}
                className="text-[10px] font-extrabold text-coral"
              >
                + Add question
              </button>
            </div>
            <div className="mt-2 space-y-2.5">
              {questions.map((question, index) => (
                <div key={index} className="rounded-2xl border border-ink/8 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-ink-soft">Question {index + 1}</span>
                    {questions.length > 1 ? (
                      <button type="button" onClick={() => setQuestions((current) => current.filter((_, i) => i !== index))} aria-label={`Remove question ${index + 1}`} className="text-ink-soft hover:text-coral">
                        <X className="text-sm" />
                      </button>
                    ) : null}
                  </div>
                  <input
                    value={question.prompt}
                    onChange={(event) => updateQuestion(index, { prompt: event.target.value })}
                    className="input mt-1.5 py-2 text-xs"
                    placeholder="Question prompt"
                  />
                  <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                    <input
                      value={question.answer}
                      onChange={(event) => updateQuestion(index, { answer: event.target.value })}
                      className="input py-2 text-xs"
                      placeholder="Correct answer"
                    />
                    <input
                      value={question.hint}
                      onChange={(event) => updateQuestion(index, { hint: event.target.value })}
                      className="input py-2 text-xs"
                      placeholder="Hint (optional)"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="label">Assign to</p>
            <div className="flex flex-wrap gap-2">
              {students.map((student) => {
                const active = selected.has(student.id);
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => toggleStudent(student.id)}
                    aria-pressed={active}
                    className={`flex items-center gap-2 rounded-full border-2 py-1 pl-1 pr-3 text-[10px] font-extrabold transition ${
                      active ? "border-ink bg-ink text-white" : "border-ink/10 bg-white text-ink-soft"
                    }`}
                  >
                    <Avatar name={student.name} color={student.avatar_color} size="xs" />
                    {student.name.split(" ")[0]}{student.grade_level ? ` · G${student.grade_level}` : ""}
                    {active ? <Check className="text-xs" /> : null}
                  </button>
                );
              })}
            </div>
            {students.length === 0 ? <p className="mt-1 text-[10px] font-semibold text-ink-soft">No students connected yet.</p> : null}
          </div>

          {error ? <p className="mt-3 rounded-xl bg-coral-soft/70 px-3 py-2 text-[10px] font-bold text-[#a02727]">{error}</p> : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1 text-[9px] font-semibold text-ink-soft"><Sparkles className="text-xs text-coral" /> Students get instant grading and the answer key after submitting.</p>
            <button type="button" onClick={() => void submit()} disabled={busy} className="btn btn-coral">
              {busy ? "Creating…" : "Create & assign"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
