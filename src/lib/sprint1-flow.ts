/** Sprint 1 — Personalization & AI Core: routes, labels, and flow logic. */

import { isProfileComplete, type ProfileInput } from "@/lib/user-profile";

export const SPRINT1_FLOW = [
  { id: 1, key: "land", label: "Land on LARA", shortLabel: "Discover", route: "/" },
  { id: 2, key: "auth", label: "Sign up / Log in", shortLabel: "Account", route: "/auth/signin" },
  { id: 3, key: "profile", label: "Profile creation", shortLabel: "Profile", route: "/intake" },
  { id: 4, key: "prompt1", label: "General study", shortLabel: "Study", route: "/chat", promptStep: 1 },
  { id: 5, key: "prompt2", label: "Country suggestions", shortLabel: "Countries", route: "/chat", promptStep: 2 },
  { id: 6, key: "prompt3", label: "Program recommendations", shortLabel: "Programs", route: "/chat", promptStep: 3 },
  { id: 7, key: "prompt4", label: "Admission requirements", shortLabel: "Requirements", route: "/chat", promptStep: 4 },
  { id: 8, key: "prompt5", label: "Eligibility + Paywall", shortLabel: "Eligibility", route: "/chat", promptStep: 5 },
] as const;

export const AI_PROMPT_STEPS = SPRINT1_FLOW.filter(
  (s): s is (typeof SPRINT1_FLOW)[number] & { promptStep: number } =>
    "promptStep" in s && typeof s.promptStep === "number"
).map((s) => ({
  id: s.promptStep!,
  key: s.key,
  label: s.label,
  shortLabel: s.shortLabel,
  description:
    s.promptStep === 1
      ? "Personalized overview of your study-abroad path"
      : s.promptStep === 2
        ? "Compare and prioritize your target countries"
        : s.promptStep === 3
          ? "Program types and matches for your profile"
          : s.promptStep === 4
            ? "Documents, deadlines, and language tests"
            : "Eligibility strengths, gaps, and next actions",
}));

export const SIGNIN_CALLBACK = "/intake";

export function signInUrl(callbackPath: string = SIGNIN_CALLBACK): string {
  return `/auth/signin?callbackUrl=${encodeURIComponent(callbackPath)}`;
}

export type OnboardingState = {
  authenticated: boolean;
  profileComplete: boolean;
  aiPromptStep: number;
  nextRoute: string;
  flowStep: number;
};

export function resolveOnboardingState(
  authenticated: boolean,
  profile: ProfileInput | null | undefined,
  aiPromptStep = 1
): OnboardingState {
  if (!authenticated) {
    return {
      authenticated: false,
      profileComplete: false,
      aiPromptStep: 1,
      nextRoute: signInUrl(SIGNIN_CALLBACK),
      flowStep: 2,
    };
  }

  const profileComplete = profile ? isProfileComplete(profile) : false;

  if (!profileComplete) {
    return {
      authenticated: true,
      profileComplete: false,
      aiPromptStep: 1,
      nextRoute: "/intake",
      flowStep: 3,
    };
  }

  const step = Math.min(5, Math.max(1, aiPromptStep));
  return {
    authenticated: true,
    profileComplete: true,
    aiPromptStep: step,
    nextRoute: "/chat",
    flowStep: 3 + step,
  };
}

export function getStepSystemAddon(step: number): string {
  const meta = AI_PROMPT_STEPS[step - 1];
  if (!meta) return "";
  const addons: Record<string, string> = {
    prompt1:
      "Focus on a concise, personalized overview of their study-abroad journey and immediate priorities.",
    prompt2:
      "Focus on comparing their target countries and which fits their budget, language level, and timeline.",
    prompt3:
      "Focus on program types and search strategy; suggest Program Discovery when relevant.",
    prompt4:
      "Focus on documents, deadlines, and language tests they likely need.",
    prompt5:
      "Focus on eligibility strengths and gaps; be honest about gaps without being discouraging.",
  };
  return `Current guided stage (${step}/5): ${meta.label} — ${meta.description}. ${addons[meta.key] ?? ""}`;
}
