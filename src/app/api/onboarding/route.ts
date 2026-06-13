import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { resolveOnboardingState } from "@/lib/sprint1-flow";
import type { ProfileInput } from "@/lib/user-profile";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(resolveOnboardingState(false, null));
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    const input: ProfileInput | null = profile
      ? {
          nationalityCode: profile.nationalityCode,
          budgetMinMonthly: profile.budgetMinMonthly,
          budgetMaxMonthly: profile.budgetMaxMonthly,
          universityBudgetMin: profile.universityBudgetMin,
          universityBudgetMax: profile.universityBudgetMax,
          targetCountries: Array.isArray(profile.targetCountries)
            ? (profile.targetCountries as string[])
            : [],
          degreeLevels: Array.isArray(profile.degreeLevels)
            ? (profile.degreeLevels as string[])
            : [],
          cefrLevel: profile.cefrLevel,
          desiredStart: profile.desiredStart,
        }
      : null;

    return NextResponse.json(
      resolveOnboardingState(true, input, profile?.aiPromptStep ?? 1)
    );
  } catch (error) {
    console.error("Onboarding status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
