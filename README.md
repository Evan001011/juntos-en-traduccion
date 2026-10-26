# Juntos en Traducción

**Free peer tutoring that closes the post-pandemic learning gap — and the language gap at the same time.**

Juntos en Traducción is a closed-loop, role-based tutoring platform for a school community. Student volunteers are matched to peers by subject need, shared availability and language, then every session feeds a structured skills profile that automatically rebuilds the student's personalized learning plan. A privacy-first classroom translator built into every page (and into the live session room) means a tutor and tutee never lose each other to a language barrier.

Built for a school community's volunteer tutoring program.

---

## The problem

Post-pandemic learning loss hit hardest in districts where private tutoring is out of reach. At the same time, high-school students need verified service hours and real leadership experience. Juntos connects the two with a safe, supervised, data-driven loop:

1. A student shares the subjects they need and the hours they are free.
2. The matching engine ranks approved volunteers by subject overlap, shared availability, language and past sessions.
3. A 45-minute session is booked with one click, with a Google Meet link and a calendar invite.
4. The volunteer logs micro-skill ratings (e.g. *Fractions 2/5*, *Reading Comprehension 4/5*).
5. The student's learning hub immediately surfaces flashcard decks targeting the weakest skills, and every deck can be printed or downloaded as an offline HTML kit.
6. Admins watch the whole loop: approvals, flagged messages, sessions and export-ready impact metrics.

---

## Demo accounts

All demo accounts use the password **`demo1234`**.

| Role | Email | Notes |
| --- | --- | --- |
| Admin | `admin@juntos.org` | Safety queue, volunteer approvals, impact dashboard |
| Volunteer | `mateo@juntos.org` | Math + Science, approved, bilingual |
| Volunteer | `priya@juntos.org` | English, Writing, History |
| Volunteer | `jordan@juntos.org` | Spanish, English, Writing |
| Volunteer | `sofia@juntos.org` | **Pending approval** — use this to demo the admin approval flow |
| Student | `lucia@juntos.org` | Grade 7, bilingual, needs Math + English |
| Student | `marcus@juntos.org` | Grade 9, needs Math + Science |
| Student | `amara@juntos.org` | Grade 5, needs English + Writing |
| Student | `diego@juntos.org` | Grade 8, needs Spanish + Math |
| Student | `hana@juntos.org` | Grade 10, needs Science + Test Prep |

The database seeds itself on first run with availability, sessions, feedback, skill scores, worksheets, learning decks and a flagged-message safety example.

---

## Run it

```bash
npm install
cp .env.example .env   # optional integrations
npm run dev            # http://localhost:3210
```

Optional environment variables (the app runs fully without them):

| Variable | Purpose |
| --- | --- |
| `GOOGLE_CHAT_WEBHOOK` | Google Chat space webhook. Bookings, completed sessions, worksheet events, volunteer approvals and safety flags are posted to the space. Without it, alerts are logged to the server console in demo mode. |
| `GOOGLE_MEET_BASE` | Meeting link used for new sessions (defaults to `https://meet.google.com/new`). |
| `NEXT_PUBLIC_SCHOOL_TZ` | School timezone used for the availability grid and calendar exports (default `America/New_York`). |

Other scripts:

```bash
npm run typecheck   # TypeScript, no emit
npm run build       # production build
npm start           # serve the production build on :3210
```

Data lives in `data/juntos.db` (SQLite, WAL mode). Delete that file to reseed from scratch.

---

## What each portal does

### Public site
- Mission, live program metrics, the matching story, safety/COPPA commitments and a translator playground.
- Separate student and volunteer sign-up funnels that capture learning needs / subject expertise immediately.

### Student portal
- **Dashboard** — next session, streak and XP, skill snapshot, recommended tutors.
- **Find a tutor** — curated matches with a transparent match score, shared subjects, weekly availability overlap and one-click booking of a real open slot.
- **Learning hub** — flashcard decks and mini-quizzes chosen from the latest skill ratings, XP tracking, and offline download of any deck.
- **Worksheets** — assigned by volunteers, with instant scoring, answer review and a printable/offline kit.
- **Sessions** — join the Google Meet room, open the calendar `.ics`, chat in the session room, and read tutor feedback.
- **Messages** — guarded messaging with matched tutors and the safety team.

### Volunteer portal
- **Dashboard** — upcoming sessions, hours served, students needing help, pending approvals.
- **Availability grid** — toggle 30-minute after-school blocks across the week; matching updates immediately.
- **Lesson library** — searchable open worksheets, guides and discussion prompts by subject and grade band.
- **Worksheet builder** — create a worksheet with questions, hints and an answer key, then assign it to students; answers land in the student portal.
- **Sessions** — join rooms, export calendar invites, and submit the analytics form (summary, homework, 1–5 micro-skill ratings) that powers the student's learning plan.

