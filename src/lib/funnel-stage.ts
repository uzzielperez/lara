import { canAccessGuidedAI, type ProfileInput } from "@/lib/user-profile";

/** Freemium funnel label for staff pipeline views. */
export function deriveFreemiumStage(
  profile: ProfileInput & {
    chatUsesCount?: number;
    subscriptionStatus?: string | null;
    applicationCount?: number;
  }
): string {
  if (profile.subscriptionStatus === "PREMIUM") return "Premium";
  if ((profile.applicationCount ?? 0) > 0) return "Tracking apps";
  if ((profile.chatUsesCount ?? 0) >= 5) return "Eligibility / report";
  if (canAccessGuidedAI(profile)) return "Guided AI";
  if (profile.intakeCompletedAt) return "Intake done";
  return "Needs profile";
}

export function deriveNextFunnelAction(
  profile: ProfileInput & {
    chatUsesCount?: number;
    subscriptionStatus?: string | null;
    applicationCount?: number;
  }
): string {
  const stage = deriveFreemiumStage(profile);
  switch (stage) {
    case "Premium":
      return "Support pathway";
    case "Tracking apps":
      return "Review applications";
    case "Eligibility / report":
      return "Nudge upgrade / programs";
    case "Guided AI":
      return "Continue LARA Guide";
    case "Intake done":
      return "Start guided chat";
    default:
      return "Complete intake";
  }
}
