import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  GUIDED_RESPONSE_JSON_SCHEMA,
  parseGuidedResponse,
} from "@/lib/guided-chat";
import { getStepSystemAddon } from "@/lib/sprint1-flow";
import { buildContext } from "@/lib/knowledge";
import { isStepLocked } from "@/lib/subscription";
import {
  formatProfileForAI,
  isProfileComplete,
  type ProfileInput,
} from "@/lib/user-profile";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

type SessionProfile = (ProfileInput & {
  name?: string | null;
  subscriptionStatus?: string | null;
}) | null;

async function loadSessionProfile(): Promise<SessionProfile> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const row = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true } } },
  });
  if (!row) return null;

  return {
    name: row.user?.name,
    subscriptionStatus: row.subscriptionStatus,
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
      mode?: string;
      step?: number;
    };

    const { messages, mode = "guided", step = 1 } = body;
    const last = messages?.[messages.length - 1]?.content || "";

    const profile = await loadSessionProfile();

    // --- Public appetizer chat: no auth, no profile required ---
    if (mode === "public") {
      const Groq = (await import("groq-sdk")).default;
      const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
      if (!client.apiKey) {
        return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 500 });
      }

      const { partner, web, hasPartner } = await buildContext(last);
      const contextBlock = [
        partner ? `PARTNER PROGRAM DATABASE (prefer these, name them):\n${partner}` : "",
        web ? `WEB RESULTS (general, verify):\n${web}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const system = `You are LARA, a warm, knowledgeable study-abroad assistant for LARA EdTech (Filipinas Abroad). You answer general questions about studying abroad: costs, scholarships, tuition, visas, timelines, and the overall process.

Style:
- Be concise and friendly. Short paragraphs or tight bullet lists.
- Give realistic ranges and steps, not walls of text.
- When LARA partner programs are relevant, mention them by name from the partner database.
- Never invent exact tuition, deadlines, or URLs that are not in the provided data; give general ranges and say they vary.
- End with a short, natural nudge to create a free profile for a personalized plan, but only when it fits.
${hasPartner ? "Partner matches were found; reference them." : "No specific partner match; give general guidance."}

${contextBlock}`;

      const history = messages.slice(-6).map((m) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.content,
      }));

      const response = await client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "system", content: system }, ...history],
        max_tokens: 600,
      });

      const reply = response.choices[0]?.message?.content || "(no reply)";
      return NextResponse.json({ reply, mode: "public", usedPartnerData: hasPartner });
    }

    if (mode === "guided") {
      if (!profile || !isProfileComplete(profile)) {
        return NextResponse.json(
          {
            error: "Complete your profile before using AI guidance.",
            code: "PROFILE_INCOMPLETE",
          },
          { status: 403 }
        );
      }

      const clampedStep = Math.min(5, Math.max(1, step));

      // Paywall: the eligibility report (step 5) is premium-only.
      if (isStepLocked(clampedStep, profile.subscriptionStatus)) {
        return NextResponse.json({
          mode: "guided",
          step: clampedStep,
          locked: true,
          teaser:
            "Your full eligibility report compares your profile against every matched partner program, scores your readiness, and lists exactly what to fix before applying.",
        });
      }

      const Groq = (await import("groq-sdk")).default;
      const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
      if (!client.apiKey) {
        return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 500 });
      }

      const { partner, web, hasPartner } = await buildContext(
        `${last} ${(profile.targetCountries ?? []).join(" ")} ${(profile.degreeLevels ?? []).join(" ")}`
      );

      const contextBlock = [
        partner ? `PARTNER SCHOOL DATABASE (authoritative, prefer these):\n${partner}` : "",
        web ? `WEB RESULTS (general, not partner schools, verify before relying):\n${web}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const sourceRule = hasPartner
        ? "Base program/school specifics on the PARTNER SCHOOL DATABASE. Name the partner schools when relevant."
        : "No partner match was found for this query. Give general guidance and clearly note these are not partner schools yet.";

      const system = `You are LARA, a study-abroad guide. Be concise, warm, and actionable.
${GUIDED_RESPONSE_JSON_SCHEMA}
${getStepSystemAddon(clampedStep)}
${sourceRule}
Never invent tuition, deadlines, or URLs that are not in the provided data.

Student profile:
${formatProfileForAI(profile)}`;

      const userContent = contextBlock ? `${contextBlock}\n\nQuestion: ${last}` : last;

      const response = await client.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userContent },
        ],
        max_tokens: 600,
        response_format: { type: "json_object" },
      });

      const raw = response.choices[0]?.message?.content || "";
      let structured = parseGuidedResponse(raw);
      if (!structured) {
        structured = {
          direction:
            raw.slice(0, 300) || "Here is a quick take based on your profile.",
          suggestions: ["Review your target countries", "Explore matched programs"],
          nextStep: { label: "Continue" },
        };
      }

      return NextResponse.json({
        mode: "guided",
        step: clampedStep,
        structured,
        usedPartnerData: hasPartner,
      });
    }

    // --- Legacy free-form modes (schools / cv / housing / profile) ---
    const Groq = (await import("groq-sdk")).default;
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    if (!client.apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 500 });
    }

    const { partner } = await buildContext(last);
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

    const prefix = partner
      ? `${profilePrefix}Partner data (may be noisy):\n${partner}\n\n`
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
