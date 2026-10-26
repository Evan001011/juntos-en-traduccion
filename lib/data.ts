import { batch, db } from "./db";
import type { AppUser } from "./auth";
import type { AccentKey } from "./constants";

export type AvailabilityRow = {
  id: number;
  user_id: number;
  day_of_week: number;
  start_min: number;
  end_min: number;
};

export type PersonSummary = {
  id: number;
  name: string;
  email: string;
  avatar_color: string;
  grade_level: number | null;
  languages: string;
  bio: string | null;
  subjects: string[];
  approved: number;
};

export type SessionRow = {
  id: number;
  student_id: number;
  volunteer_id: number;
  subject: string;
  scheduled_at: string;
  duration_min: number;
  status: "scheduled" | "completed" | "cancelled";
  meeting_link: string | null;
  created_at: string;
  completed_at: string | null;
};

export type SessionWithPeople = SessionRow & {
  student_name: string;
  student_color: string;
  volunteer_name: string;
  volunteer_color: string;
  has_feedback: number;
  feedback_id: number | null;
};

export type WorksheetRow = {
  id: number;
  volunteer_id: number;
  title: string;
  subject: string;
  grade_band: string | null;
  description: string | null;
  created_at: string;
};

export type QuestionRow = {
  id: number;
  worksheet_id: number;
  prompt: string;
  answer: string;
  hint: string | null;
  position: number;
};

export type AssignmentRow = {
  id: number;
  worksheet_id: number;
  student_id: number;
  assigned_by: number;
  status: "assigned" | "completed";
  score: number | null;
  assigned_at: string;
  completed_at: string | null;
};

export type WorksheetWithAssignment = WorksheetRow & {
  assignment_id: number;
  assignment_status: "assigned" | "completed";
  score: number | null;
  assigned_at: string;
  completed_at: string | null;
  question_count: number;
  volunteer_name: string;
};

export type LearningModule = {
  id: number;
  title: string;
  subject: string;
  skill: string;
  grade_band: string;
  emoji: string;
  blurb: string;
  accent: AccentKey;
  cards: Array<{ front: string; back: string; hint: string }>;
};

export type LessonPlan = {
  id: number;
  volunteer_id: number | null;
  title: string;
  subject: string;
  grade_band: string;
  duration_min: number;
  summary: string;
  steps: string;
  materials: string | null;
  resource_url: string | null;
  tags: string | null;
  created_at: string;
};

export type MessageRow = {
  id: number;
  sender_id: number;
  recipient_id: number;
  body: string;
  flagged: number;
  flag_reason: string | null;
  created_at: string;
  read_at: string | null;
};

export type Contact = {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_color: string;
  last_message: string | null;
  last_at: string | null;
  unread: number;
};

export async function getSubjectList(userId: number, kind: "teach" | "need"): Promise<string[]> {
  const rows = await db
    .prepare("SELECT subject FROM user_subjects WHERE user_id = ? AND kind = ? ORDER BY subject")
    .all<{ subject: string }>(userId, kind);
  return rows.map((row) => row.subject);
}

export async function getAvailability(userId: number): Promise<AvailabilityRow[]> {
  return db.prepare("SELECT * FROM availability WHERE user_id = ? ORDER BY day_of_week, start_min").all<AvailabilityRow>(userId);
}

export async function replaceAvailability(userId: number, blocks: Array<{ day: number; start: number; end: number }>) {
  const statements = [
    { sql: "DELETE FROM availability WHERE user_id = ?", params: [userId] },
    ...blocks
      .filter((block) => block.end > block.start && block.start >= 0 && block.end <= 1440)
      .map((block) => ({
        sql: "INSERT INTO availability (user_id, day_of_week, start_min, end_min) VALUES (?, ?, ?, ?)",
        params: [userId, block.day, block.start, block.end],
      })),
  ];
  await batch(statements);
}

