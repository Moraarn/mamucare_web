import Anthropic from "@anthropic-ai/sdk";
import { MAMUCARE_SYSTEM_PROMPT } from "@/lib/prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5";

const MAX_MESSAGES = 20; // keep only the latest turns
const MAX_CHARS = 2000; // per message

type ChatMessage = { role: "user" | "assistant"; content: string };

// Very small in-memory rate limit (per IP). Use Redis/Upstash in production.
const hits = new Map<string, { count: number; reset: number }>();
function rateLimited(ip: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

function sanitize(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;
  const cleaned: ChatMessage[] = [];
  for (const m of input.slice(-MAX_MESSAGES)) {
    if (
      !m ||
      (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string" ||
      !m.content.trim()
    )
      continue;
    cleaned.push({ role: m.role, content: m.content.slice(0, MAX_CHARS) });
  }
  // Claude requires the first message to be from the user
  while (cleaned.length && cleaned[0].role !== "user") cleaned.shift();
  if (!cleaned.length || cleaned[cleaned.length - 1].role !== "user") return null;
  return cleaned;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (rateLimited(ip)) {
    return new Response("Too many messages. Please wait a moment.", { status: 429 });
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid request", { status: 400 });
  }

  const messages = sanitize(body.messages);
  if (!messages) return new Response("Invalid messages", { status: 400 });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = anthropic.messages.stream({
          model: MODEL,
          max_tokens: 700,
          system: MAMUCARE_SYSTEM_PROMPT,
          messages,
        });

        response.on("text", (text) => controller.enqueue(encoder.encode(text)));
        await response.finalMessage();
        controller.close();
      } catch (err) {
        console.error("Claude error:", err);
        controller.enqueue(
          encoder.encode(
            "\n\nSorry, I'm having trouble connecting right now. Please try again in a moment."
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
