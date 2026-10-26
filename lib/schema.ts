export const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'volunteer', 'admin')),
  grade_level INTEGER,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  languages TEXT NOT NULL DEFAULT 'en',
  bio TEXT,
  guardian_name TEXT,
  guardian_email TEXT,
  guardian_consent_at TEXT,
  approved INTEGER NOT NULL DEFAULT 0,
  avatar_color TEXT NOT NULL DEFAULT 'coral',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_subjects (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('teach', 'need')),
  PRIMARY KEY (user_id, subject, kind)
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_min INTEGER NOT NULL CHECK (start_min >= 0 AND start_min < 1440),
  end_min INTEGER NOT NULL CHECK (end_min > start_min AND end_min <= 1440)
);
CREATE INDEX IF NOT EXISTS idx_availability_user ON availability(user_id);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  volunteer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  duration_min INTEGER NOT NULL DEFAULT 45,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  meeting_link TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_student ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_volunteer ON sessions(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_time ON sessions(scheduled_at);

CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE,
  volunteer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  homework TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS skill_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feedback_id INTEGER NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_skill_scores_student ON skill_scores(student_id);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  flagged INTEGER NOT NULL DEFAULT 0,
  flag_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  read_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages(sender_id, recipient_id);

CREATE TABLE IF NOT EXISTS worksheets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  volunteer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_band TEXT,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS worksheet_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worksheet_id INTEGER NOT NULL REFERENCES worksheets(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  answer TEXT NOT NULL,
  hint TEXT,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_questions_worksheet ON worksheet_questions(worksheet_id);

CREATE TABLE IF NOT EXISTS worksheet_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worksheet_id INTEGER NOT NULL REFERENCES worksheets(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'completed')),
  score INTEGER,
  assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_assignments_student ON worksheet_assignments(student_id);

CREATE TABLE IF NOT EXISTS worksheet_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment_id INTEGER NOT NULL REFERENCES worksheet_assignments(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES worksheet_questions(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  is_correct INTEGER NOT NULL DEFAULT 0,
  UNIQUE (assignment_id, question_id)
);

CREATE TABLE IF NOT EXISTS lesson_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  volunteer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_band TEXT NOT NULL,
  duration_min INTEGER NOT NULL DEFAULT 45,
  summary TEXT NOT NULL,
  steps TEXT NOT NULL,
  materials TEXT,
  resource_url TEXT,
  tags TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS learning_modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  skill TEXT NOT NULL,
  grade_band TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '✨',
  blurb TEXT NOT NULL,
  cards_json TEXT NOT NULL,
  accent TEXT NOT NULL DEFAULT 'yellow'
);

CREATE TABLE IF NOT EXISTS module_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id INTEGER NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  xp INTEGER NOT NULL DEFAULT 10,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON module_attempts(student_id);

CREATE TABLE IF NOT EXISTS session_chat (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  translated_body TEXT,
  translated_lang TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_chat_session ON session_chat(session_id);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;