export async function getPlatformStats() {
  const row = await db
    .prepare(
      `SELECT
        (SELECT COALESCE(SUM(duration_min), 0) FROM sessions WHERE status = 'completed') AS minutes,
        (SELECT COUNT(DISTINCT student_id || '-' || volunteer_id) FROM sessions WHERE status IN ('scheduled','completed')) AS active_matches,
        (SELECT COUNT(*) FROM users WHERE role = 'student') AS students,
        (SELECT COUNT(*) FROM users WHERE role = 'volunteer' AND approved = 1) AS volunteers,
        (SELECT COUNT(*) FROM sessions WHERE status = 'completed') AS completed_sessions,
        (SELECT COUNT(*) FROM sessions WHERE status = 'scheduled') AS upcoming_sessions,
        (SELECT COUNT(*) FROM worksheet_assignments WHERE status = 'completed') AS worksheets_completed`,
    )
    .get<{
      minutes: number;
      active_matches: number;
      students: number;
      volunteers: number;
      completed_sessions: number;
      upcoming_sessions: number;
      worksheets_completed: number;
    }>();
  const stats = row ?? {
    minutes: 0,
    active_matches: 0,
    students: 0,
    volunteers: 0,
    completed_sessions: 0,
    upcoming_sessions: 0,
    worksheets_completed: 0,
  };
  return { ...stats, hours: Math.round((stats.minutes / 60) * 10) / 10 };
}

export async function getApprovedVolunteers(): Promise<PersonSummary[]> {
  const rows = await db
    .prepare(
      `SELECT id, name, email, avatar_color, grade_level, languages, bio, approved
       FROM users WHERE role = 'volunteer' AND approved = 1 ORDER BY name`,
    )
    .all<Omit<PersonSummary, "subjects">>();
  return Promise.all(rows.map(async (row) => ({ ...row, subjects: await getSubjectList(row.id, "teach") })));
}

export async function getAllVolunteers(): Promise<PersonSummary[]> {
  const rows = await db
    .prepare(
      `SELECT id, name, email, avatar_color, grade_level, languages, bio, approved
       FROM users WHERE role = 'volunteer' ORDER BY approved ASC, name ASC`,
    )
    .all<Omit<PersonSummary, "subjects">>();
  return Promise.all(rows.map(async (row) => ({ ...row, subjects: await getSubjectList(row.id, "teach") })));
}

export async function getStudents(): Promise<PersonSummary[]> {
  const rows = await db
    .prepare(
      `SELECT id, name, email, avatar_color, grade_level, languages, bio, approved
       FROM users WHERE role = 'student' ORDER BY name`,
    )
    .all<Omit<PersonSummary, "subjects">>();
  return Promise.all(rows.map(async (row) => ({ ...row, subjects: await getSubjectList(row.id, "need") })));
}

export async function getPerson(id: number) {
  return db
    .prepare("SELECT id, name, email, role, avatar_color, grade_level, languages, bio, approved FROM users WHERE id = ?")
    .get<PersonSummary & { role: string }>(id);
}

export async function getSession(id: number): Promise<SessionWithPeople | undefined> {
  return db
    .prepare(
      `SELECT s.*, st.name AS student_name, st.avatar_color AS student_color,
        v.name AS volunteer_name, v.avatar_color AS volunteer_color,
        CASE WHEN f.id IS NULL THEN 0 ELSE 1 END AS has_feedback, f.id AS feedback_id
       FROM sessions s
       JOIN users st ON st.id = s.student_id
       JOIN users v ON v.id = s.volunteer_id
       LEFT JOIN feedback f ON f.session_id = s.id
       WHERE s.id = ?`,
    )
    .get<SessionWithPeople>(id);
}

