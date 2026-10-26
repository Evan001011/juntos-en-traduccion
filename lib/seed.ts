import type { SqlDb } from "./db";
import { DEMO_PASSWORD } from "./constants";
import { hashPassword } from "./password";
import { nextOccurrence, toLocalISO } from "./time";

type UserSeed = {
  key: string;
  name: string;
  email: string;
  role: "student" | "volunteer" | "admin";
  grade: number | null;
  languages: string;
  bio?: string;
  teach?: string[];
  need?: string[];
  guardian?: [string, string];
  approved: number;
  color: string;
};

function dateDaysAgo(daysAgo: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return toLocalISO(d);
}

function addMinutes(iso: string, minutes: number): string {
  const d = new Date(`${iso.replace(" ", "T")}`);
  return toLocalISO(new Date(d.getTime() + minutes * 60_000));
}

export async function seedDatabase(db: SqlDb) {
  const passwordHash = hashPassword(DEMO_PASSWORD);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, grade_level, languages, bio, guardian_name, guardian_email, guardian_consent_at, approved, avatar_color, created_at)
    VALUES (@name, @email, @password_hash, @role, @grade_level, @languages, @bio, @guardian_name, @guardian_email, @guardian_consent_at, @approved, @avatar_color, datetime('now', '-' || @age_days || ' days'))
  `);
  const insertSubject = db.prepare(`INSERT INTO user_subjects (user_id, subject, kind) VALUES (?, ?, ?)`);
  const insertAvailability = db.prepare(`INSERT INTO availability (user_id, day_of_week, start_min, end_min) VALUES (?, ?, ?, ?)`);
  const insertSession = db.prepare(`
    INSERT INTO sessions (student_id, volunteer_id, subject, scheduled_at, duration_min, status, meeting_link, created_at, completed_at)
    VALUES (@student_id, @volunteer_id, @subject, @scheduled_at, 45, @status, @meeting_link, @created_at, @completed_at)
  `);
  const insertFeedback = db.prepare(`
    INSERT INTO feedback (session_id, volunteer_id, student_id, summary, homework, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertScore = db.prepare(`
    INSERT INTO skill_scores (feedback_id, student_id, skill, score, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertMessage = db.prepare(`
    INSERT INTO messages (sender_id, recipient_id, body, flagged, flag_reason, created_at, read_at)
    VALUES (@sender_id, @recipient_id, @body, @flagged, @flag_reason, datetime('now', '-' || @age_minutes || ' minutes'), @read_at)
  `);
  const insertWorksheet = db.prepare(`
    INSERT INTO worksheets (volunteer_id, title, subject, grade_band, description, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'))
  `);
  const insertQuestion = db.prepare(`
    INSERT INTO worksheet_questions (worksheet_id, prompt, answer, hint, position) VALUES (?, ?, ?, ?, ?)
  `);
  const insertAssignment = db.prepare(`
    INSERT INTO worksheet_assignments (worksheet_id, student_id, assigned_by, status, score, assigned_at, completed_at)
    VALUES (?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'), ?)
  `);
  const insertAnswer = db.prepare(`
    INSERT INTO worksheet_answers (assignment_id, question_id, response, is_correct) VALUES (?, ?, ?, ?)
  `);
  const insertAttempt = db.prepare(`
    INSERT INTO module_attempts (module_id, student_id, score, total, xp, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'))
  `);
  const insertChat = db.prepare(`
    INSERT INTO session_chat (session_id, sender_id, body, created_at)
    VALUES (?, ?, ?, datetime('now', '-' || ? || ' minutes'))
  `);

  const insertAudit = db.prepare(`
    INSERT INTO audit_log (actor_id, action, detail, created_at)
    VALUES (?, ?, ?, datetime('now', '-' || ? || ' hours'))
  `);

  const users: UserSeed[] = [
    {
      key: "admin",
      name: "Elena Ruiz",
      email: "admin@juntos.org",
      role: "admin",
      grade: null,
      languages: "en,es",
      bio: "Program director and safety lead. Former middle-school teacher.",
      approved: 1,
      color: "coral",
    },
    {
      key: "mateo",
      name: "Mateo Álvarez",
      email: "mateo@juntos.org",
      role: "volunteer",
      grade: 12,
      languages: "en,es",
      bio: "Math team captain. I explain fractions with pizza and algebra with skateboard ramps.",
      teach: ["Math", "Science"],
      approved: 1,
      color: "yellow",
    },
    {
      key: "priya",
      name: "Priya Shah",
      email: "priya@juntos.org",
      role: "volunteer",
      grade: 11,
      languages: "en",
      bio: "Debate captain and editor of the school lit mag. Reading comprehension is my happy place.",
      teach: ["English", "Writing", "History"],
      approved: 1,
      color: "lilac",
    },
    {
      key: "jordan",
      name: "Jordan Lee",
      email: "jordan@juntos.org",
      role: "volunteer",
      grade: 13,
      languages: "en,es",
      bio: "First-year college student, heritage Spanish speaker, proud former tutee.",
      teach: ["Spanish", "English", "Writing"],
      approved: 1,
      color: "mint",
    },
    {
      key: "sofia",
      name: "Sofia Kim",
      email: "sofia@juntos.org",
      role: "volunteer",
      grade: 11,
      languages: "en",
      bio: "Physics club treasurer. I would love to help with algebra and test prep.",
      teach: ["Math", "Test Prep"],
      approved: 0,
      color: "pink",
    },
    {
      key: "lucia",
      name: "Lucía Fernández",
      email: "lucia@juntos.org",
      role: "student",
      grade: 7,
      languages: "es,en",
      bio: "I love drawing comics and want to get faster with fractions.",
      need: ["Math", "English"],
      guardian: ["Marta Fernández", "marta.fernandez@example.org"],
      approved: 1,
      color: "coral",
    },
    {
      key: "marcus",
      name: "Marcus Johnson",
      email: "marcus@juntos.org",
      role: "student",
      grade: 9,
      languages: "en",
      bio: "Basketball and algebra. Working toward honors geometry next year.",
      need: ["Math", "Science"],
      guardian: ["Denise Johnson", "denise.johnson@example.org"],
      approved: 1,
      color: "sage",
    },
    {
      key: "amara",
      name: "Amara Okafor",
      email: "amara@juntos.org",
      role: "student",
      grade: 5,
      languages: "en",
      bio: "I like mysteries, comics, and telling stories about my dog Pepper.",
      need: ["English", "Writing"],
      guardian: ["Chidi Okafor", "chidi.okafor@example.org"],
      approved: 1,
      color: "pink",
    },
    {
      key: "diego",
      name: "Diego Torres",
      email: "diego@juntos.org",
      role: "student",
      grade: 8,
      languages: "es,en",
      bio: "New to the school this year. I want to feel confident reading out loud.",
      need: ["Spanish", "Math"],
      guardian: ["Rosa Torres", "rosa.torres@example.org"],
      approved: 1,
      color: "blue",
    },
    {
      key: "hana",
      name: "Hana Park",
      email: "hana@juntos.org",
      role: "student",
      grade: 10,
      languages: "en",
      bio: "Aiming for the science magnet program. Chemistry is hard but fun.",
      need: ["Science", "Test Prep"],
      guardian: ["Jin Park", "jin.park@example.org"],
      approved: 1,
      color: "yellow",
    },
  ];

  const ids: Record<string, number> = {};

  for (const [index, user] of users.entries()) {
    const result = await insertUser.run({
      name: user.name,
      email: user.email,
      password_hash: passwordHash,
      role: user.role,
      grade_level: user.grade,
      languages: user.languages,
      bio: user.bio || null,
      guardian_name: user.guardian?.[0] || null,
      guardian_email: user.guardian?.[1] || null,
      guardian_consent_at: user.guardian ? new Date().toISOString() : null,
      approved: user.approved,
      avatar_color: user.color,
      age_days: 250 - index * 11,
    });
    ids[user.key] = Number(result.lastInsertRowid);
    for (const subject of user.teach || []) await insertSubject.run(ids[user.key], subject, "teach");
    for (const subject of user.need || []) await insertSubject.run(ids[user.key], subject, "need");
  }

  const availability: Array<[string, number, number, number]> = [
    ["mateo", 1, 16 * 60, 18 * 60],
    ["mateo", 2, 17 * 60, 18 * 60 + 30],
    ["mateo", 3, 16 * 60, 18 * 60],
    ["mateo", 4, 17 * 60, 18 * 60 + 30],
    ["mateo", 6, 10 * 60, 12 * 60],
    ["priya", 2, 16 * 60 + 30, 19 * 60],
    ["priya", 4, 16 * 60 + 30, 19 * 60],
    ["priya", 6, 10 * 60, 13 * 60],
    ["jordan", 1, 15 * 60 + 30, 17 * 60 + 30],
    ["jordan", 2, 15 * 60 + 30, 17 * 60 + 30],
    ["jordan", 3, 16 * 60, 18 * 60],
    ["jordan", 4, 16 * 60, 18 * 60],
    ["sofia", 3, 16 * 60, 18 * 60],
    ["lucia", 1, 16 * 60, 18 * 60],
    ["lucia", 3, 16 * 60, 18 * 60],
    ["lucia", 6, 10 * 60, 12 * 60],
    ["marcus", 2, 17 * 60, 19 * 60],
    ["marcus", 4, 17 * 60, 19 * 60],
    ["amara", 2, 16 * 60, 17 * 60 + 30],
    ["amara", 4, 16 * 60, 17 * 60 + 30],
    ["amara", 6, 10 * 60, 12 * 60],
    ["diego", 1, 15 * 60 + 30, 17 * 60 + 30],
    ["diego", 3, 15 * 60 + 30, 17 * 60 + 30],
    ["hana", 2, 18 * 60, 19 * 60 + 30],
    ["hana", 4, 18 * 60, 19 * 60 + 30],
  ];
  for (const [key, day, start, end] of availability) await insertAvailability.run(ids[key], day, start, end);

  const completed: Array<{
    student: string;
    volunteer: string;
    subject: string;
    daysAgo: number;
    hour: number;
    minute: number;
    summary: string;
    homework: string;
    scores: Array<[string, number]>;
  }> = [
    {
      student: "lucia",
      volunteer: "mateo",
      subject: "Math",
      daysAgo: 4,
      hour: 16,
      minute: 30,
      summary: "Warm-up with fraction strips, then equivalent fractions with pizza slices. Lucía explained 2/4 = 1/2 back to me perfectly!",
      homework: "Finish the 4 equivalent-fraction problems on the pizza worksheet.",
      scores: [["Fractions", 3], ["Study Skills", 3]],
    },
    {
      student: "lucia",
      volunteer: "mateo",
      subject: "Math",
      daysAgo: 11,
      hour: 16,
      minute: 30,
      summary: "We used visual models to compare fractions with unlike denominators. Still rushing the multiplication step.",
      homework: "Try questions 1–3 on the Fraction Fix-Up sheet.",
      scores: [["Fractions", 2], ["Study Skills", 3]],
    },
    {
      student: "lucia",
      volunteer: "mateo",
      subject: "Math",
      daysAgo: 18,
      hour: 16,
      minute: 30,
      summary: "First session! We mapped what feels hard and practised naming fractions from drawings.",
      homework: "Draw three fractions you see at home and label them.",
      scores: [["Fractions", 2], ["Algebra", 2]],
    },
    {
      student: "lucia",
      volunteer: "mateo",
      subject: "Math",
      daysAgo: 25,
      hour: 16,
      minute: 30,
      summary: "Reviewed mixed numbers and practised turning them into improper fractions with a step-by-step card.",
      homework: "Mixed numbers practice, 5 questions.",
      scores: [["Fractions", 3], ["Algebra", 2]],
    },
    {
      student: "marcus",
      volunteer: "mateo",
      subject: "Math",
      daysAgo: 6,
      hour: 17,
      minute: 30,
      summary: "Solved two-step equations with algebra tiles. Marcus started checking his own work without prompting.",
      homework: "Khan Academy: two-step equations, first 6 problems.",
      scores: [["Algebra", 4], ["Study Skills", 4]],
    },
    {
      student: "marcus",
      volunteer: "mateo",
      subject: "Math",
      daysAgo: 13,
      hour: 17,
      minute: 30,
      summary: "Distributive property was clicking by the end. We need another pass on negative coefficients.",
      homework: "Three practice problems with negative coefficients.",
      scores: [["Algebra", 3], ["Study Skills", 3]],
    },
    {
      student: "marcus",
      volunteer: "mateo",
      subject: "Math",
      daysAgo: 20,
      hour: 17,
      minute: 30,
      summary: "Diagnostic session. Strong at mental math, needs support turning word problems into equations.",
      homework: "Underline the unknown in each word problem.",
      scores: [["Algebra", 3], ["Study Skills", 2]],
    },
    {
      student: "amara",
      volunteer: "priya",
      subject: "English",
      daysAgo: 5,
      hour: 16,
      minute: 30,
      summary: "Read a short mystery together and practised stop-and-jot predictions. Amara made three thoughtful predictions!",
      homework: "Read one chapter of your library book and jot two questions.",
      scores: [["Reading Comprehension", 3], ["Writing", 3]],
    },
    {
      student: "amara",
      volunteer: "priya",
      subject: "English",
      daysAgo: 12,
      hour: 16,
      minute: 30,
      summary: "Worked on finding the main idea. Amara can retell events but needs help separating main idea from details.",
      homework: "Main-idea graphic organizer for 'The Lost Kite'.",
      scores: [["Reading Comprehension", 2], ["Writing", 3]],
    },
    {
      student: "amara",
      volunteer: "priya",
      subject: "Writing",
      daysAgo: 19,
      hour: 16,
      minute: 30,
      summary: "Built a beginning-middle-end comic strip for a personal story. Very creative details about Pepper the dog.",
      homework: "Finish the ending panel of the comic.",
      scores: [["Writing", 4], ["Reading Comprehension", 2]],
    },
    {
      student: "diego",
      volunteer: "jordan",
      subject: "Spanish",
      daysAgo: 7,
      hour: 16,
      minute: 0,
      summary: "We read a bilingual short story aloud and practised words Diego already knows in both languages.",
      homework: "Pick five cognates from the story and write them in both languages.",
      scores: [["Spanish Literacy", 3], ["Vocabulary", 3]],
    },
    {
      student: "diego",
      volunteer: "jordan",
      subject: "Spanish",
      daysAgo: 14,
      hour: 16,
      minute: 0,
      summary: "First session. Diego is a strong reader in Spanish and wants confidence reading aloud in English class.",
      homework: "Read one page aloud to a family member.",
      scores: [["Spanish Literacy", 4], ["Vocabulary", 2]],
    },
    {
      student: "hana",
      volunteer: "priya",
      subject: "Science",
      daysAgo: 8,
      hour: 18,
      minute: 0,
      summary: "Made a one-page chemistry review sheet and practised explaining density in our own words.",
      homework: "Finish the density practice questions.",
      scores: [["Science", 3], ["Test Strategy", 2]],
    },
    {
      student: "hana",
      volunteer: "priya",
      subject: "Test Prep",
      daysAgo: 15,
      hour: 18,
      minute: 0,
      summary: "Reviewed a practice test, tagged every mistake by type, and chose two strategies to try next time.",
      homework: "Redo the three missed questions without looking at the key.",
      scores: [["Test Strategy", 2], ["Science", 3]],
    },
  ];

  for (const row of completed) {
    const scheduled = dateDaysAgo(row.daysAgo, row.hour, row.minute);
    const result = await insertSession.run({
      student_id: ids[row.student],
      volunteer_id: ids[row.volunteer],
      subject: row.subject,
      scheduled_at: scheduled,
      status: "completed",
      meeting_link: "https://meet.google.com/new",
      created_at: scheduled,
      completed_at: addMinutes(scheduled, 45),
    });
    const sessionId = Number(result.lastInsertRowid);
    const feedback = await insertFeedback.run(
      sessionId,
      ids[row.volunteer],
      ids[row.student],
      row.summary,
      row.homework,
      addMinutes(scheduled, 50),
    );
    const feedbackId = Number(feedback.lastInsertRowid);
    for (const [skill, score] of row.scores) {
      await insertScore.run(feedbackId, ids[row.student], skill, score, addMinutes(scheduled, 50));
    }
  }

  const upcoming: Array<{ student: string; volunteer: string; subject: string; day: number; minute: number }> = [
    { student: "lucia", volunteer: "mateo", subject: "Math", day: 1, minute: 16 * 60 + 30 },
    { student: "marcus", volunteer: "mateo", subject: "Math", day: 4, minute: 17 * 60 },
    { student: "amara", volunteer: "priya", subject: "English", day: 2, minute: 16 * 60 + 30 },
    { student: "hana", volunteer: "priya", subject: "Test Prep", day: 2, minute: 18 * 60 },
    { student: "diego", volunteer: "jordan", subject: "Spanish", day: 3, minute: 16 * 60 },
  ];
  const upcomingIds: Record<string, number> = {};
  for (const row of upcoming) {
    const scheduled = nextOccurrence(row.day, row.minute);
    const result = await insertSession.run({
      student_id: ids[row.student],
      volunteer_id: ids[row.volunteer],
      subject: row.subject,
      scheduled_at: scheduled,
      status: "scheduled",
      meeting_link: "https://meet.google.com/new",
      created_at: new Date().toISOString(),
      completed_at: null,
    });
    upcomingIds[`${row.student}-${row.volunteer}`] = Number(result.lastInsertRowid);
  }

  await insertChat.run(
    upcomingIds["lucia-mateo"],
    ids.mateo,
    "¡Hola Lucía! Today we'll warm up with fraction strips. See you at 4:30!",
    55,
  );
  await insertChat.run(upcomingIds["lucia-mateo"], ids.lucia, "¡Sí! I have my pizza worksheet ready 🍕", 40);

  await insertMessage.run({
    sender_id: ids.lucia,
    recipient_id: ids.mateo,
    body: "Hola Mateo! Do we need to bring anything to our next session?",
    flagged: 0,
    flag_reason: null,
    age_minutes: 340,
    read_at: new Date().toISOString(),
  });
  await insertMessage.run({
    sender_id: ids.mateo,
    recipient_id: ids.lucia,
    body: "Just your worksheet and a pencil. We will review the first three problems together!",
    flagged: 0,
    flag_reason: null,
    age_minutes: 300,
    read_at: null,
  });
  await insertMessage.run({
    sender_id: ids.amara,
    recipient_id: ids.priya,
    body: "My mom said you can call us at [contact info removed] if I get stuck.",
    flagged: 1,
    flag_reason: "Phone number removed",
    age_minutes: 95,
    read_at: null,
  });
  await insertMessage.run({
    sender_id: ids.priya,
    recipient_id: ids.amara,
    body: "I cannot call, but I am here in the app! Send me a message and we will figure it out together.",
    flagged: 0,
    flag_reason: null,
    age_minutes: 70,
    read_at: null,
  });
  await insertMessage.run({
    sender_id: ids.priya,
    recipient_id: ids.amara,
    body: "Also, your reading worksheet is waiting in your portal. Try question 1 before Tuesday!",
    flagged: 0,
    flag_reason: null,
    age_minutes: 60,
    read_at: new Date().toISOString(),
  });
  await insertMessage.run({
    sender_id: ids.admin,
    recipient_id: ids.priya,
    body: "Your conflict-resolution training is approved. Thank you for keeping the student room safe!",
    flagged: 0,
    flag_reason: null,
    age_minutes: 1500,
    read_at: null,
  });

  const worksheet1 = (await insertWorksheet.run(ids.mateo, "Pizza Fractions Practice", "Math", "Grades 5–7", "Draw or write your reasoning for each question. Use the fraction strips if it helps.", 3)).lastInsertRowid;
  const q1: Array<[string, string]> = [
    ["Lucía eats 1/2 of a pizza. Mateo eats 1/4. How much pizza did they eat in total?", "3/4"],
    ["What is 2/8 in simplest form?", "1/4"],
    ["Which is larger: 3/5 or 1/2?", "3/5"],
    ["A recipe needs 3/4 cup of milk. You only have 1/2 cup. How much more do you need?", "1/4 cup"],
    ["Write one fraction equivalent to 1/3.", "2/6"],
  ];
  for (const [i, [prompt, answer]] of q1.entries()) await insertQuestion.run(worksheet1, prompt, answer, null, i);

  const worksheet2 = (await insertWorksheet.run(ids.priya, "The Lost Kite: Reading Detectives", "English", "Grades 4–6", "Read the short story below, then answer the questions.\n\nMarisol launched her red kite on Saturday morning. A gust of wind pulled the string from her hand, and the kite drifted over the park toward the old oak tree. She chased it, but the string tangled high in the branches. Just then, Mr. Chen appeared with a long pole. Together they freed the kite, and Marisol promised to fly it in the open field next time.", 2)
  ).lastInsertRowid;
  const q2: Array<[string, string]> = [
    ["Who helps Marisol get her kite back?", "Mr. Chen"],
    ["What is the main idea of the story?", "A girl solves a problem with a neighbor's help"],
    ["Where was the kite stuck?", "In an oak tree"],
    ["What will Marisol do differently next time?", "Fly the kite in the open field"],
  ];
  for (const [i, [prompt, answer]] of q2.entries()) await insertQuestion.run(worksheet2, prompt, answer, null, i);

  await insertAssignment.run(worksheet1, ids.lucia, ids.mateo, "assigned", null, 2, null);
  await insertAssignment.run(worksheet2, ids.amara, ids.priya, "assigned", null, 1, null);

  const marcusAssignment = (
    await insertAssignment.run(worksheet1, ids.marcus, ids.mateo, "completed", 80, 6, new Date().toISOString())
  ).lastInsertRowid;
  const questions = (await db
    .prepare(`SELECT id FROM worksheet_questions WHERE worksheet_id = ? ORDER BY position`)
    .all(worksheet1)) as Array<{ id: number }>;
  const responses = ["3/4", "1/4", "3/5", "1/2 cup", "2/6"];
  for (const [i, q] of questions.entries()) {
    const correct = responses[i] === q1[i][1] || (i === 3 && responses[i].startsWith("1/4")) ? 1 : 0;
    await insertAnswer.run(marcusAssignment, q.id, responses[i], correct);
  }

  const lessons: Array<{
    title: string;
    subject: string;
    grade: string;
    summary: string;
    steps: string;
    materials: string;
    url: string;
    tags: string;
  }> = [
    {
      title: "Fraction Pizza Party",
      subject: "Math",
      grade: "Grades 5–7",
      summary: "Turn fraction equivalence into a pizza-building game with drawing and storytelling.",
      steps: "1. Draw two pizzas and cut one into 4 slices, the other into 8.\n2. Ask: which pizza has more food? Compare 2/4 and 4/8.\n3. Build three 'orders' (e.g. half pepperoni, quarter mushroom).\n4. Have the student explain each fraction in their own words.\n5. Exit ticket: write two equivalent fractions.",
      materials: "Paper, markers, scissors",
      url: "https://www.khanacademy.org/math/arithmetic/fraction-arithmetic",
      tags: "fractions,visual,hands-on",
    },
    {
      title: "Reading Detectives: Stop & Jot",
      subject: "English",
      grade: "Grades 4–7",
      summary: "Practise predicting, questioning and finding the main idea with sticky notes.",
      steps: "1. Preview the cover/title and make one prediction.\n2. Read one page together, then stop.\n3. Jot one question and one 'I wonder' note.\n4. At the end, sort notes into main idea vs. detail.\n5. Student summarises the story in two sentences.",
      materials: "Short story, sticky notes, pencil",
      url: "https://www.readingrockets.org/strategies",
      tags: "comprehension,reading,main-idea",
    },
    {
      title: "Algebra Tiles Introduction",
      subject: "Math",
      grade: "Grades 7–9",
      summary: "Make two-step equations visible with cut-out algebra tiles and a balance model.",
      steps: "1. Cut out x-tiles and unit tiles (template in the resource link).\n2. Build 2x + 3 = 9 on both sides of a 'balance'.\n3. Remove 3 units from each side.\n4. Split the remaining tiles into two equal groups.\n5. Student writes the inverse operations they used.",
      materials: "Paper tiles, pencil, balance mat",
      url: "https://www.khanacademy.org/math/algebra-basics",
      tags: "algebra,equations,manipulatives",
    },
    {
      title: "Personal Narrative Kickstart",
      subject: "Writing",
      grade: "Grades 6–9",
      summary: "Use a comic-strip storyboard to plan a personal narrative with sensory details.",
      steps: "1. Pick a small, true moment (not the whole summer).\n2. Storyboard beginning, middle, end in three boxes.\n3. Add one sensory detail to each box.\n4. Draft the first paragraph together.\n5. Read it aloud and revise one sentence.",
      materials: "Storyboard template, pencil",
      url: "https://www.readwritethink.org/classroom-resources/lesson-plans",
      tags: "writing,narrative,planning",
    },
    {
      title: "Vocabulary Charades",
      subject: "English",
      grade: "Grades 4–8",
      summary: "Act out new words, then connect them to a read-aloud with context clues.",
      steps: "1. Pick five words from the student's reading.\n2. Student acts out each word without speaking.\n3. Use it in a sentence about their own life.\n4. Find the context clue in the text.\n5. Write a short 'word wall' card with a picture.",
      materials: "Word list, index cards",
      url: "https://www.vocabulary.com",
      tags: "vocabulary,esl,games",
    },
    {
      title: "Science Notebooks: Notice & Wonder",
      subject: "Science",
      grade: "Grades 5–8",
      summary: "Build a two-column notice/wonder notebook while exploring a phenomenon.",
      steps: "1. Pick a phenomenon (ice melting, shadows, a plant).\n2. Write what you notice only — no explanations yet.\n3. Write at least three wonders.\n4. Choose one wonder and design a quick test.\n5. Add results to the notebook with a diagram.",
      materials: "Notebook, pencil, simple objects",
      url: "https://www.exploratorium.edu/explore",
      tags: "science,inquiry,notebooks",
    },
    {
      title: "Bilingual Read-Aloud Bridge",
      subject: "Spanish",
      grade: "Grades 3–7",
      summary: "Read the same short text in Spanish and English to build confidence and cognates.",
      steps: "1. Read the Spanish page aloud together, slowly.\n2. Ask the student to retell it in their stronger language.\n3. Circle five cognates.\n4. Read the English page and match the cognates.\n5. Student teaches one new word back to you.",
      materials: "Bilingual picture book or article",
      url: "https://www.colorincolorado.org",
      tags: "bilingual,reading,cognates",
    },
    {
      title: "Test Prep Error Analysis",
      subject: "Test Prep",
      grade: "Grades 8–12",
      summary: "Turn mistakes into a personal strategy list instead of just re-doing questions.",
      steps: "1. Choose three missed questions from a practice set.\n2. Label each error: content, careless, or strategy.\n3. Write the correct reasoning in one sentence.\n4. Pick two test-taking moves to try next time.\n5. Re-attempt one similar question without notes.",
      materials: "Practice test, coloured pens",
      url: "https://www.khanacademy.org/test-prep",
      tags: "test-prep,metacognition",
    },
  ];
  const insertLesson = db.prepare(`
    INSERT INTO lesson_plans (volunteer_id, title, subject, grade_band, duration_min, summary, steps, materials, resource_url, tags, created_at)
    VALUES (NULL, ?, ?, ?, 45, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' days'))
  `);
  for (const [i, lesson] of lessons.entries()) {
    await insertLesson.run(lesson.title, lesson.subject, lesson.grade, lesson.summary, lesson.steps, lesson.materials, lesson.url, lesson.tags, 40 - i * 3);
  }

  const modules: Array<{
    title: string;
    subject: string;
    skill: string;
    grade: string;
    emoji: string;
    blurb: string;
    accent: string;
    cards: Array<[string, string, string]>;
  }> = [
    {
      title: "Pizza Fraction Party",
      subject: "Math",
      skill: "Fractions",
      grade: "Grades 5–7",
      emoji: "🍕",
      blurb: "Slice, compare and add fractions with a pizza-shop twist.",
      accent: "coral",
      cards: [
        ["What is 1/2 + 1/4?", "3/4", "Cut both fractions into quarters: 2/4 + 1/4."],
        ["Which is bigger: 2/3 or 3/5?", "2/3", "Make a common denominator: 10/15 vs 9/15."],
        ["What is 4/8 in simplest form?", "1/2", "Divide top and bottom by 4."],
        ["A pizza has 8 slices. You eat 3. What fraction is left?", "5/8", "8/8 minus 3/8."],
        ["What is 1/3 + 1/6?", "1/2", "1/3 = 2/6, so 2/6 + 1/6 = 3/6."],
        ["What is 3/4 of 12?", "9", "Divide 12 into 4 groups, then take 3 groups."],
      ],
    },
    {
      title: "Fraction Fix-Up",
      subject: "Math",
      skill: "Fractions",
      grade: "Grades 6–8",
      emoji: "🧮",
      blurb: "Mixed numbers, improper fractions and word problems.",
      accent: "yellow",
      cards: [
        ["Write 7/4 as a mixed number.", "1 3/4", "4 fits once, with 3 left over."],
        ["Write 2 1/2 as an improper fraction.", "5/2", "2 × 2 + 1 over 2."],
        ["What is 3/5 × 10?", "6", "Multiply 3 × 10, then divide by 5."],
        ["What is 1/2 ÷ 1/4?", "2", "How many quarters fit in a half?"],
        ["A recipe uses 2/3 cup per batch. For 3 batches?", "2 cups", "3 × 2/3 = 6/3."],
        ["Order from smallest: 1/2, 1/4, 3/4.", "1/4, 1/2, 3/4", "Small denominators can be deceptive — compare tenths."],
      ],
    },
    {
      title: "Story Detectives",
      subject: "English",
      skill: "Reading Comprehension",
      grade: "Grades 4–6",
      emoji: "🔍",
      blurb: "Find the main idea, clues and character changes in short stories.",
      accent: "lilac",
      cards: [
        ["What is the main idea of a story?", "What the story is mostly about", "It is bigger than one detail."],
        ["What does a prediction use?", "Clues from the text plus what you know", "Think: because of this clue, I expect…"],
        ["What is a character trait?", "A word describing how someone acts or feels", "Brave, curious, stubborn."],
        ["What is the setting?", "Where and when the story happens", "Look for place words and time words."],
        ["Why do readers stop and jot?", "To hold onto their thinking while reading", "One thought at a time."],
        ["What makes a summary strong?", "It includes the key events in order, briefly", "Beginning, middle, end."],
      ],
    },
    {
      title: "Context Clue Camp",
      subject: "English",
      skill: "Vocabulary",
      grade: "Grades 5–8",
      emoji: "🧩",
      blurb: "Use nearby words to figure out unfamiliar vocabulary.",
      accent: "sage",
      cards: [
        ["What is a context clue?", "A hint in nearby words that helps you infer meaning", "Read the whole sentence."],
        ["'The fragile vase cracked when it touched the floor.' What does fragile mean?", "Easily broken", "The cracking floor is a clue."],
        ["What does 'reluctantly' mean in 'She reluctantly handed over her phone'?", "Doing something unwillingly", "Think about wanting to keep it."],
        ["What does 'enormous' mean?", "Very large", "Enormous, gigantic, huge."],
        ["What does 'observe' mean?", "To watch carefully", "Scientists observe."],
        ["What does 'peculiar' mean?", "Strange or unusual", "A peculiar smell."],
      ],
    },
    {
      title: "Algebra Adventure",
      subject: "Math",
      skill: "Algebra",
      grade: "Grades 7–9",
      emoji: "🚀",
      blurb: "Two-step equations and balance-model thinking.",
      accent: "mint",
      cards: [
        ["Solve 2x + 3 = 11.", "x = 4", "Subtract 3, then divide by 2."],
        ["Solve 3x − 6 = 9.", "x = 5", "Add 6, then divide by 3."],
        ["Solve x/4 + 2 = 5.", "x = 12", "Subtract 2 first, then multiply by 4."],
        ["What is the first inverse operation in 5x + 7 = 32?", "Subtract 7", "Undo addition before multiplication."],
        ["Solve 2(x + 3) = 16.", "x = 5", "Distribute or divide both sides by 2 first."],
        ["If 4x = 2x + 10, what is x?", "5", "Subtract 2x from both sides."],
      ],
    },
    {
      title: "Essay Spark",
      subject: "Writing",
      skill: "Writing",
      grade: "Grades 6–10",
      emoji: "✍️",
      blurb: "Build a claim, support it with evidence, and add a strong ending.",
      accent: "pink",
      cards: [
        ["What belongs in a thesis statement?", "Your claim plus the reason", "One clear sentence near the start."],
        ["What is evidence in an essay?", "A fact, example or quote that supports your claim", "Explain why it matters."],
        ["What is a transition word?", "A word that connects ideas, like 'therefore'", "Signals where the argument is going."],
        ["What is revision?", "Big-picture changes to ideas and structure", "Editing fixes small errors later."],
        ["Which is a stronger detail: 'It was nice' or 'The room smelled like cinnamon'?", "The cinnamon detail", "Specific sensory detail beats vague description."],
        ["What should a conclusion do?", "Restate the claim and leave the reader thinking", "No brand-new evidence."],
      ],
    },
    {
      title: "Science Sleuths",
      subject: "Science",
      skill: "Science",
      grade: "Grades 5–8",
      emoji: "🔬",
      blurb: "Notice, wonder, hypothesize — then explain like a scientist.",
      accent: "blue",
      cards: [
        ["What is a hypothesis?", "A testable explanation you can investigate", "Start with: If… then…"],
        ["What does density measure?", "Mass per unit of volume", "Density = mass ÷ volume."],
        ["What is a variable in an experiment?", "Something that can change or be changed", "Change one thing at a time."],
        ["Why do we repeat trials?", "To check that results are reliable", "One result could be a fluke."],
        ["What is the difference between observation and inference?", "Observation is what you notice; inference is what you conclude", "See vs. think."],
        ["What is the water cycle?", "Water evaporates, condenses, and falls as precipitation", "Think clouds and rain."],
      ],
    },
    {
      title: "Puente de Palabras",
      subject: "Spanish",
      skill: "Spanish Literacy",
      grade: "Grades 4–8",
      emoji: "🌉",
      blurb: "Bilingual vocabulary and cognate bridges for stronger reading in both languages.",
      accent: "coral",
      cards: [
        ["What is a cognate?", "A word that looks and means something similar in two languages", "Family / familia."],
        ["¿Cómo se dice 'library' en español?", "la biblioteca", "Careful: 'librería' means bookstore!"],
        ["¿Qué significa 'aprender'?", "to learn", "Aprender algo nuevo."],
        ["Translate: 'I am nervous but excited.'", "Estoy nervioso pero emocionado.", "Use one feeling at a time."],
        ["What does 'a pesar de' mean?", "in spite of", "A pesar de la lluvia, salimos."],
        ["¿Cómo se dice 'homework'?", "la tarea", "Tarea is also a task."],
      ],
    },
    {
      title: "Test Quest",
      subject: "Test Prep",
      skill: "Test Strategy",
      grade: "Grades 8–12",
      emoji: "🗺️",
      blurb: "Turn mistakes into a personal strategy map for test day.",
      accent: "yellow",
      cards: [
        ["What should you do first when a question looks impossible?", "Mark it and come back later", "Protect your time."],
        ["What is error analysis?", "Sorting mistakes by why they happened", "Content, careless, or strategy."],
        ["How can you check an answer in a math test?", "Substitute it back into the problem", "Estimate first, too."],
        ["What is a distractor answer?", "An option designed to look right but is wrong", "Watch for partial truths."],
        ["What helps before a test?", "Sleep, water, and a calm routine", "Cramming all night does not."],
        ["What should you do after a practice test?", "Review the questions you missed and name the error type", "The review is the learning."],
      ],
    },
  ];

  const insertModule = db.prepare(`
    INSERT INTO learning_modules (title, subject, skill, grade_band, emoji, blurb, cards_json, accent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const moduleIds: number[] = [];
  for (const mod of modules) {
    const result = await insertModule.run(
      mod.title,
      mod.subject,
      mod.skill,
      mod.grade,
      mod.emoji,
      mod.blurb,
      JSON.stringify(mod.cards.map(([front, back, hint]) => ({ front, back, hint }))),
      mod.accent,
    );
    moduleIds.push(Number(result.lastInsertRowid));
  }

  await insertAttempt.run(moduleIds[0], ids.lucia, 4, 6, 14, 3);
  await insertAttempt.run(moduleIds[2], ids.lucia, 5, 6, 16, 9);
  await insertAttempt.run(moduleIds[2], ids.amara, 4, 6, 13, 2);
  await insertAttempt.run(moduleIds[4], ids.marcus, 5, 6, 15, 5);
  await insertAttempt.run(moduleIds[7], ids.diego, 5, 6, 15, 4);

  await insertAudit.run(ids.admin, "approved_volunteer", "Approved Mateo Álvarez, Priya Shah and Jordan Lee after reference checks.", 200);
  await insertAudit.run(ids.admin, "flagged_message", "Blocked a phone number sent from Amara Okafor to Priya Shah. Guardian reminder sent.", 1);
  await insertAudit.run(ids.admin, "privacy_training", "Quarterly student-safety and mandated-reporter refresher completed.", 30);
}