### Admin dashboard
- **Overview** — active matches, sessions this week, hours logged, approval queue and recent audit activity.
- **Volunteer approvals** — approve or pause volunteer access; every decision is audited.
- **Safety queue** — review messages where contact information was blocked, then dismiss or delete them.
- **Impact report** — tutoring hours, students served, skill growth, session completion, language pairings and export-ready program metrics.

---

## Architecture

```
Next.js 15 (App Router, React 19, TypeScript)
        │
        ├── Server Components + route handlers (all access checks server-side)
        ├── SQLite via better-sqlite3 (WAL) — single relational database
        └── Cookie sessions, scrypt password hashing, role guards on every route
```

### Database relationships

| Table | Purpose |
| --- | --- |
| `users` | Identity + role (`student` / `volunteer` / `admin`), grade, languages, guardian consent, approval state |
| `auth_sessions` | Opaque session tokens with expiry |
| `user_subjects` | Subjects a student needs (`kind = need`) or a volunteer teaches (`kind = teach`) |
| `availability` | Day-of-week + start/end minutes per user, in school time |
| `sessions` | Student ↔ volunteer, subject, scheduled time, status, Google Meet link |
| `feedback` | Per-session summary + homework, linked to volunteer and student |
| `skill_scores` | Structured 1–5 micro-skill ratings that drive the learning engine |
| `learning_modules` | Flashcard decks keyed to subject and skill |
| `module_attempts` | Student quiz results and XP |
| `worksheets` / `worksheet_questions` / `worksheet_assignments` / `worksheet_answers` | Volunteer-authored worksheets, delivery to students, scored answers |
| `messages` | Guarded in-app messaging, with `flagged` + `flag_reason` |
| `session_chat` | Live session-room chat with optional translated copy |
| `audit_log` | Every consequential action: bookings, feedback, approvals, flags, worksheet events |

### Security & privacy
- Passwords hashed with scrypt (`lib/password.ts`); sessions are random 32-byte httpOnly cookies with a 30-day expiry.
- Every page calls `requireRole`; every API route calls `apiUser([...roles])` and scopes rows to the signed-in user.
- Student sign-up requires a guardian name, guardian email and explicit consent (COPPA-style flow).
- Phone numbers, emails, social handles and street addresses are scrubbed from messages and session chat; flagged attempts go to the admin safety queue and Google Chat.
- The translator runs locally in the app — student text is never sent to a third party.

---

## The translator

`lib/translator.ts` is a privacy-first English ↔ Spanish phrasebook and word engine tuned for tutoring:
- Sentence-level phrasebook for classroom language ("Can you explain it again?", "Where are you stuck?", "My phone number is private.").
- Word-level fallback with morphology, including attached Spanish pronouns (*explicarlo* → "explain it", *mostrarme* → "show me").
- Punctuation handling for Spanish `¿…?` / `¡…!`.
- Exposed at `POST /api/translate` and in the floating translator dock on every page, plus a side-by-side translator inside the live session room (one click sends the translated message to the chat).

## Google integrations
- **Meet** — every booking receives a Meet link; the session room opens it.
- **Calendar** — `GET /api/calendar/[id]` returns a standards-compliant `.ics` invite (only for that session's student, volunteer or an admin).
- **Chat** — `lib/google.ts` posts booking, completion, worksheet, approval and safety events to a Google Chat webhook when configured.

## Offline accessibility
`GET /api/offline-kit?module=<id>` returns a printable, self-contained HTML deck (question → flip answer + quick quiz), and `?assignment=<id>` returns the worksheet with an answer key. Both work with no connection once saved, and print cleanly for families without devices.

---

## Project structure

```
app/
  page.tsx                 public landing page
  login/, signup/[role]/   auth + dual onboarding
  student/                 dashboard, find, learning, worksheets, sessions, messages
  volunteer/               dashboard, availability, lessons, worksheets, sessions, messages
  admin/                   overview, volunteers, safety, messages, impact
  session/[id]/            live session room (Meet + chat + translator)
  api/                     auth, availability, sessions, chat, feedback, worksheets,
                           learning, messages, admin, calendar, offline-kit, translate
components/                design system, portal shell, mascots, grids, players, translator
lib/                       db, schema, seed, auth, data, matching, time, safety,
                           translator, learning, google
data/juntos.db             seeded SQLite database (created on first run)
```

Design language: warm cream paper, pastel candy stripes, coral/yellow/sage/lilac accents, chunky multi-colored display type, hand-drawn doodle accents and flat storybook mascots.
