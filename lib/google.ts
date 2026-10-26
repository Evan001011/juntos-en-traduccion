export function googleChatConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CHAT_WEBHOOK);
}

export async function notifyGoogleChat(text: string): Promise<{ ok: boolean; configured: boolean }> {
  const webhook = process.env.GOOGLE_CHAT_WEBHOOK;
  if (!webhook) {
    console.info("[google-chat:demo]", text);
    return { ok: false, configured: false };
  }
  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(5000),
    });
    return { ok: response.ok, configured: true };
  } catch (error) {
    console.error("Google Chat webhook failed", error);
    return { ok: false, configured: true };
  }
}

export function googleMeetLink(fallback?: string | null): string {
  return fallback || process.env.GOOGLE_MEET_BASE || "https://meet.google.com/new";
}

export function integrationStatus() {
  return {
    calendar: { configured: true, label: "Google Calendar links + .ics export" },
    meet: { configured: true, label: "Google Meet room links" },
    chat: { configured: googleChatConfigured(), label: googleChatConfigured() ? "Google Chat alerts live" : "Google Chat demo mode" },
  };
}
