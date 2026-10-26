import { NextResponse, type NextRequest } from "next/server";
import { translateText } from "@/lib/translator";

export async function POST(request: NextRequest) {
  let body: { text?: unknown; from?: unknown; to?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text.slice(0, 500) : "";
  const from = body.from === "es" ? "es" : "en";
  const to = body.to === "en" ? "en" : "es";
  if (!text.trim()) return NextResponse.json({ error: "Add something to translate." }, { status: 400 });
  const result = translateText(text, from, to);
  return NextResponse.json({ ...result, from, to });
}
