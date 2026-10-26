"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DAY_SHORT, GRID_SLOTS, GRID_STEP_MIN, TZ_LABEL } from "@/lib/constants";
import { minutesLabel } from "@/lib/time";
import { Check, Clock, Sparkles } from "./icons";

type Block = { day_of_week: number; start_min: number; end_min: number };

export function AvailabilityGrid({
  initialBlocks,
  accent = "coral",
  compact = false,
}: {
  initialBlocks: Block[];
  accent?: "coral" | "sage";
  compact?: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(() => {
    const cells = new Set<string>();
    for (const block of initialBlocks) {
      for (let minute = block.start_min; minute + GRID_STEP_MIN <= block.end_min; minute += GRID_STEP_MIN) {
        cells.add(`${block.day_of_week}-${minute}`);
      }
    }
    return cells;
  });
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const selectedColor = accent === "coral" ? "bg-coral" : "bg-sage";
  const selectedHover = accent === "coral" ? "hover:bg-coral/80" : "hover:bg-sage/80";

  function toggle(day: number, minute: number) {
    setSaved(false);
    setSelected((current) => {
      const next = new Set(current);
      const key = `${day}-${minute}`;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const blocks = useMemo(() => {
    const result: Array<{ day: number; start: number; end: number }> = [];
    for (let day = 0; day < 7; day++) {
      let runStart: number | null = null;
      for (const minute of GRID_SLOTS) {
        const active = selected.has(`${day}-${minute}`);
        if (active && runStart === null) runStart = minute;
        if (!active && runStart !== null) {
          result.push({ day, start: runStart, end: minute });
          runStart = null;
        }
      }
      if (runStart !== null) result.push({ day, start: runStart, end: GRID_SLOTS[GRID_SLOTS.length - 1] + GRID_STEP_MIN });
    }
    return result;
  }, [selected]);

  const totalMinutes = blocks.reduce((sum, block) => sum + (block.end - block.start), 0);

  const grouped = useMemo(() => {
    const byDay = new Map<number, Array<{ start: number; end: number }>>();
    for (const block of blocks) {
      const list = byDay.get(block.day) || [];
      list.push(block);
      byDay.set(block.day, list);
    }
    return Array.from(byDay.entries()).sort((a, b) => a[0] - b[0]);
  }, [blocks]);

  async function save() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Could not save availability.");
      }
      setSaved(true);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save availability.");
    } finally {
      setBusy(false);
    }
  }

  function presetWeekdayEvening() {
    const cells = new Set<string>();
    for (const day of [1, 2, 3, 4]) {
      for (let minute = 16 * 60; minute < 18 * 60; minute += GRID_STEP_MIN) cells.add(`${day}-${minute}`);
    }
    setSelected(cells);
    setSaved(false);
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 bg-cream/60 px-4 py-3.5">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-extrabold"><Clock className="text-base text-ink-soft" /> Weekly availability</p>
          <p className="mt-0.5 text-[11px] font-semibold text-ink-soft">Tap the blocks when you can meet · after-school window, {TZ_LABEL}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={presetWeekdayEvening} className="btn btn-white btn-sm">
            <Sparkles className="text-sm" /> Weekdays 4–6
          </button>
          <button type="button" onClick={() => { setSelected(new Set()); setSaved(false); }} className="btn btn-ghost btn-sm">
            Clear
          </button>
        </div>
      </div>

      <div className="overflow-x-auto p-3 sm:p-4">
        <div className="min-w-[620px]">
          <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1.5">
            <div />
            {DAY_SHORT.map((day) => (
              <div key={day} className="pb-1 text-center text-[10px] font-extrabold uppercase tracking-wide text-ink-soft">{day}</div>
            ))}
            {GRID_SLOTS.map((minute) => (
              <div key={minute} className="contents">
                <div className="flex h-8 items-center justify-end pr-2 text-[9px] font-bold text-ink-soft">
                  {minute % 60 === 0 ? minutesLabel(minute).replace(":00", "") : ""}
                </div>
                {Array.from({ length: 7 }, (_, day) => {
                  const key = `${day}-${minute}`;
                  const active = selected.has(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggle(day, minute)}
                      aria-pressed={active}
                      aria-label={`${DAY_SHORT[day]} ${minutesLabel(minute)}${active ? ", available" : ""}`}
                      className={`h-8 rounded-lg border transition ${
                        active
                          ? `${selectedColor} border-transparent ${selectedHover}`
                          : "border-ink/8 bg-white hover:border-ink/20 hover:bg-cream"
                      }`}
                    >
                      {active ? <Check className="mx-auto text-[10px] text-white" /> : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 px-4 py-3.5">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold">
            {(totalMinutes / 60).toFixed(totalMinutes % 60 === 0 ? 0 : 1)} hours / week selected
          </p>
          <p className="mt-0.5 max-w-lg truncate text-[10px] font-semibold text-ink-soft">
            {grouped.length
              ? grouped.map(([day, ranges]) => `${DAY_SHORT[day]} ${ranges.map((r) => `${minutesLabel(r.start)}–${minutesLabel(r.end)}`).join(", ")}`).join(" · ")
              : "No times selected yet"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {error ? <span className="text-[10px] font-bold text-coral">{error}</span> : null}
          {saved ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-sage"><Check className="text-sm" /> Saved</span>
          ) : null}
          <button type="button" onClick={save} disabled={busy} className={`btn btn-sm ${accent === "coral" ? "btn-coral" : "btn-sage"}`}>
            {busy ? "Saving…" : compact ? "Save times" : "Save availability"}
          </button>
        </div>
      </div>
    </div>
  );
}
