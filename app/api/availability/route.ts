import { NextResponse, type NextRequest } from "next/server";
import { apiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { replaceAvailability } from "@/lib/data";

type Block = { day?: unknown; start?: unknown; end?: unknown };

export async function POST(request: NextRequest) {
  const auth = await apiUser(["student", "volunteer"]);
  if ("error" in auth) return auth.error;

  let body: { blocks?: Block[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const blocks = Array.isArray(body.blocks) ? body.blocks : [];
  if (blocks.length > 60) return NextResponse.json({ error: "Too many time blocks." }, { status: 400 });

  const clean = blocks
    .map((block) => ({
      day: Number(block.day),
      start: Number(block.start),
      end: Number(block.end),
    }))
    .filter(
      (block) =>
        Number.isInteger(block.day) &&
        block.day >= 0 &&
        block.day <= 6 &&
        Number.isInteger(block.start) &&
        Number.isInteger(block.end) &&
        block.start >= 0 &&
        block.end <= 1440 &&
        block.end > block.start,
    );

  await replaceAvailability(auth.user.id, clean);
  await db.prepare("INSERT INTO audit_log (actor_id, action, detail) VALUES (?, 'availability_updated', ?)").run(
    auth.user.id,
    `${auth.user.name} updated ${clean.length} availability block(s).`,
  );

  return NextResponse.json({ ok: true, blocks: clean.length });
}
