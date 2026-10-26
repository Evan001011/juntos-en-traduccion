import { NextResponse, type NextRequest } from "next/server";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAnswers, getQuestions, getWorksheet } from "@/lib/data";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function page(title: string, subtitle: string, body: string) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} · Juntos offline kit</title>
<style>
  :root { --ink:#302a25; --cream:#fbf7ec; --coral:#ff5252; --sage:#9bb068; --yellow:#ffc83b; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--cream); color:var(--ink); font-family: "Trebuchet MS", system-ui, sans-serif; line-height:1.5; }
  header { background:#ffe1e6; padding:28px 24px 22px; border-bottom:3px solid var(--ink); }
  .wrap { max-width: 780px; margin: 0 auto; }
  .brand { font-size:13px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; }
  h1 { font-size:32px; margin:8px 0 4px; }
  .sub { font-weight:700; opacity:.7; }
  main { max-width:780px; margin:0 auto; padding:24px; }
  .tip { background:#fff0c2; border:2px dashed var(--ink); border-radius:16px; padding:12px 16px; font-size:14px; font-weight:700; margin-bottom:20px; }
  details { background:#fff; border:2px solid rgba(48,42,37,.15); border-radius:16px; padding:14px 16px; margin:10px 0; }
  summary { cursor:pointer; font-weight:800; font-size:17px; }
  .answer { margin-top:10px; padding:10px 12px; background:#e4ebcf; border-radius:10px; font-weight:700; }
  .hint { margin-top:8px; font-size:13px; opacity:.65; }
  ol { padding-left:22px; }
  li { margin:14px 0; font-weight:700; }
  .answer-key { margin-top:30px; border-top:2px dashed rgba(48,42,37,.2); padding-top:16px; }
  .actions { margin:22px 0; display:flex; gap:10px; flex-wrap:wrap; }
  button { border:0; border-radius:999px; padding:12px 20px; font-weight:800; font-size:14px; cursor:pointer; background:var(--coral); color:#fff; }
  .foot { text-align:center; font-size:11px; opacity:.55; padding:20px; }
  @media print {
    .actions, .tip, .no-print { display:none !important; }
    body { background:#fff; }
    header { background:#fff; border-bottom:2px solid #000; }
    details { break-inside: avoid; }
    details[open] summary { list-style:none; }
  }
</style>
</head>
<body>
<header>
  <div class="wrap">
    <div class="brand">★ Juntos en Traducción · Offline learning kit</div>
    <h1>${escapeHtml(title)}</h1>
    <div class="sub">${escapeHtml(subtitle)}</div>
  </div>
</header>
<main>
  <div class="actions no-print"><button onclick="window.print()">🖨️ Print this kit</button><span style="font-size:12px;font-weight:700;align-self:center">Works without internet.</span></div>
  ${body}
</main>
<footer class="foot">Free peer tutoring · Juntos en Traducción · Keep learning, anywhere.</footer>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  const auth = await apiUser();
  if ("error" in auth) return auth.error;
  const url = new URL(request.url);
  const moduleId = Number(url.searchParams.get("module"));
  const assignmentId = Number(url.searchParams.get("assignment"));

  if (Number.isInteger(moduleId) && moduleId > 0) {
    const moduleRow = (await db.prepare("SELECT * FROM learning_modules WHERE id = ?").get(moduleId)) as
      | { id: number; title: string; subject: string; skill: string; grade_band: string; blurb: string; cards_json: string }
      | undefined;
    if (!moduleRow) return NextResponse.json({ error: "Deck not found." }, { status: 404 });
    const cards = JSON.parse(moduleRow.cards_json) as Array<{ front: string; back: string; hint: string }>;
    const body = `
      <div class="tip">✂️ Print these cards, cut along the dotted lines, or open this file on a phone with no connection. Tap/click a question to reveal the answer.</div>
      ${cards
        .map(
          (card, index) => `<details>
            <summary>${index + 1}. ${escapeHtml(card.front)}</summary>
            <div class="answer">✓ ${escapeHtml(card.back)}</div>
            <div class="hint">Hint: ${escapeHtml(card.hint)}</div>
          </details>`,
        )
        .join("")}
      <h2 style="margin-top:28px">Quick quiz</h2>
      <p style="font-weight:600">Answer on a separate sheet, then check the flip cards above.</p>
      <ol>${cards.map((card) => `<li>${escapeHtml(card.front)}</li>`).join("")}</ol>
    `;
    const html = page(moduleRow.title, `${moduleRow.subject} · ${moduleRow.skill} · ${moduleRow.grade_band}`, body);
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="juntos-${moduleRow.skill.toLowerCase().replace(/\s+/g, "-")}-kit.html"`,
      },
    });
  }

  if (Number.isInteger(assignmentId) && assignmentId > 0) {
    const assignment = (await db
      .prepare("SELECT * FROM worksheet_assignments WHERE id = ?")
      .get(assignmentId)) as
      | { id: number; worksheet_id: number; student_id: number; assigned_by: number; status: string; score: number | null }
      | undefined;
    if (!assignment) return NextResponse.json({ error: "Worksheet assignment not found." }, { status: 404 });
    const allowed =
      auth.user.role === "admin" ||
      (auth.user.role === "student" && auth.user.id === assignment.student_id) ||
      (auth.user.role === "volunteer" && auth.user.id === assignment.assigned_by);
    if (!allowed) return NextResponse.json({ error: "You do not have access to this worksheet." }, { status: 403 });

    const worksheet = await getWorksheet(assignment.worksheet_id);
    if (!worksheet) return NextResponse.json({ error: "Worksheet not found." }, { status: 404 });
    const questions = await getQuestions(assignment.worksheet_id);
    const answers = await getAnswers(assignment.id);
    const answerMap = new Map(answers.map((answer) => [answer.question_id, answer]));
    const body = `
      <div class="tip">✏️ Write your answers on paper, or ask a family member to read the questions aloud. The answer key is at the end — try first!</div>
      ${worksheet.description ? `<div style="background:#fff;border-radius:16px;padding:16px;margin-bottom:18px;font-weight:600;white-space:pre-wrap">${escapeHtml(worksheet.description)}</div>` : ""}
      <ol>
        ${questions
          .map((question) => {
            const submitted = answerMap.get(question.id);
            return `<li>${escapeHtml(question.prompt)}
              ${question.hint ? `<div class="hint">Hint: ${escapeHtml(question.hint)}</div>` : ""}
              ${submitted ? `<div class="answer">Your answer: ${escapeHtml(submitted.response)} ${submitted.is_correct ? "✓" : "✗"}</div>` : ""}
            </li>`;
          })
          .join("")}
      </ol>
      <details class="answer-key">
        <summary>Answer key — check after you try</summary>
        <div style="margin-top:12px">
          ${questions.map((question, index) => `<p style="font-weight:700">${index + 1}. ${escapeHtml(question.answer)}</p>`).join("")}
        </div>
      </details>
    `;
    const html = page(worksheet.title, `${worksheet.subject} · ${worksheet.grade_band || "All grades"} · ${questions.length} questions`, body);
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="juntos-worksheet-${worksheet.id}.html"`,
      },
    });
  }

  return NextResponse.json({ error: "Choose a deck or worksheet to download." }, { status: 400 });
}
