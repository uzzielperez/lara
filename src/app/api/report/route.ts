import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { groqComplete } from "@/lib/groq";
import { buildContext, summarizePartnerHits } from "@/lib/knowledge";
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

    const { partner } = await buildContext(
      `${(profile.targetCountries ?? []).join(" ")} ${(profile.degreeLevels ?? []).join(" ")} programs admission`
    );

    const system = `You are LARA, generating a final eligibility report.
${REPORT_SCHEMA}

Partner school database:
${partner || "(no direct matches; give general, clearly non-partner guidance)"}

Student profile:
${formatProfileForAI(profile)}`;

    const llm = await groqComplete({
      messages: [
        { role: "system", content: system },
        { role: "user", content: "Generate my full eligibility report." },
      ],
      maxTokens: 1200,
      json: true,
    });

    let report: unknown = null;
    if (llm?.text) {
      try {
        report = JSON.parse(llm.text);
      } catch {
        report = null;
      }
    }
    if (!report) {
      const hits = summarizePartnerHits(partner, 5);
      report = {
        summary: hits.length
          ? "This draft report is built from LARA's partner knowledge base because the AI model was unavailable. Verify tuition and deadlines on each school site."
          : "The AI model was unavailable and no close partner matches were found. Browse programs and retry shortly.",
        countries: (profile.targetCountries ?? []).slice(0, 5).map((name) => ({
          name,
          why: "Listed in your profile as a target country.",
        })),
        programs: hits.map((note) => ({
          school: note.replace(/\*\*/g, ""),
          program: "",
          country: "",
          note: "From partner knowledge base",
        })),
        requirements: [
          "Passport and academic transcripts",
          "Language proof (CEFR / IELTS / TOEFL as required)",
          "Confirm application deadlines on the school website",
        ],
        eligibility: {
          score: null,
          strengths: profile.cefrLevel ? [`Language level on file: ${profile.cefrLevel}`] : [],
          gaps: ["Full scored eligibility needs the AI model — retry in a moment or talk to a coach."],
        },
        nextActions: [
          "Browse matched programs",
          "Verify deadlines and tuition on official school pages",
          "Retry this report once the AI model is back",
        ],
        fromKnowledgeBase: true,
      };
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