export async function getSessionsForStudent(studentId: number): Promise<SessionWithPeople[]> {
  return db
    .prepare(
      `SELECT s.*, st.name AS student_name, st.avatar_color AS student_color,
        v.name AS volunteer_name, v.avatar_color AS volunteer_color,
        CASE WHEN f.id IS NULL THEN 0 ELSE 1 END AS has_feedback, f.id AS feedback_id
       FROM sessions s JOIN users st ON st.id = s.student_id JOIN users v ON v.id = s.volunteer_id
       LEFT JOIN feedback f ON f.session_id = s.id
       WHERE s.student_id = ? ORDER BY s.scheduled_at DESC`,
    )
    .all<SessionWithPeople>(studentId);
}

export async function getSessionsForVolunteer(volunteerId: number): Promise<SessionWithPeople[]> {
  return db
    .prepare(
      `SELECT s.*, st.name AS student_name, st.avatar_color AS student_color,
        v.name AS volunteer_name, v.avatar_color AS volunteer_color,
        CASE WHEN f.id IS NULL THEN 0 ELSE 1 END AS has_feedback, f.id AS feedback_id
       FROM sessions s JOIN users st ON st.id = s.student_id JOIN users v ON v.id = s.volunteer_id
       LEFT JOIN feedback f ON f.session_id = s.id
       WHERE s.volunteer_id = ? ORDER BY s.scheduled_at DESC`,
    )
    .all<SessionWithPeople>(volunteerId);
}

export async function getUpcomingSessionsForStudent(studentId: number) {
  return (await getSessionsForStudent(studentId))
    .filter((s) => s.status === "scheduled")
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
}

export async function getUpcomingSessionsForVolunteer(volunteerId: number) {
  return (await getSessionsForVolunteer(volunteerId))
    .filter((s) => s.status === "scheduled")
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
}

export type SkillScore = { skill: string; score: number; created_at: string };

export async function getSkillScores(studentId: number): Promise<SkillScore[]> {
  return db
    .prepare("SELECT skill, score, created_at FROM skill_scores WHERE student_id = ? ORDER BY created_at ASC, id ASC")
    .all<SkillScore>(studentId);
}

export async function getLatestSkillScores(studentId: number) {
  const all = await getSkillScores(studentId);
  const latest = new Map<string, SkillScore>();
  const previous = new Map<string, SkillScore>();
  for (const row of all) {
    const prev = latest.get(row.skill);
    if (prev) previous.set(row.skill, prev);
    latest.set(row.skill, row);
  }
  return Array.from(latest.values())
    .map((row) => ({
      ...row,
      previous: previous.get(row.skill)?.score ?? null,
      delta: previous.has(row.skill) ? row.score - previous.get(row.skill)!.score : 0,
    }))
    .sort((a, b) => a.score - b.score);
}

export async function getFeedbackForSession(sessionId: number) {
  return db.prepare("SELECT * FROM feedback WHERE session_id = ?").get<{
    id: number;
    session_id: number;
    volunteer_id: number;
    student_id: number;
    summary: string;
    homework: string | null;
    created_at: string;
  }>(sessionId);
}

export async function getFeedbackForStudent(studentId: number) {
  return db
    .prepare(
      `SELECT f.*, v.name AS volunteer_name, s.subject, s.scheduled_at
       FROM feedback f JOIN users v ON v.id = f.volunteer_id JOIN sessions s ON s.id = f.session_id
       WHERE f.student_id = ? ORDER BY f.created_at DESC`,
    )
    .all<{
      id: number;
      summary: string;
      homework: string | null;
      created_at: string;
      volunteer_name: string;
      subject: string;
      scheduled_at: string;
    }>(studentId);
}

export async function getFeedbackForVolunteer(volunteerId: number) {
  return db
    .prepare(
      `SELECT f.*, u.name AS student_name, u.avatar_color AS student_color, s.subject, s.scheduled_at
       FROM feedback f JOIN users u ON u.id = f.student_id JOIN sessions s ON s.id = f.session_id
       WHERE f.volunteer_id = ? ORDER BY f.created_at DESC`,
    )
    .all<{
      id: number;
      summary: string;
      homework: string | null;
      created_at: string;
      student_name: string;
      student_color: string;
      subject: string;
      scheduled_at: string;
    }>(volunteerId);
}

