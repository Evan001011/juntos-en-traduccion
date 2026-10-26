"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "./ui";
import { ArrowLeft, Check, Chat, Lock, Send, Shield, Sparkles } from "./icons";
import { timeAgo } from "@/lib/time";
import type { Contact, MessageRow } from "@/lib/data";

type Person = { id: number; name: string; avatar_color: string; role: string; email?: string };

export function Messenger({
  me,
  contacts,
  initialContactId,
}: {
  me: { id: number; name: string; role: string };
  contacts: Contact[];
  initialContactId?: number | null;
}) {
  const [activeId, setActiveId] = useState<number | null>(initialContactId ?? contacts[0]?.id ?? null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [other, setOther] = useState<Person | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ text: string; bad?: boolean } | null>(null);
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(Boolean(initialContactId));
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<number | null>(activeId);
  activeRef.current = activeId;
  const activeContact = contacts.find((contact) => contact.id === activeId) || null;
  const displayPerson = other || activeContact;

  const loadThread = useCallback(async (contactId: number, quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await fetch(`/api/messages?with=${contactId}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { messages: MessageRow[]; other: Person };
      if (activeRef.current !== contactId) return;
      setMessages(data.messages);
      setOther(data.other);
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeId) void loadThread(activeId);
    else {
      setMessages([]);
      setOther(null);
    }
  }, [activeId, loadThread]);

  useEffect(() => {
    if (!activeId) return;
    const timer = window.setInterval(() => void loadThread(activeId, true), 6000);
    return () => window.clearInterval(timer);
  }, [activeId, loadThread]);

  const filteredContacts = contacts.filter((contact) =>
    `${contact.name} ${contact.email}`.toLowerCase().includes(search.toLowerCase()),
  );

  async function send() {
    if (!activeId || !text.trim() || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: activeId, body: text }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string; flagged?: boolean; reasons?: string[] };
      if (!response.ok || !data.ok) {
        setNotice({ text: data.error || "Message could not be sent.", bad: true });
        return;
      }
      setText("");
      if (data.flagged) {
        setNotice({
          text: `Contact info was removed for safety${data.reasons?.length ? ` (${data.reasons.join(", ")})` : ""}. A safety lead will review it.`,
          bad: true,
        });
      }
      await loadThread(activeId, true);
    } catch {
      setNotice({ text: "Message could not be sent. Try again.", bad: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card grid min-h-[540px] overflow-hidden md:grid-cols-[270px_1fr]" style={{ height: "min(680px, calc(100vh - 190px))" }}>
      <aside className={`border-r border-ink/10 bg-cream/50 ${mobileOpen ? "hidden md:block" : "block"}`}>
        <div className="border-b border-ink/10 bg-paper px-3 py-3">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-extrabold"><Chat className="text-base text-coral" /> Messages</p>
            <span className="rounded-full bg-sage-soft px-2 py-1 text-[9px] font-extrabold text-[#52622f]">Filtered</span>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search people…"
            className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-[11px] font-semibold outline-none focus:border-coral"
            aria-label="Search conversations"
          />
        </div>
        <div className="h-[calc(100%-72px)] overflow-y-auto p-2">
          {filteredContacts.length === 0 ? (
            <p className="px-3 py-6 text-center text-[11px] font-semibold text-ink-soft">
              No conversations yet. After your first session, your tutor appears here.
            </p>
          ) : (
            filteredContacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => {
                  setActiveId(contact.id);
                  setMobileOpen(true);
                  setNotice(null);
                }}
                className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition ${
                  activeId === contact.id ? "bg-white shadow-sm ring-1 ring-ink/10" : "hover:bg-white/60"
                }`}
              >
                <Avatar name={contact.name} color={contact.avatar_color} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate text-xs font-extrabold">{contact.name}</p>
                    {contact.unread > 0 ? <span className="grid h-4 min-w-4 place-items-center rounded-full bg-coral px-1 text-[8px] font-extrabold text-white">{contact.unread}</span> : null}
                  </div>
                  <p className="truncate text-[10px] font-semibold text-ink-soft">
                    {contact.last_message || (contact.role === "admin" ? "Safety team" : "Say hello")}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className={`flex min-h-0 flex-col ${mobileOpen ? "flex" : "hidden md:flex"}`}>
        {activeId && displayPerson ? (
          <>
            <div className="flex items-center gap-2.5 border-b border-ink/10 bg-paper px-4 py-2.5">
              <button type="button" onClick={() => setMobileOpen(false)} className="grid h-7 w-7 place-items-center rounded-full bg-ink/5 text-ink-soft md:hidden" aria-label="Back to conversations">
                <ArrowLeft className="text-sm" />
              </button>
              <Avatar name={displayPerson.name} color={displayPerson.avatar_color} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-extrabold">{displayPerson.name}</p>
                <p className="text-[10px] font-semibold text-ink-soft">{displayPerson.role === "admin" ? "Juntos safety team" : displayPerson.role}</p>
              </div>
              <span className="hidden items-center gap-1 text-[9px] font-bold text-ink-soft sm:inline-flex"><Shield className="text-xs text-sage" /> Human-reviewed</span>
            </div>

            <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto bg-cream/40 px-3 py-4 sm:px-4">
              <div className="mx-auto mb-2 max-w-sm rounded-2xl border border-ink/8 bg-white/70 px-3 py-2 text-center text-[10px] font-semibold leading-relaxed text-ink-soft">
                <Lock className="mr-1 inline text-xs" /> Phone numbers, emails and social handles are automatically removed and reviewed by a human.
              </div>
              {loading ? <p className="text-center text-[10px] font-semibold text-ink-soft">Loading conversation…</p> : null}
              {messages.map((message) => {
                const mine = message.sender_id === me.id;
                return (
                  <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed ${
                      mine ? "rounded-br-md bg-ink text-cream" : "rounded-bl-md border border-ink/8 bg-white text-ink"
                    }`}>
                      <p className="whitespace-pre-wrap">{message.body}</p>
                      <div className={`mt-1 flex items-center justify-end gap-1.5 text-[8px] font-bold ${mine ? "text-cream/60" : "text-ink-soft/70"}`}>
                        {message.flagged ? <span className="inline-flex items-center gap-0.5 text-coral"><Shield className="text-[9px]" /> filtered</span> : null}
                        {message.read_at ? <Check className="text-[9px]" /> : null}
                        {timeAgo(message.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && !loading ? (
                <div className="mx-auto max-w-xs rounded-2xl border border-dashed border-ink/15 px-4 py-6 text-center">
                  <Sparkles className="mx-auto text-2xl text-yellow" />
                  <p className="mt-2 text-[11px] font-bold text-ink-soft">Start with a friendly hello. Keep it about learning!</p>
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>

            {notice ? (
              <div className={`border-t px-4 py-2 text-[10px] font-bold ${notice.bad ? "border-coral/20 bg-coral-soft/60 text-[#a02727]" : "border-sage/30 bg-sage-soft/60 text-[#52622f]"}`}>
                {notice.text}
              </div>
            ) : null}

            <div className="border-t border-ink/10 bg-paper p-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value.slice(0, 1000))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void send();
                    }
                  }}
                  rows={1}
                  placeholder="Write a message…"
                  className="input min-h-[42px] flex-1 resize-none py-2.5 text-xs"
                />
                <button type="button" onClick={() => void send()} disabled={!text.trim() || busy} className="btn btn-coral h-[42px] shrink-0 px-4" aria-label="Send message">
                  <Send className="text-base" />
                </button>
              </div>
              <p className="mt-1.5 text-[9px] font-semibold text-ink-soft">
                {text.length}/1000 · Never share personal contact information.
              </p>
            </div>
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-8 text-center">
            <div>
              <Chat className="mx-auto text-4xl text-ink/20" />
              <p className="mt-3 text-sm font-extrabold">Choose a conversation</p>
              <p className="mt-1 max-w-xs text-[11px] font-semibold text-ink-soft">
                Messaging unlocks with your matched tutor, assigned worksheets or the safety team.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
