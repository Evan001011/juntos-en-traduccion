import { DAY_NAMES, SCHOOL_TZ, TZ_LABEL } from "./constants";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type ParsedLocal = {
  y: number;
  m: number;
  d: number;
  h: number;
  min: number;
  date: Date;
};

/** Parse a naive "school clock" ISO string such as 2026-10-26T16:30:00. */
export function parseLocal(iso: string): ParsedLocal {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso);
  if (!match) {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate(), h: now.getHours(), min: now.getMinutes(), date: now };
  }
  const [, ys, ms, ds, hs, mins] = match;
  const y = Number(ys);
  const m = Number(ms);
  const d = Number(ds);
  const h = Number(hs);
  const min = Number(mins);
  return { y, m, d, h, min, date: new Date(y, m - 1, d, h, min) };
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function toLocalISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

export function nowLocalISO(): string {
  return toLocalISO(new Date());
}

export function addMinutesToISO(iso: string, minutes: number): string {
  const p = parseLocal(iso);
  return toLocalISO(new Date(p.date.getTime() + minutes * 60_000));
}

export function minutesLabel(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return m === 0 ? `${h} ${suffix}` : `${h}:${pad(m)} ${suffix}`;
}

export function formatTime(iso: string): string {
  const p = parseLocal(iso);
  return minutesLabel(p.h * 60 + p.min);
}

export function formatDate(iso: string): string {
  const p = parseLocal(iso);
  return `${DAY_NAMES[p.date.getDay()].slice(0, 3)}, ${MONTHS[p.m - 1]} ${p.d}`;
}

export function formatLongDate(iso: string): string {
  const p = parseLocal(iso);
  return `${DAY_NAMES[p.date.getDay()]}, ${MONTHS_LONG[p.m - 1]} ${p.d}, ${p.y}`;
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)} ${TZ_LABEL}`;
}

export function formatDateTimeLong(iso: string): string {
  return `${formatLongDate(iso)} at ${formatTime(iso)} ${TZ_LABEL}`;
}

/** Next calendar occurrence of a weekday + start minute, in school clock time. */
export function nextOccurrence(dayOfWeek: number, startMin: number, weeksAhead = 0, from = new Date()): string {
  const base = new Date(from);
  base.setHours(0, 0, 0, 0);
  const diff = (dayOfWeek - base.getDay() + 7) % 7;
  const d = new Date(base);
  d.setDate(base.getDate() + diff + weeksAhead * 7);
  d.setHours(Math.floor(startMin / 60), startMin % 60, 0, 0);
  if (d.getTime() < from.getTime() + 60 * 60 * 1000) {
    d.setDate(d.getDate() + 7);
  }
  return toLocalISO(d);
}

/** The next n occurrences for a weekly slot (used on booking cards). */
export function upcomingOccurrences(dayOfWeek: number, startMin: number, count = 2, from = new Date()): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(nextOccurrence(dayOfWeek, startMin, i, from));
  return out;
}

export function slotDateForDay(dayOfWeek: number, startMin: number): string {
  return nextOccurrence(dayOfWeek, startMin);
}

export function relativeDay(iso: string): string {
  const p = parseLocal(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(p.y, p.m - 1, p.d);
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff > 1 && diff < 7) return `In ${diff} days`;
  return formatDate(iso);
}

export function isPast(iso: string): boolean {
  return iso < nowLocalISO();
}

export function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${pad(week)}`;
}

/** Convert a naive school-clock time to a real UTC instant honouring the school timezone. */
export function zonedToUtc(iso: string, timeZone = SCHOOL_TZ): Date {
  const p = parseLocal(iso);
  const target = Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, 0);
  let ts = target;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  for (let i = 0; i < 2; i++) {
    const parts = formatter.formatToParts(new Date(ts));
    const get = (type: string) => Number(parts.find((part) => part.type === type)?.value || 0);
    const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
    const offset = asUtc - ts;
    ts = target - offset;
  }
  return new Date(ts);
}

export function compactUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function googleCalendarUrl(opts: {
  title: string;
  details?: string;
  location?: string;
  startISO: string;
  durationMin: number;
}): string {
  const start = zonedToUtc(opts.startISO);
  const end = new Date(start.getTime() + opts.durationMin * 60_000);
  const dates = `${compactUtc(start)}/${compactUtc(end)}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates,
    details: opts.details || "",
    location: opts.location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function icsForSession(opts: {
  id: number;
  title: string;
  description: string;
  startISO: string;
  durationMin: number;
  meetingLink?: string | null;
}): string {
  const endISO = addMinutesToISO(opts.startISO, opts.durationMin);
  const p = parseLocal(opts.startISO);
  const e = parseLocal(endISO);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const fmtLocal = (v: ParsedLocal) => `${v.y}${pad(v.m)}${pad(v.d)}T${pad(v.h)}${pad(v.min)}00`;
  const clean = (value: string) => value.replace(/\n/g, "\\n").replace(/,/g, "\\,");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Juntos en Traduccion//Tutoring//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:juntos-session-${opts.id}@juntosentraduccion.org`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${SCHOOL_TZ}:${fmtLocal(p)}`,
    `DTEND;TZID=${SCHOOL_TZ}:${fmtLocal(e)}`,
    `SUMMARY:${clean(opts.title)}`,
    `DESCRIPTION:${clean(opts.description)}`,
    opts.meetingLink ? `LOCATION:${opts.meetingLink}` : "",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Tutoring session starting soon",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

export function timeAgo(sqlDate: string): string {
  const normalized = sqlDate.includes("T") ? sqlDate : sqlDate.replace(" ", "T");
  const then = new Date(normalized.endsWith("Z") ? normalized : `${normalized}Z`).getTime();
  const diff = Math.max(0, Date.now() - then);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(then).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