export async function getModuleRows(): Promise<LearningModule[]> {
  const rows = await db
    .prepare("SELECT * FROM learning_modules ORDER BY id")
    .all<Omit<LearningModule, "cards" | "accent"> & { cards_json: string; accent: string }>();
  return rows.map((row) => ({
    ...row,
    accent: (row.accent || "yellow") as AccentKey,
    cards: JSON.parse(row.cards_json) as LearningModule["cards"],
  }));
}

export async function getAttempts(studentId: number) {
  return db
    .prepare(
      `SELECT a.*, m.title, m.skill, m.accent FROM module_attempts a
       JOIN learning_modules m ON m.id = a.module_id
       WHERE a.student_id = ? ORDER BY a.created_at DESC`,
    )
    .all<{
      id: number;
      module_id: number;
      score: number;
      total: number;
      xp: number;
      created_at: string;
      title: string;
      skill: string;
      accent: string;
    }>(studentId);
}

export async function getStudentWorksheets(studentId: number): Promise<WorksheetWithAssignment[]> {
  return db
    .prepare(
      `SELECT w.*, a.id AS assignment_id, a.status AS assignment_status, a.score, a.assigned_at, a.completed_at,
        u.name AS volunteer_name,
        (SELECT COUNT(*) FROM worksheet_questions q WHERE q.worksheet_id = w.id) AS question_count
       FROM worksheet_assignments a
       JOIN worksheets w ON w.id = a.worksheet_id
       JOIN users u ON u.id = w.volunteer_id
       WHERE a.student_id = ? ORDER BY a.status ASC, a.assigned_at DESC`,
    )
    .all<WorksheetWithAssignment>(studentId);
}

export async function getAssignment(assignmentId: number, studentId: number) {
  return db
    .prepare("SELECT * FROM worksheet_assignments WHERE id = ? AND student_id = ?")
    .get<AssignmentRow>(assignmentId, studentId);
}

export async function getWorksheet(id: number): Promise<WorksheetRow | undefined> {
  return db.prepare("SELECT * FROM worksheets WHERE id = ?").get<WorksheetRow>(id);
}

export async function getQuestions(worksheetId: number): Promise<QuestionRow[]> {
  return db
    .prepare("SELECT * FROM worksheet_questions WHERE worksheet_id = ? ORDER BY position, id")
    .all<QuestionRow>(worksheetId);
}

export async function getAnswers(assignmentId: number) {
  return db.prepare("SELECT * FROM worksheet_answers WHERE assignment_id = ?").all<{
    id: number;
    assignment_id: number;
    question_id: number;
    response: string;
    is_correct: number;
  }>(assignmentId);
}

export async function getVolunteerWorksheets(volunteerId: number) {
  return db
    .prepare(
      `SELECT w.*,
        (SELECT COUNT(*) FROM worksheet_questions q WHERE q.worksheet_id = w.id) AS question_count,
        (SELECT COUNT(*) FROM worksheet_assignments a WHERE a.worksheet_id = w.id) AS assigned_count,
        (SELECT COUNT(*) FROM worksheet_assignments a WHERE a.worksheet_id = w.id AND a.status = 'completed') AS completed_count
       FROM worksheets w WHERE w.volunteer_id = ? ORDER BY w.created_at DESC`,
    )
    .all<WorksheetRow & { question_count: number; assigned_count: number; completed_count: number }>(volunteerId);
}

export async function getWorksheetSubmissions(worksheetId: number) {
  return db
    .prepare(
      `SELECT a.*, u.name AS student_name, u.avatar_color AS student_color
       FROM worksheet_assignments a JOIN users u ON u.id = a.student_id
       WHERE a.worksheet_id = ? ORDER BY a.assigned_at DESC`,
    )
    .all<AssignmentRow & { student_name: string; student_color: string }>(worksheetId);
}

