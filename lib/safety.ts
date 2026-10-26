export type ScrubResult = { text: string; flagged: boolean; reasons: string[] };

/**
 * Youth-safety filter. We remove anything that could move a conversation off
 * the platform (phone, email, social handles, links) and send it to admin review.
 */
export function scrubContactInfo(input: string): ScrubResult {
  let text = input;
  const reasons: string[] = [];

  const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  if (email.test(text)) {
    reasons.push("Email address");
    text = text.replace(email, "[contact info removed]");
  }

  const url = /\b(?:https?:\/\/|www\.)[^\s]+/gi;
  if (url.test(text)) {
    reasons.push("External link");
    text = text.replace(url, "[link removed]");
  }

  const social = /\b(instagram|snapchat|snap|tiktok|discord|whatsapp|telegram|kik|signal|twitter)\b[\s:._-]*@?[a-z0-9._-]{2,}/gi;
  if (social.test(text)) {
    reasons.push("Social handle");
    text = text.replace(social, "[contact info removed]");
  }

  const handle = /(^|\s)@[a-z0-9._]{2,}/gi;
  if (handle.test(text)) {
    reasons.push("Social handle");
    text = text.replace(handle, "$1[contact info removed]");
  }

  const phone = /(?:\+?\d[\d\s().-]{6,}\d)/g;
  text = text.replace(phone, (candidate) => {
    const digits = candidate.replace(/\D/g, "");
    if (digits.length >= 7 && digits.length <= 15) {
      reasons.push("Phone number");
      return "[contact info removed]";
    }
    return candidate;
  });

  const unique = Array.from(new Set(reasons));
  return { text: text.trim(), flagged: unique.length > 0, reasons: unique };
}

export function redactForLog(text: string): string {
  return scrubContactInfo(text).text;
}
