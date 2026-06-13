import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  GUIDED_RESPONSE_JSON_SCHEMA,
  parseGuidedResponse,
} from "@/lib/guided-chat";
import { getStepSystemAddon } from "@/lib/sprint1-flow";
import {
  formatProfileForAI,
  isProfileComplete,
  type ProfileInput,
} from "@/lib/user-profile";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

function readCsvSafe(file: string): string[] {
  try {
    const p = path.join(process.cwd(), file);
    if (!fs.existsSync(p)) return [];
    return fs.readFileSync(p, "utf8").split(/\r?\n/).slice(0, 5000);
  } catch {
    return [];
  }
}

function retrieve(mode: string, query: string): string {
  const corpus: string[] = [];
  if (mode === "schools" || mode === "profile" || mode === "guided") {
    corpus.push(...readCsvSafe("schools.csv"));
    corpus.push(...readCsvSafe("sample-schools.csv"));
    corpus.push(...readCsvSafe("sample-programs.csv"));
  }
  if (mode === "housing") {
    corpus.push(...readCsvSafe("sample-programs.csv"));
  }
  const q = query.toLowerCase();
  const scored = corpus
    .filter(Boolean)
    .map((line) => ({ line, score: similarity(line.toLowerCase(), q) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((x) => x.line);
  return scored.join("\n");
}

function similarity(a: string, b: string): number {
  let s = 0;
  for (const t of b.split(/[^a-z0-9]+/g)) if (t && a.includes(t)) s += 1;
  return s;
}

async function loadSessionProfile(): Promise<ProfileInput & { name?: string | null } | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const row = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true } } },
  });
  if (!row) return null;

  return {
    name: row.user?.name,
    nationalityCode: row.nationalityCode,
    budgetMinMonthly: row.budgetMinMonthly,
    budgetMaxMonthly: row.budgetMaxMonthly,
    universityBudgetMin: row.universityBudgetMin,
    universityBudgetMax: row.universityBudgetMax,
    targetCountries: Array.isArray(row.targetCountries)
      ? (row.targetCountries as string[])
      : [],
    degreeLevels: Array.isArray(row.degreeLevels)
      ? (row.degreeLevels as string[])
      : [],
    cefrLevel: row.cefrLevel,
    desiredStart: row.desiredStart,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      messages: ChatMessage[];
      mode: string;
      rag?: boolean;
      step?: number;
    };

    const { messages, mode = "guided", rag = true, step = 1 } = body;
    const last = messages?.[messages.length - 1]?.content || "";
    const context = rag ? retrieve(mode, last) : "";

    const sessionProfile = await loadSessionProfile();
    const profile = sessionProfile ?? null;

    if (mode === "guided") {
      if (!profile || !isProfileComplete(profile)) {
        return NextResponse.json(
          { error: "Complete your profile before using AI guidance.", code: "PROFILE_INCOMPLETE" },
          { status: 403 }
        );
      }

      const clampedStep = Math.min(5, Math.max(1, step));
      const Groq = (await import("groq-sdk")).default;
      const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
      if (!client.apiKey) {
        return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 500 });
      }

      const profileBlock = formatProfileForAI(profile);
      const stepAddon = getStepSystemAddon(clampedStep);
      const ragBlock = context
        ? `Relevant program data (use only if it matches the question):\n${context}\n\n`
        : "";

      const system = `You are LARA, a study-abroad guide. Be concise and actionable.
${GUIDED_RESPONSE_JSON_SCHEMA}
${stepAddon}
Student profile:
${profileBlock}`;

      const response = await client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: system },
          { role: "user", content: ragBlock + last },
        ],
        max_tokens: 500,
        response_format: { type: "json_object" },
      });

      const raw = response.choices[0]?.message?.content || "";
      let structured = parseGuidedResponse(raw);
      if (!structured) {
        structured = {
          direction: raw.slice(0, 300) || "Here is a quick take based on your profile.",
          suggestions: [
            "Review your target countries",
            "Explore matched programs",
          ],
          nextStep: {
            label: clampedStep < 5 ? "Continue to next topic" : "Explore programs",
            href: clampedStep < 5 ? undefined : "/swipe",
          },
        };
      }

      if (clampedStep === 5 && !structured.nextStep.href) {
        structured.nextStep.href = "/swipe";
      }

      return NextResponse.json({
        mode: "guided",
        step: clampedStep,
        structured,
      });
    }

    const Groq = (await import("groq-sdk")).default;
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    if (!client.apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 500 });
    }

    const profilePrefix =
      profile && isProfileComplete(profile)
        ? `Student profile:\n${formatProfileForAI(profile)}\n\n`
        : "";

    const system =
      mode === "schools"
        ? "You are a counselor helping students find study programs by country, city, tuition, and deadlines. Answer with short lists and next steps."
        : mode === "cv"
          ? "You edit resumes. Return clear bullet points and Markdown sections."
          : mode === "housing"
            ? "You help find student housing near schools with rent ranges and links."
            : "You help improve a student profile for better matching.";

    const prefix = context
      ? `${profilePrefix}Here are some possibly relevant CSV rows (may be noisy):\n${context}\n\n`
      : profilePrefix;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prefix + last },
      ],
      max_tokens: 800,
    });
    const reply = response.choices[0]?.message?.content || "(no reply)";
    return NextResponse.json({ reply, mode });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