export async function getLessonPlans(filters: { q?: string; subject?: string; grade?: string } = {}): Promise<LessonPlan[]> {
  const where: string[] = [];
  const params: string[] = [];
  if (filters.q) {
    where.push("(title LIKE ? OR summary LIKE ? OR tags LIKE ? OR steps LIKE ?)");
    const term = `%${filters.q}%`;
    params.push(term, term, term, term);
  }
  if (filters.subject && filters.subject !== "All") {
    where.push("subject = ?");
    params.push(filters.subject);
  }
  if (filters.grade && filters.grade !== "All") {
    where.push("grade_band LIKE ?");
    params.push(`%${filters.grade}%`);
  }
  const sql = `SELECT * FROM lesson_plans ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY id`;
  return db.prepare(sql).all<LessonPlan>(...params);
}

export async function getContacts(user: AppUser): Promise<Contact[]> {
  const rows = await db
    .prepare(
      `SELECT u.id, u.name, u.email, u.role, u.avatar_color
       FROM users u
       WHERE u.id != ?
       ORDER BY u.name`,
    )
    .all<{ id: number; name: string; email: string; role: string; avatar_color: string }>(user.id);

  if (user.role === "student") {
    const related = await db
      .prepare(
        `SELECT DISTINCT volunteer_id AS id FROM sessions WHERE student_id = ?
         UNION SELECT DISTINCT assigned_by AS id FROM worksheet_assignments WHERE student_id = ?`,
      )
      .all<{ id: number }>(user.id, user.id);
    const allowed = new Set<number>(related.map((r) => r.id));
    const admins = await db.prepare("SELECT id FROM users WHERE role = 'admin'").all<{ id: number }>();
    for (const admin of admins) allowed.add(admin.id);
    const visible = rows.filter((r) => allowed.has(r.id));
    return (await Promise.all(visible.map((r) => decorateContact(r, user.id)))).sort(sortContacts);
  }
  if (user.role === "volunteer") {
    const related = await db
      .prepare(
        `SELECT DISTINCT student_id AS id FROM sessions WHERE volunteer_id = ?
         UNION SELECT DISTINCT student_id AS id FROM worksheet_assignments WHERE assigned_by = ?`,
      )
      .all<{ id: number }>(user.id, user.id);
    const allowed = new Set<number>(related.map((r) => r.id));
    const admins = await db.prepare("SELECT id FROM users WHERE role = 'admin'").all<{ id: number }>();
    for (const admin of admins) allowed.add(admin.id);
    const visible = rows.filter((r) => allowed.has(r.id));
    return (await Promise.all(visible.map((r) => decorateContact(r, user.id)))).sort(sortContacts);
  }
  return (await Promise.all(rows.map((r) => decorateContact(r, user.id)))).sort(sortContacts);
}

async function decorateContact(
  row: { id: number; name: string; email: string; role: string; avatar_color: string },
  userId: number,
): Promise<Contact> {
  const last = await db
    .prepare(
      `SELECT body, created_at FROM messages
       WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
       ORDER BY created_at DESC, id DESC LIMIT 1`,
    )
    .get<{ body: string; created_at: string }>(row.id, userId, userId, row.id);
  const unread = await db
    .prepare("SELECT COUNT(*) AS count FROM messages WHERE sender_id = ? AND recipient_id = ? AND read_at IS NULL")
    .get<{ count: number }>(row.id, userId);
  return { ...row, last_message: last?.body ?? null, last_at: last?.created_at ?? null, unread: unread?.count ?? 0 };
}

function sortContacts(a: Contact, b: Contact) {
  if (a.unread !== b.unread) return b.unread - a.unread;
  return (b.last_at || "").localeCompare(a.last_at || "");
}

export async function getThread(userId: number, otherId: number): Promise<MessageRow[]> {
  return db
    .prepare(
      `SELECT * FROM messages
       WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
       ORDER BY created_at ASC, id ASC`,
    )
    .all<MessageRow>(userId, otherId, otherId, userId);
}

