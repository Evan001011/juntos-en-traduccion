"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "./ui";
import { Check, Shield, X } from "./icons";
import { timeAgo } from "@/lib/time";

type Flagged = {
  id: number;
  body: string;
  flag_reason: string | null;
  created_at: string;
  sender_name: string;
  sender_role: string;
  recipient_name: string;
  recipient_role: string;
};

export function SafetyReview({ messages }: { messages: Flagged[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);

  async function resolve(message: Flagged, action: "dismiss" | "delete") {
    if (busyId) return;
    if (action === "delete" && !window.confirm("Delete this message permanently? The audit log keeps a record of the review.")) return;
    setBusyId(message.id);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: message.id, action }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not update the safety queue.");
      setNotice({
        text: action === "delete" ? "Message deleted. The review is in the audit log." : "Flag cleared. The message stays delivered.",
      });
      router.refresh();
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "Could not update the safety queue.", error: true });
    } finally {
      setBusyId(null);
    }
  }

  if (messages.length === 0) {
    return (
      <div className="rounded-[28px] border-2 border-dashed border-ink/15 bg-white/55 px-6 py-11 text-center">
        <div className="text-4xl">🛡️</div>
        <h3 className="mt-3 text-lg font-bold">Safety queue is clear</h3>
        <p className="mx-auto mt-1 max-w-md text-sm font-semibold text-ink-soft">
          The contact-info filter watches every message and session chat. Flagged messages appear here for a human review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notice ? (
        <p className={`rounded-xl px-3 py-2 text-[11px] font-bold ${notice.error ? "bg-coral-soft/70 text-[#a02727]" : "bg-sage-soft/70 text-[#52622f]"}`}>
          {notice.text}
        </p>
      ) : null}
      {messages.map((message) => (
        <div key={message.id} className="card overflow-hidden border-coral/20">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-coral/15 bg-coral-soft/40 px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-coral text-white"><Shield className="text-xs" /></span>
              <p className="text-[11px] font-extrabold">
                {message.sender_name} <span className="font-semibold text-ink-soft">({message.sender_role})</span> → {message.recipient_name}{" "}
                <span className="font-semibold text-ink-soft">({message.recipient_role})</span>
              </p>
              <Badge color="coral">{message.flag_reason || "contact info"}</Badge>
            </div>
            <span className="text-[9px] font-bold text-ink-soft">{timeAgo(message.created_at)}</span>
          </div>
          <div className="px-4 py-3">
            <p className="rounded-xl border border-ink/8 bg-cream/60 px-3 py-2.5 text-[12px] font-semibold leading-relaxed">“{message.body}”</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[9px] font-semibold text-ink-soft">
                The filter redacts phone numbers, emails and handles before delivery. Review for context; escalate to a guardian if needed.
              </p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => void resolve(message, "dismiss")}
                  disabled={busyId === message.id}
                  className="btn btn-white btn-sm !py-1.5 text-[10px]"
                >
                  <Check className="text-xs" /> Clear flag
                </button>
                <button
                  type="button"
                  onClick={() => void resolve(message, "delete")}
                  disabled={busyId === message.id}
                  className="btn btn-coral btn-sm !py-1.5 text-[10px]"
                >
                  <X className="text-xs" /> Delete message
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
