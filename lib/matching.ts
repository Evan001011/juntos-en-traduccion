import {
  getApprovedVolunteers,
  getAvailability,
  getBookedTimes,
  getPerson,
  getSessionsForStudent,
  getSessionsForVolunteer,
  getSkillScores,
  getStudents,
  getSubjectList,
  type AvailabilityRow,
  type PersonSummary,
} from "./data";
import { nextOccurrence, nowLocalISO } from "./time";

export type MatchSlot = {
  iso: string;
  day: number;
  startMin: number;
  endMin: number;
};

export type VolunteerMatch = {
  volunteer: PersonSummary;
  sharedSubjects: string[];
  overlapMinutes: number;
  score: number;
  matchPercent: number;
  slots: MatchSlot[];
  sessionsTogether: number;
  reason: string;
};

export type StudentMatch = {
  student: PersonSummary;
  sharedSubjects: string[];
  overlapMinutes: number;
  score: number;
  matchPercent: number;
  slots: MatchSlot[];
  reason: string;
  focusSkills: string[];
};

function overlapWindows(student: AvailabilityRow[], volunteer: AvailabilityRow[]) {
  const windows: Array<{ day: number; start: number; end: number }> = [];
  for (const s of student) {
    for (const v of volunteer) {
      if (s.day_of_week !== v.day_of_week) continue;
      const start = Math.max(s.start_min, v.start_min);
      const end = Math.min(s.end_min, v.end_min);
      if (end - start >= 45) windows.push({ day: s.day_of_week, start, end });
    }
  }
  return windows;
}

function totalOverlap(windows: Array<{ start: number; end: number }>) {
  return windows.reduce((sum, w) => sum + (w.end - w.start), 0);
}

function buildSlots(
  windows: Array<{ day: number; start: number; end: number }>,
  booked: Set<string>,
  maxSlots = 4,
): MatchSlot[] {
  const now = nowLocalISO();
  const slots: MatchSlot[] = [];
  const seen = new Set<string>();

  for (const window of windows.sort((a, b) => a.day - b.day || a.start - b.start)) {
    for (let start = window.start; start + 45 <= window.end; start += 30) {
      for (let week = 0; week < 3; week++) {
        const iso = nextOccurrence(window.day, start, week);
        if (iso < now) continue;
        if (booked.has(iso) || seen.has(iso)) continue;
        seen.add(iso);
        slots.push({ iso, day: window.day, startMin: start, endMin: start + 45 });
      }
    }
  }

  return slots.sort((a, b) => a.iso.localeCompare(b.iso)).slice(0, maxSlots);
}

function languageOverlap(a: string, b: string): boolean {
  const aLangs = a.split(",");
  const bLangs = b.split(",");
  return aLangs.some((lang) => bLangs.includes(lang));
}

export async function getVolunteerMatches(studentId: number): Promise<VolunteerMatch[]> {
  const studentAvailability = await getAvailability(studentId);
  const studentNeeds = new Set(await getStudentNeeds(studentId));

  const studentBooked = new Set(await getBookedTimes(studentId));
  const sessions = await getSessionsForStudent(studentId);
  const together = new Map<number, number>();
  for (const session of sessions) {
    if (session.status === "completed") together.set(session.volunteer_id, (together.get(session.volunteer_id) || 0) + 1);
  }

  const results: VolunteerMatch[] = [];
  for (const volunteer of await getApprovedVolunteers()) {
    const availability = await getAvailability(volunteer.id);
    const windows = overlapWindows(studentAvailability, availability);
    const overlap = totalOverlap(windows);
    const shared = volunteer.subjects.filter((subject) => studentNeeds.has(subject));
    const sessionsTogether = together.get(volunteer.id) || 0;
    const languageBonus = languageOverlap(volunteer.languages, await getUserLanguages(studentId)) ? 1 : 0;
    const score = shared.length * 30 + Math.min(overlap / 60, 8) * 5 + languageBonus * 8 + sessionsTogether * 4;
    const booked = new Set([...studentBooked, ...(await getBookedTimes(volunteer.id))]);
    const slots = buildSlots(windows, booked);
    const reasonBits: string[] = [];
    if (shared.length) reasonBits.push(`Teaches ${shared.join(" + ")}`);
    if (overlap >= 45) reasonBits.push(`${Math.round(overlap / 60)}h of weekly overlap`);
    if (languageBonus) reasonBits.push("Shares your language");
    if (sessionsTogether) reasonBits.push(`${sessionsTogether} session${sessionsTogether > 1 ? "s" : ""} together`);
    results.push({
      volunteer,
      sharedSubjects: shared,
      overlapMinutes: overlap,
      score,
      matchPercent: Math.max(61, Math.min(98, Math.round(56 + score * 0.55))),
      slots,
      sessionsTogether,
      reason: reasonBits.length ? reasonBits.join(" · ") : "Flexible and ready to help",
    });
  }

  return results.sort((a, b) => b.score - a.score || a.volunteer.name.localeCompare(b.volunteer.name));
}