export async function getFlaggedMessages() {
  return db
    .prepare(
      `SELECT m.*, s.name AS sender_name, s.role AS sender_role, r.name AS recipient_name, r.role AS recipient_role
       FROM messages m JOIN users s ON s.id = m.sender_id JOIN users r ON r.id = m.recipient_id
       WHERE m.flagged = 1 ORDER BY m.created_at DESC`,
    )
    .all<MessageRow & { sender_name: string; sender_role: string; recipient_name: string; recipient_role: string }>();
}

export async function getAuditLog(limit = 20) {
  return db
    .prepare(
      `SELECT a.*, u.name AS actor_name FROM audit_log a LEFT JOIN users u ON u.id = a.actor_id
       ORDER BY a.created_at DESC LIMIT ?`,
    )
    .all<{ id: number; actor_id: number | null; actor_name: string | null; action: string; detail: string | null; created_at: string }>(
      limit,
    );
}

export async function getVolunteerStudents(volunteerId: number) {
  return db
    .prepare(
      `SELECT DISTINCT u.id, u.name, u.avatar_color, u.grade_level, u.languages,
        (SELECT COUNT(*) FROM sessions s WHERE s.student_id = u.id AND s.volunteer_id = ? AND s.status = 'completed') AS completed_sessions
       FROM users u
       WHERE u.role = 'student' AND (
         u.id IN (SELECT student_id FROM sessions WHERE volunteer_id = ?)
         OR u.id IN (SELECT student_id FROM worksheet_assignments WHERE assigned_by = ?)
       )
       ORDER BY u.name`,
    )
    .all<{
      id: number;
      name: string;
      avatar_color: string;
      grade_level: number | null;
      languages: string;
      completed_sessions: number;
    }>(volunteerId, volunteerId, volunteerId);
}

export async function getAdminMetrics() {
  const stats = await getPlatformStats();
  const pending = await db
    .prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'volunteer' AND approved = 0")
    .get<{ count: number }>();
  const flagged = await db.prepare("SELECT COUNT(*) AS count FROM messages WHERE flagged = 1").get<{ count: number }>();
  const avg = await db
    .prepare(
      `SELECT AVG(score) AS avg FROM (
        SELECT student_id, skill, AVG(score) AS score FROM skill_scores GROUP BY student_id, skill
      )`,
    )
    .get<{ avg: number | null }>();
  const bySubject = await db
    .prepare(
      `SELECT subject, COUNT(*) AS sessions, COALESCE(SUM(duration_min), 0) AS minutes FROM sessions
       WHERE status = 'completed' GROUP BY subject ORDER BY sessions DESC`,
    )
    .all<{ subject: string; sessions: number; minutes: number }>();
  const weekly = await db
    .prepare(
      `SELECT substr(scheduled_at, 1, 10) AS day, COUNT(*) AS sessions FROM sessions
       WHERE status = 'completed' AND scheduled_at > datetime('now', '-56 days') GROUP BY day ORDER BY day`,
    )
    .all<{ day: string; sessions: number }>();
  return {
    stats,
    pendingVolunteers: pending?.count ?? 0,
    flaggedMessages: flagged?.count ?? 0,
    avgSkill: avg?.avg ? Math.round(avg.avg * 10) / 10 : 0,
    bySubject,
    weekly,
  };
}

export async function getSkillRoster() {
  return db
    .prepare("SELECT student_id, skill, score, created_at FROM skill_scores ORDER BY student_id, created_at ASC")
    .all<{ student_id: number; skill: string; score: number; created_at: string }>();
}

