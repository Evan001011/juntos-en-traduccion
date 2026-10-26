"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "./ui";
import { Chat, Send, Shield } from "./icons";
import { translateText } from "@/lib/translator";
import { timeAgo } from "@/lib/time";

type ChatMessage = {
  id: number;
  sender_id: number;
  sender_name: string;
  avatar_color: string;
  body: string;
  translated_body: string | null;
  translated_lang: string | null;
  created_at: string;
};

export function SessionChat({
  sessionId,
  meId,
  myLang,
  initialMessages,
}: {
  sessionId: number;
  meId: number;
  myLang: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const [addTranslation, setAddTranslation] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const sourceLang = myLang.includes("es") ? "es" : "en";
  const targetLang = sourceLang === "es" ? "en" : "es";
  const targetLabel = targetLang === "es" ? "Español" : "English";

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/chat`, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { messages: ChatMessage[] };
      setMessages(data.messages);
    } catch {
      // Offline — the translator still works locally.
    }
  }, [sessionId]);

  useEffect(() => {
    const timer = window.setInterval(() => void load(), 4500);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    const list = listRef.current;
    if (list && list.scrollHeight - list.scrollTop - list.clientHeight < 160) {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [messages.length]);

  async function send() {
    if (!text.trim() || busy) return;
    setBusy(true);
    setNotice(null);
    const original = text.trim();
    const translation = addTranslation ? translateText(original, sourceLang, targetLang).text : "";
    try {
      const response = await fetch(`/api/sessions/${sessionId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: original,
          translatedBody: translation || null,
          translatedLang: translation ? targetLang : null,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string; flagged?: boolean };
      if (!response.ok || !data.ok) {
        setNotice(data.error || "Message could not be sent.");
        return;
      }
      setText("");
      if (data.flagged) setNotice("Contact information was removed to keep this room safe.");
      await load();
    } catch {
      setNotice("Message could not be sent. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card flex h-[470px] flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-ink/10 bg-paper px-4 py-2.5">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-extrabold"><Chat className="text-base text-coral" /> Room chat</p>
          <p className="text-[10px] font-semibold text-ink-soft">Shared with everyone in this session · auto-refreshes</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-sage-soft px-2 py-1 text-[9px] font-extrabold text-[#52622f]">
          <Shield className="text-[10px]" /> Safe mode
        </span>
      </div>

      <div ref={listRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto bg-cream/40 px-3 py-3">
        {messages.length === 0 ? (
          <p className="mx-auto mt-6 max-w-[230px] rounded-xl bg-white/70 px-3 py-3 text-center text-[10px] font-semibold leading-relaxed text-ink-soft">
            Say hello! Try a translated phrase from the panel beside you.
          </p>
        ) : null}
        {messages.map((message) => {
          const mine = message.sender_id === meId;
          return (
            <div key={message.id} className={`flex items-end gap-1.5 ${mine ? "justify-end" : "justify-start"}`}>
              {!mine ? <Avatar name={message.sender_name} color={message.avatar_color} size="xs" /> : null}
              <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-[11px] font-semibold leading-relaxed ${
                mine ? "rounded-br-md bg-ink text-cream" : "rounded-bl-md border border-ink/8 bg-white"
              }`}>
                {!mine ? <p className="mb-0.5 text-[9px] font-extrabold opacity-60">{message.sender_name.split(" ")[0]}</p> : null}
                <p className="whitespace-pre-wrap">{message.body}</p>
                {message.translated_body ? (
                  <p className={`mt-1 rounded-lg px-2 py-1 text-[10px] font-bold ${mine ? "bg-white/10 text-cream/85" : "bg-lilac-soft/60 text-[#6e4680]"}`}>
                    {message.translated_lang === "es" ? "ES" : "EN"} · {message.translated_body}
                  </p>
                ) : null}
                <p className={`mt-1 text-right text-[8px] font-bold ${mine ? "text-cream/50" : "text-ink-soft/60"}`}>{timeAgo(message.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {notice ? <p className="border-t border-coral/20 bg-coral-soft/60 px-3 py-1.5 text-[9px] font-bold text-[#a02727]">{notice}</p> : null}

      <div className="border-t border-ink/10 bg-paper p-2.5">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value.slice(0, 700))}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
            rows={1}
            placeholder="Write to the room…"
            className="input min-h-[38px] flex-1 resize-none py-2 text-[11px]"
            aria-label="Session chat message"
          />
          <button type="button" onClick={() => void send()} disabled={!text.trim() || busy} className="btn btn-coral h-[38px] shrink-0 px-3" aria-label="Send message">
            <Send className="text-sm" />
          </button>
        </div>
        <label className="mt-1.5 flex cursor-pointer items-center gap-1.5 text-[9px] font-bold text-ink-soft">
          <input
            type="checkbox"
            checked={addTranslation}
            onChange={(event) => setAddTranslation(event.target.checked)}
            className="h-3 w-3 accent-[#FF5252]"
          />
          Also send {targetLabel} translation
        </label>
      </div>
    </div>
  );
}