export async function getStudentMatchesForVolunteer(volunteerId: number): Promise<StudentMatch[]> {
  const volunteerAvailability = await getAvailability(volunteerId);
  const volunteerSubjects = new Set(await getVolunteerSubjectList(volunteerId));
  const volunteerLanguages = await getUserLanguages(volunteerId);
  const volunteerBooked = new Set(await getBookedTimes(volunteerId));
  const sessions = await getSessionsForVolunteer(volunteerId);
  const together = new Map<number, number>();
  for (const session of sessions) {
    if (session.status === "completed") together.set(session.student_id, (together.get(session.student_id) || 0) + 1);
  }

  const results: StudentMatch[] = [];
  for (const student of await getStudents()) {
    const availability = await getAvailability(student.id);
    const windows = overlapWindows(availability, volunteerAvailability);
    const overlap = totalOverlap(windows);
    const needs = await getStudentNeeds(student.id);
    const shared = needs.filter((subject) => volunteerSubjects.has(subject));
    if (!shared.length) continue;
    const booked = new Set([...volunteerBooked, ...(await getBookedTimes(student.id))]);
    const slots = buildSlots(windows, booked, 2);
    const sessionsTogether = together.get(student.id) || 0;
    const score = shared.length * 30 + Math.min(overlap / 60, 8) * 5 + sessionsTogether * 4;
    results.push({
      student,
      sharedSubjects: shared,
      overlapMinutes: overlap,
      score,
      matchPercent: Math.max(61, Math.min(98, Math.round(56 + score * 0.55))),
      slots,
      reason: shared.length ? `Needs help with ${shared.join(" + ")}` : "Looking for a tutor",
      focusSkills: await getWeakSkills(student.id),
    });
  }
  void volunteerLanguages;
  return results.sort((a, b) => b.score - a.score || a.student.name.localeCompare(b.student.name));
}

export async function getStudentNeeds(studentId: number): Promise<string[]> {
  return getSubjectList(studentId, "need");
}

export async function getVolunteerSubjectList(volunteerId: number): Promise<string[]> {
  return getSubjectList(volunteerId, "teach");
}

export async function getUserLanguages(userId: number): Promise<string> {
  return (await getPerson(userId))?.languages || "en";
}

export async function getWeakSkills(studentId: number): Promise<string[]> {
  return (await getSkillScores(studentId))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .filter((score, index, arr) => arr.findIndex((s) => s.skill === score.skill) === index)
    .filter((score) => score.score <= 3)
    .map((score) => score.skill);
}

export async function findSlotForBooking(volunteerId: number, studentId: number, iso: string): Promise<MatchSlot | null> {
  const windows = overlapWindows(await getAvailability(studentId), await getAvailability(volunteerId));
  const weekday = new Date(iso.slice(0, 10) + "T12:00:00").getDay();
  const startMin = Number(iso.slice(11, 13)) * 60 + Number(iso.slice(14, 16));
  const match = windows.find(
    (window) => window.day === weekday && startMin >= window.start && startMin + 45 <= window.end,
  );
  if (!match) return null;
  return { iso, day: weekday, startMin, endMin: startMin + 45 };
}