export async function getAdminSessions(limit = 30) {
  return db
    .prepare(
      `SELECT s.*, st.name AS student_name, st.avatar_color AS student_color,
        v.name AS volunteer_name, v.avatar_color AS volunteer_color,
        CASE WHEN f.id IS NULL THEN 0 ELSE 1 END AS has_feedback, f.id AS feedback_id
       FROM sessions s JOIN users st ON st.id = s.student_id JOIN users v ON v.id = s.volunteer_id
       LEFT JOIN feedback f ON f.session_id = s.id
       ORDER BY s.scheduled_at DESC LIMIT ?`,
    )
    .all<SessionWithPeople>(limit);
}

export async function getVolunteerRoster() {
  const volunteers = await getAllVolunteers();
  return Promise.all(
    volunteers.map(async (volunteer) => {
      const stats = await db
        .prepare(
          `SELECT COUNT(*) AS sessions,
            COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) AS completed_sessions,
            COALESCE(SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END), 0) AS upcoming_sessions,
            COUNT(DISTINCT student_id) AS students
           FROM sessions WHERE volunteer_id = ?`,
        )
        .get<{ sessions: number; completed_sessions: number; upcoming_sessions: number; students: number }>(volunteer.id);
      const availability = await db
        .prepare("SELECT COUNT(*) AS count FROM availability WHERE user_id = ?")
        .get<{ count: number }>(volunteer.id);
      return {
        ...volunteer,
        sessions: stats?.sessions ?? 0,
        completed_sessions: stats?.completed_sessions ?? 0,
        upcoming_sessions: stats?.upcoming_sessions ?? 0,
        students: stats?.students ?? 0,
        availability_blocks: availability?.count ?? 0,
      };
    }),
  );
}

