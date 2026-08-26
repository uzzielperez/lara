/** Groq chat helper: current models + retry, so a retired ID never 404s the user. */

import Groq from "groq-sdk";

/** Retired on Groq (free/developer) 2026-08-16. Skip even if env still points here. */
const RETIRED_GROQ_MODELS = new Set([
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "llama3-8b-8192",
  "llama3-70b-8192",
  "gemma2-9b-it",
]);

/** Official Groq replacement for llama-3.1-8b-instant. */
export const GROQ_DEFAULT_MODEL = "openai/gpt-oss-20b";

const BUILTIN_FALLBACKS = [
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-120b",
  "qwen/qwen3.6-27b",
];

export type GroqChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GroqCompleteResult = {
  text: string;
  model: string;
};

export function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

export function groqModelChain(): string[] {
  const fromEnv = process.env.GROQ_MODEL?.trim();
  const ordered = [fromEnv, GROQ_DEFAULT_MODEL, ...BUILTIN_FALLBACKS].filter(
    (id): id is string =>
      typeof id === "string" && id.length > 0 && !RETIRED_GROQ_MODELS.has(id)
  );
  return [...new Set(ordered)];
}

function messageText(message: {
  content?: unknown;
  reasoning?: unknown;
}): string {
  const { content } = message;
  if (typeof content === "string" && content.trim()) return content.trim();
  if (Array.isArray(content)) {
    const joined = content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          return String((part as { text?: string }).text ?? "");
        }
        return "";
      })
      .join("")
      .trim();
    if (joined) return joined;
  }
  return "";
}

function isModelUnavailable(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  const msg = err instanceof Error ? err.message : String(err);
  return (
    status === 404 ||
    /model_not_found|does not exist or you do not have access/i.test(msg)
  );
}

function isJsonValidateFailed(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /json_validate_failed|Failed to validate JSON/i.test(msg);
}

/**
 * Chat completion with model fallback. Returns null if every model fails
 * so callers can answer from the partner knowledge base instead of 500ing.
 */
export async function groqComplete(opts: {
  messages: GroqChatMessage[];
  maxTokens?: number;
  json?: boolean;
}): Promise<GroqCompleteResult | null> {
  const client = getGroqClient();
  if (!client) return null;

  const models = groqModelChain();
  if (models.length === 0) return null;

  for (const model of models) {
    const jsonAttempts = opts.json ? [true, false] : [false];
    for (const useJson of jsonAttempts) {
      try {
        const response = await client.chat.completions.create({
          model,
          messages: opts.messages,
          max_tokens: opts.maxTokens ?? 700,
          ...(useJson ? { response_format: { type: "json_object" as const } } : {}),
          ...(model.startsWith("openai/gpt-oss")
            ? { reasoning_effort: "low" as const }
            : {}),
        });
        const text = messageText(response.choices[0]?.message ?? {});
        if (text) return { text, model };
      } catch (err) {
        if (useJson && isJsonValidateFailed(err)) continue;
        if (isModelUnavailable(err)) break;
        console.error(`Groq ${model} failed:`, err instanceof Error ? err.message : err);
        break;
      }
    }
  }

  return null;
}
