"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Clock, Video } from "./icons";
import type { MatchSlot } from "@/lib/matching";
import { formatDate, formatTime } from "@/lib/time";

export function BookingSlots({
  volunteerId,
  slots,
  subjects,
  compact = false,
}: {
  volunteerId: number;
  slots: MatchSlot[];
  subjects: string[];
  compact?: boolean;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState(subjects[0] || "Math");
  const [busySlot, setBusySlot] = useState<string | null>(null);
  const [booked, setBooked] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function book(slot: MatchSlot) {
    setBusySlot(slot.iso);
    setError("");
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId, start: slot.iso, subject }),
      });
      const data = (await response.json()) as { ok?: boolean; id?: number; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not book that time.");
      setBooked(slot.iso);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not book that time.");
    } finally {
      setBusySlot(null);
    }
  }

  if (booked) {
    return (
      <div className="rounded-2xl border border-sage/40 bg-sage-soft/70 p-4">
        <p className="flex items-center gap-1.5 text-sm font-extrabold text-[#52622f]">
          <Check className="text-base" /> You're booked!
        </p>
        <p className="mt-1 text-[11px] font-semibold text-ink-soft">
          {formatDate(booked)} at {formatTime(booked)} · a Google Meet link and calendar invite are ready.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/student/sessions" className="btn btn-sage btn-sm">See my sessions</Link>
          <button type="button" onClick={() => setBooked(null)} className="btn btn-white btn-sm">Book another</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {subjects.length > 1 ? (
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-soft">Subject</span>
          {subjects.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSubject(option)}
              className={`rounded-full px-2 py-1 text-[10px] font-extrabold transition ${
                subject === option ? "bg-ink text-white" : "border border-ink/10 bg-white text-ink-soft"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
      <div className={`grid gap-2 ${compact ? "" : "sm:grid-cols-2"}`}>
        {slots.map((slot) => (
          <div key={slot.iso} className="flex items-center justify-between gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2">
            <div>
              <p className="text-[11px] font-extrabold">{formatDate(slot.iso)}</p>
              <p className="flex items-center gap-1 text-[10px] font-semibold text-ink-soft">
                <Clock className="text-[10px]" /> {formatTime(slot.iso)} · 45 min
              </p>
            </div>
            <button
              type="button"
              onClick={() => void book(slot)}
              disabled={busySlot !== null}
              className="btn btn-coral btn-sm !px-3 !py-1.5 text-[10px]"
            >
              {busySlot === slot.iso ? "…" : "Book"}
            </button>
          </div>
        ))}
      </div>
      {error ? <p className="mt-2 text-[10px] font-bold text-coral">{error}</p> : null}
      <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-ink-soft">
        <Video className="text-xs" /> Google Meet link + calendar invite created instantly.
      </p>
    </div>
  );
}