export async function getImpactReport() {
  const stats = await getPlatformStats();
  const served = await db
    .prepare(
      `SELECT COUNT(DISTINCT student_id) AS students, COUNT(DISTINCT volunteer_id) AS volunteers
       FROM sessions WHERE status = 'completed'`,
    )
    .get<{ students: number; volunteers: number }>();
  const completion = await db
    .prepare(`SELECT SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed, COUNT(*) AS total FROM sessions`)
    .get<{ completed: number; total: number }>();
  const worksheets = await db
    .prepare(
      `SELECT COUNT(*) AS assigned,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) AS completed,
        COALESCE(AVG(CASE WHEN status = 'completed' THEN score END), 0) AS avg_score
       FROM worksheet_assignments`,
    )
    .get<{ assigned: number; completed: number; avg_score: number }>();
  const allScores = await getSkillScoresForReport();
  const firstByKey = new Map<string, number>();
  const latestByKey = new Map<string, number>();
  for (const row of allScores) {
    const key = `${row.student_id}:${row.skill}`;
    if (!firstByKey.has(key)) firstByKey.set(key, row.score);
    latestByKey.set(key, row.score);
  }
  let gainTotal = 0;
  let gainCount = 0;
  let improved = 0;
  for (const [key, latest] of latestByKey) {
    const first = firstByKey.get(key);
    if (first === undefined) continue;
    const delta = latest - first;
    gainTotal += delta;
    gainCount += 1;
    if (delta > 0) improved += 1;
  }
  const subjectImpact = await db
    .prepare(
      `SELECT subject, COUNT(*) AS sessions, COALESCE(SUM(duration_min), 0) AS minutes,
        COUNT(DISTINCT student_id) AS students
       FROM sessions WHERE status = 'completed' GROUP BY subject ORDER BY sessions DESC`,
    )
    .all<{ subject: string; sessions: number; minutes: number; students: number }>();
  const weeklyRows = await db
    .prepare(
      `SELECT substr(scheduled_at, 1, 10) AS day, COUNT(*) AS sessions, COALESCE(SUM(duration_min), 0) AS minutes
       FROM sessions WHERE status = 'completed' GROUP BY day ORDER BY day`,
    )
    .all<{ day: string; sessions: number; minutes: number }>();
  const weeklyMap = new Map<string, { week: string; sessions: number; minutes: number; start: string }>();
  for (const row of weeklyRows) {
    const date = new Date(`${row.day}T12:00:00`);
    const key = isoWeekKeyForImpact(date);
    const existing = weeklyMap.get(key);
    if (existing) {
      existing.sessions += row.sessions;
      existing.minutes += row.minutes;
      if (row.day < existing.start) existing.start = row.day;
    } else {
      weeklyMap.set(key, { week: key, sessions: row.sessions, minutes: row.minutes, start: row.day });
    }
  }
  const weekly = Array.from(weeklyMap.values())
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(-8)
    .map((row) => ({
      ...row,
      label: new Date(`${row.start}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }));
  const guardian = await db
    .prepare(
      `SELECT COUNT(*) AS students, COALESCE(SUM(CASE WHEN guardian_consent_at IS NOT NULL THEN 1 ELSE 0 END), 0) AS consented
       FROM users WHERE role = 'student'`,
    )
    .get<{ students: number; consented: number }>();
  const languages = await db
    .prepare(`SELECT languages, COUNT(*) AS count FROM users WHERE role = 'student' GROUP BY languages ORDER BY count DESC`)
    .all<{ languages: string; count: number }>();
  const completionRow = completion ?? { completed: 0, total: 0 };
  const worksheetsRow = worksheets ?? { assigned: 0, completed: 0, avg_score: 0 };
  const guardianRow = guardian ?? { students: 0, consented: 0 };
  return {
    stats,
    studentsServed: served?.students ?? 0,
    volunteersActive: served?.volunteers ?? 0,
    completionRate: completionRow.total ? Math.round((completionRow.completed / completionRow.total) * 100) : 0,
    worksheets: {
      ...worksheetsRow,
      completionRate: worksheetsRow.assigned ? Math.round((worksheetsRow.completed / worksheetsRow.assigned) * 100) : 0,
      avgScore: Math.round(worksheetsRow.avg_score * 10) / 10,
    },
    skills: {
      tracked: latestByKey.size,
      improved,
      averageGain: gainCount ? Math.round((gainTotal / gainCount) * 10) / 10 : 0,
    },
    subjectImpact,
    weekly,
    guardian: {
      ...guardianRow,
      rate: guardianRow.students ? Math.round((guardianRow.consented / guardianRow.students) * 100) : 0,
    },
    languages,
  };
}

async function getSkillScoresForReport() {
  return db
    .prepare("SELECT student_id, skill, score, created_at FROM skill_scores ORDER BY created_at ASC, id ASC")
    .all<{ student_id: number; skill: string; score: number; created_at: string }>();
}

function isoWeekKeyForImpact(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export async function getSessionChat(sessionId: number) {
  return db
    .prepare(
      `SELECT c.*, u.name AS sender_name, u.avatar_color FROM session_chat c
       JOIN users u ON u.id = c.sender_id WHERE c.session_id = ? ORDER BY c.created_at ASC, c.id ASC`,
    )
    .all<{
      id: number;
      session_id: number;
      sender_id: number;
      body: string;
      translated_body: string | null;
      translated_lang: string | null;
      created_at: string;
      sender_name: string;
      avatar_color: string;
    }>(sessionId);
}

export async function getBookedTimes(userId: number): Promise<string[]> {
  const rows = await db
    .prepare(`SELECT scheduled_at FROM sessions WHERE status = 'scheduled' AND (student_id = ? OR volunteer_id = ?)`)
    .all<{ scheduled_at: string }>(userId, userId);
  return rows.map((r) => r.scheduled_at);
}

export async function countUnread(userId: number): Promise<number> {
  const row = await db
    .prepare("SELECT COUNT(*) AS count FROM messages WHERE recipient_id = ? AND read_at IS NULL")
    .get<{ count: number }>(userId);
  return row?.count ?? 0;
}

export async function markThreadRead(userId: number, otherId: number) {
  await db
    .prepare("UPDATE messages SET read_at = datetime('now') WHERE recipient_id = ? AND sender_id = ? AND read_at IS NULL")
    .run(userId, otherId);
}
