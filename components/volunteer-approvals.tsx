"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar, Badge } from "./ui";
import { Check, Clock, Search, Shield, Users, X } from "./icons";

type Volunteer = {
  id: number;
  name: string;
  email: string;
  avatar_color: string;
  grade_level: number | null;
  languages: string;
  bio: string | null;
  subjects: string[];
  approved: number;
  sessions: number;
  completed_sessions: number;
  upcoming_sessions: number;
  students: number;
  availability_blocks: number;
};

export function VolunteerApprovals({ volunteers }: { volunteers: Volunteer[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"pending" | "approved" | "all">("pending");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);

  const pendingCount = volunteers.filter((volunteer) => !volunteer.approved).length;
  const approvedCount = volunteers.length - pendingCount;

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return volunteers.filter((volunteer) => {
      if (tab === "pending" && volunteer.approved) return false;
      if (tab === "approved" && !volunteer.approved) return false;
      if (!term) return true;
      return [volunteer.name, volunteer.email, volunteer.subjects.join(" "), volunteer.languages]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [volunteers, tab, query]);

  async function setApproved(volunteer: Volunteer, approved: boolean) {
    if (busyId) return;
    if (!approved && !window.confirm(`Pause ${volunteer.name}? They keep their account but cannot be booked or create worksheets.`)) return;
    setBusyId(volunteer.id);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/volunteers/${volunteer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not update this volunteer.");
      setNotice({
        text: approved
          ? `${volunteer.name} can now be matched with students and create worksheets.`
          : `${volunteer.name}'s access is paused.`,
      });
      router.refresh();
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "Could not update this volunteer.", error: true });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full border border-ink/10 bg-white p-1">
          {[
            { key: "pending" as const, label: `Pending (${pendingCount})` },
            { key: "approved" as const, label: `Approved (${approvedCount})` },
            { key: "all" as const, label: `All (${volunteers.length})` },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold transition ${
                tab === item.key ? "bg-ink text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-soft" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, subject or language"
            className="input py-2 pl-9 text-xs"
            aria-label="Search volunteers"
          />
        </label>
      </div>

      {notice ? (
        <p className={`rounded-xl px-3 py-2 text-[11px] font-bold ${notice.error ? "bg-coral-soft/70 text-[#a02727]" : "bg-sage-soft/70 text-[#52622f]"}`}>
          {notice.text}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <div className="rounded-[28px] border-2 border-dashed border-ink/15 bg-white/55 px-6 py-10 text-center">
          <div className="text-4xl">{tab === "pending" ? "✅" : "🔎"}</div>
          <p className="mt-3 text-base font-bold">
            {tab === "pending" ? "No applications waiting" : "No volunteers match that search"}
          </p>
          <p className="mt-1 text-xs font-semibold text-ink-soft">
            {tab === "pending" ? "New volunteer signups land here for background and skill review." : "Try another subject, name or language."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((volunteer) => (
            <div key={volunteer.id} className="card p-4">
              <div className="flex items-start gap-3">
                <Avatar name={volunteer.name} color={volunteer.avatar_color} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="text-sm font-extrabold">{volunteer.name}</h3>
                    <Badge color={volunteer.approved ? "sage" : "yellow"}>
                      {volunteer.approved ? "Approved" : "Needs review"}
                    </Badge>
                  </div>
                  <p className="truncate text-[10px] font-semibold text-ink-soft">{volunteer.email}</p>
                  <p className="mt-1 text-[10px] font-semibold text-ink-soft">
                    {volunteer.grade_level ? `Grade ${volunteer.grade_level} · ` : ""}
                    {volunteer.languages.toUpperCase()} · {volunteer.availability_blocks} availability blocks
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {volunteer.subjects.map((subject) => (
                  <span key={subject} className="rounded-full bg-cream px-2 py-0.5 text-[9px] font-extrabold text-ink-soft">
                    {subject}
                  </span>
                ))}
                {volunteer.subjects.length === 0 ? <span className="text-[10px] font-semibold text-coral">No subjects listed</span> : null}
              </div>

              {volunteer.bio ? (
                <p className="mt-2 line-clamp-2 rounded-xl bg-cream/60 px-3 py-2 text-[10px] font-semibold leading-relaxed text-ink-soft">
                  “{volunteer.bio}”
                </p>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-3 text-[9px] font-bold text-ink-soft">
                <span className="inline-flex items-center gap-1"><Users className="text-xs" /> {volunteer.students} students</span>
                <span className="inline-flex items-center gap-1"><Check className="text-xs text-sage" /> {volunteer.completed_sessions} completed</span>
                <span className="inline-flex items-center gap-1"><Clock className="text-xs" /> {volunteer.upcoming_sessions} upcoming</span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-ink/8 pt-3">
                <p className="flex items-center gap-1 text-[9px] font-semibold text-ink-soft">
                  <Shield className="text-xs text-sage" /> Admin approval required before matching
                </p>
                {volunteer.approved ? (
                  <button
                    type="button"
                    onClick={() => void setApproved(volunteer, false)}
                    disabled={busyId === volunteer.id}
                    className="btn btn-white btn-sm !py-1.5 text-[10px]"
                  >
                    <X className="text-xs" /> Pause access
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void setApproved(volunteer, true)}
                    disabled={busyId === volunteer.id}
                    className="btn btn-sage btn-sm !py-1.5 text-[10px]"
                  >
                    <Check className="text-xs" /> {busyId === volunteer.id ? "Approving…" : "Approve volunteer"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
