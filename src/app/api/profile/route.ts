import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
  canAccessGuidedAI,
  getProfileCompletionPercent,
  isProfileComplete,
  shortlistMatchFieldsChanged,
  type ProfileInput,
} from "@/lib/user-profile";

function toProfileInput(
  row: {
    nationalityCode: string | null;
    budgetMinMonthly: number | null;
    budgetMaxMonthly: number | null;
    universityBudgetMin: number | null;
    universityBudgetMax: number | null;
    targetCountries: unknown;
    degreeLevels: unknown;
    cefrLevel: string | null;
    desiredStart: Date | null;
    studyGoals?: string | null;
    backgroundStory?: string | null;
    lookingForward?: string | null;
    cvText?: string | null;
    cvFileName?: string | null;
    intakeCompletedAt?: Date | null;
  },
  name?: string | null
): ProfileInput & { name?: string | null } {
  return {
    name,
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
    studyGoals: row.studyGoals,
    backgroundStory: row.backgroundStory,
    lookingForward: row.lookingForward,
    cvText: row.cvText,
    cvFileName: row.cvFileName,
    intakeCompletedAt: row.intakeCompletedAt,
  };
}

// GET: Fetch user profile + completeness
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!userProfile) {
      return NextResponse.json({
        profile: null,
        complete: false,
        intakeComplete: false,
        matchingReady: false,
        completionPercent: 0,
        aiPromptStep: 1,
        shortlistNeedsRefresh: false,
      });
    }

    const input = toProfileInput(userProfile, userProfile.user?.name);

    return NextResponse.json({
      profile: userProfile,
      complete: canAccessGuidedAI(input),
      intakeComplete: canAccessGuidedAI(input),
      matchingReady: isProfileComplete(input),
      completionPercent: getProfileCompletionPercent(input),
      aiPromptStep: userProfile.aiPromptStep ?? 1,
      shortlistNeedsRefresh: userProfile.shortlistNeedsRefresh ?? false,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Update user profile data
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      nationalityCode,
      budgetMinMonthly,
      budgetMaxMonthly,
      universityBudgetMin,
      universityBudgetMax,
      targetCountries,
      degreeLevels,
      cefrLevel,
      desiredStart,
      aiPromptStep,
      markIntakeComplete,
      clearShortlistNeedsRefresh,
      studyGoals,
      backgroundStory,
      lookingForward,
      cvText,
      cvFileName,
    } = body;

    const countries = Array.isArray(targetCountries)
      ? targetCountries.slice(0, 3)
      : undefined;

    const existing = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    const existingInput: ProfileInput = existing
      ? toProfileInput(existing)
      : {};

    const pendingInput: ProfileInput = {
      nationalityCode:
        nationalityCode !== undefined ? nationalityCode : existingInput.nationalityCode,
      budgetMinMonthly:
        budgetMinMonthly != null
          ? parseInt(String(budgetMinMonthly), 10)
          : existingInput.budgetMinMonthly,
      budgetMaxMonthly:
        budgetMaxMonthly != null
          ? parseInt(String(budgetMaxMonthly), 10)
          : existingInput.budgetMaxMonthly,
      universityBudgetMin:
        universityBudgetMin != null
          ? parseInt(String(universityBudgetMin), 10)
          : existingInput.universityBudgetMin,
      universityBudgetMax:
        universityBudgetMax != null
          ? parseInt(String(universityBudgetMax), 10)
          : existingInput.universityBudgetMax,
      targetCountries: countries ?? existingInput.targetCountries,
      degreeLevels: degreeLevels ?? existingInput.degreeLevels,
      cefrLevel: cefrLevel !== undefined ? cefrLevel : existingInput.cefrLevel,
      desiredStart:
        desiredStart !== undefined
          ? desiredStart
            ? new Date(desiredStart)
            : null
          : existingInput.desiredStart,
    };

    const shouldRefreshShortlist =
      existing != null &&
      shortlistMatchFieldsChanged(existingInput, {
        nationalityCode,
        budgetMinMonthly:
          budgetMinMonthly != null ? parseInt(String(budgetMinMonthly), 10) : undefined,
        budgetMaxMonthly:
          budgetMaxMonthly != null ? parseInt(String(budgetMaxMonthly), 10) : undefined,
        universityBudgetMin:
          universityBudgetMin != null
            ? parseInt(String(universityBudgetMin), 10)
            : undefined,
        universityBudgetMax:
          universityBudgetMax != null
            ? parseInt(String(universityBudgetMax), 10)
            : undefined,
        targetCountries: countries,
        degreeLevels,
        cefrLevel,
        desiredStart: desiredStart !== undefined ? pendingInput.desiredStart : undefined,
      });

    const userProfile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        nationalityCode,
        budgetMinMonthly:
          budgetMinMonthly != null ? parseInt(String(budgetMinMonthly), 10) : undefined,
        budgetMaxMonthly:
          budgetMaxMonthly != null ? parseInt(String(budgetMaxMonthly), 10) : undefined,
        universityBudgetMin:
          universityBudgetMin != null
            ? parseInt(String(universityBudgetMin), 10)
            : undefined,
        universityBudgetMax:
          universityBudgetMax != null
            ? parseInt(String(universityBudgetMax), 10)
            : undefined,
        targetCountries: countries,
        degreeLevels,
        cefrLevel,
        desiredStart: desiredStart ? new Date(desiredStart) : undefined,
        aiPromptStep:
          typeof aiPromptStep === "number"
            ? Math.min(5, Math.max(1, aiPromptStep))
            : undefined,
        intakeCompletedAt: markIntakeComplete ? new Date() : undefined,
        shortlistNeedsRefresh: clearShortlistNeedsRefresh
          ? false
          : shouldRefreshShortlist
            ? true
            : undefined,
        studyGoals: studyGoals !== undefined ? studyGoals : undefined,
        backgroundStory: backgroundStory !== undefined ? backgroundStory : undefined,
        lookingForward: lookingForward !== undefined ? lookingForward : undefined,
        cvText: cvText !== undefined ? cvText : undefined,
        cvFileName: cvFileName !== undefined ? cvFileName : undefined,
      },
      create: {
        userId: session.user.id,
        nationalityCode: nationalityCode ?? null,
        budgetMinMonthly:
          budgetMinMonthly != null ? parseInt(String(budgetMinMonthly), 10) : null,
        budgetMaxMonthly:
          budgetMaxMonthly != null ? parseInt(String(budgetMaxMonthly), 10) : null,
        universityBudgetMin:
          universityBudgetMin != null
            ? parseInt(String(universityBudgetMin), 10)
            : null,
        universityBudgetMax:
          universityBudgetMax != null
            ? parseInt(String(universityBudgetMax), 10)
            : null,
        targetCountries: countries ?? [],
        degreeLevels: degreeLevels ?? [],
        cefrLevel: cefrLevel ?? null,
        desiredStart: desiredStart ? new Date(desiredStart) : null,
        aiPromptStep: typeof aiPromptStep === "number" ? aiPromptStep : 1,
        intakeCompletedAt: markIntakeComplete ? new Date() : null,
        shortlistNeedsRefresh: false,
        studyGoals: studyGoals ?? null,
        backgroundStory: backgroundStory ?? null,
        lookingForward: lookingForward ?? null,
        cvText: cvText ?? null,
        cvFileName: cvFileName ?? null,
      },
    });

    const input = toProfileInput(userProfile, session.user.name);

    return NextResponse.json({
      profile: userProfile,
      complete: canAccessGuidedAI(input),
      intakeComplete: canAccessGuidedAI(input),
      matchingReady: isProfileComplete(input),
      completionPercent: getProfileCompletionPercent(input),
      aiPromptStep: userProfile.aiPromptStep,
      shortlistNeedsRefresh: userProfile.shortlistNeedsRefresh ?? false,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
