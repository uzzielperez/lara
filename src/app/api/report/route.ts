import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { buildContext } from "@/lib/knowledge";
import { isPremium } from "@/lib/subscription";
import {
  formatProfileForAI,
  isProfileComplete,
  type ProfileInput,
} from "@/lib/user-profile";

export const runtime = "nodejs";

const REPORT_SCHEMA = `Respond with ONLY valid JSON:
{
  "summary": "2-3 sentence personalized overview",
  "countries": [{ "name": "Country", "why": "one line" }],
  "programs": [{ "school": "", "program": "", "country": "", "note": "tuition/deadline if known" }],
  "requirements": ["doc or test", "..."],
  "eligibility": { "score": 0-100, "strengths": ["..."], "gaps": ["..."] },
  "nextActions": ["concrete step", "..."]
}
Use only the partner data and profile provided. Never invent tuition, deadlines, or URLs.`;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const row = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { name: true } } },
    });

    if (!isPremium(row?.subscriptionStatus)) {
      return NextResponse.json({ error: "Premium required", code: "LOCKED" }, { status: 402 });
    }

    const profile: ProfileInput & { name?: string | null } = {
      name: row?.user?.name,
      nationalityCode: row?.nationalityCode,
      budgetMinMonthly: row?.budgetMinMonthly,
      budgetMaxMonthly: row?.budgetMaxMonthly,
      universityBudgetMin: row?.universityBudgetMin,
      universityBudgetMax: row?.universityBudgetMax,
      targetCountries: Array.isArray(row?.targetCountries)
        ? (row?.targetCountries as string[])
        : [],
      degreeLevels: Array.isArray(row?.degreeLevels)
        ? (row?.degreeLevels as string[])
        : [],
      cefrLevel: row?.cefrLevel,
      desiredStart: row?.desiredStart,
    };

    if (!isProfileComplete(profile)) {
      return NextResponse.json({ error: "Profile incomplete", code: "PROFILE_INCOMPLETE" }, { status: 403 });
    }

    const Groq = (await import("groq-sdk")).default;
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    if (!client.apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 500 });
    }

    const { partner } = await buildContext(
      `${(profile.targetCountries ?? []).join(" ")} ${(profile.degreeLevels ?? []).join(" ")} programs admission`
    );

    const system = `You are LARA, generating a final eligibility report.
${REPORT_SCHEMA}

Partner school database:
${partner || "(no direct matches; give general, clearly non-partner guidance)"}

Student profile:
${formatProfileForAI(profile)}`;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: system },
        { role: "user", content: "Generate my full eligibility report." },
      ],
      max_tokens: 1200,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content || "{}";
    let report: unknown;
    try {
      report = JSON.parse(raw);
    } catch {
      report = null;
    }

    return NextResponse.json({
      report,
      generatedAt: new Date().toISOString(),
      name: profile.name ?? null,
    });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
