"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardChatPanel from "@/components/dashboard/DashboardChatPanel";
import DashboardProfilePanel, {
  type DashboardProfileData,
} from "@/components/dashboard/DashboardProfilePanel";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

const EMPTY: DashboardProfileData = {
  nationalityCode: "",
  targetCountries: [],
  degreeLevels: [],
  cefrLevel: "B2",
  rentBudgetMin: 500,
  rentBudgetMax: 1200,
  universityBudgetMin: 0,
  universityBudgetMax: 20000,
  desiredStart: "",
  studyGoals: "",
  backgroundStory: "",
  lookingForward: "",
  cvFileName: "",
  matchingReady: false,
};

export default function ProfileDashboardPage() {
  const router = useRouter();
  const { status: authStatus } = useSession();
  const [profile, setProfile] = useState<DashboardProfileData>(EMPTY);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [chatUsesCount, setChatUsesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/auth/signin?callbackUrl=/profile");
      return;
    }
    if (authStatus !== "authenticated") return;

    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          const p = data.profile;
          setProfile({
            nationalityCode: p.nationalityCode || "",
            targetCountries: (p.targetCountries || []).slice(0, 3),
            degreeLevels: p.degreeLevels || [],
            cefrLevel: p.cefrLevel || "B2",
            rentBudgetMin: p.budgetMinMonthly ?? 500,
            rentBudgetMax: p.budgetMaxMonthly ?? 1200,
            universityBudgetMin: p.universityBudgetMin ?? 0,
            universityBudgetMax: p.universityBudgetMax ?? 20000,
            desiredStart: p.desiredStart ? p.desiredStart.split("T")[0] : "",
            studyGoals: p.studyGoals || "",
            backgroundStory: p.backgroundStory || "",
            lookingForward: p.lookingForward || "",
            cvFileName: p.cvFileName || "",
            matchingReady: data.matchingReady ?? false,
          });
          setCompletionPercent(data.completionPercent ?? 0);
          setSubscriptionStatus(p.subscriptionStatus ?? null);
          setChatUsesCount(data.chatUsesCount ?? 0);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authStatus, router]);

  const saveProfile = useCallback(async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nationalityCode: profile.nationalityCode,
          budgetMinMonthly: profile.rentBudgetMin,
          budgetMaxMonthly: profile.rentBudgetMax,
          universityBudgetMin: profile.universityBudgetMin,
          universityBudgetMax: profile.universityBudgetMax,
          targetCountries: profile.targetCountries,
          degreeLevels: profile.degreeLevels,
          cefrLevel: profile.cefrLevel,
          desiredStart: profile.desiredStart || undefined,
          studyGoals: profile.studyGoals,
          backgroundStory: profile.backgroundStory,
          lookingForward: profile.lookingForward,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setCompletionPercent(data.completionPercent ?? completionPercent);
      setProfile((prev) => ({ ...prev, matchingReady: data.matchingReady ?? prev.matchingReady }));
      setSaveMessage("Profile saved");
      setTimeout(() => setSaveMessage(null), 2500);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  }, [profile, completionPercent]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div
          className="w-10 h-10 border-2 rounded-full animate-spin"
          style={{ borderColor: "var(--hairline-strong)", borderTopColor: "var(--ink)" }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full max-w-[1600px] mx-auto">
      <DashboardSidebar
        completionPercent={completionPercent}
        subscriptionStatus={subscriptionStatus}
      />
      <div className="flex-1 flex min-w-0">
        <div className="flex-1 min-w-0">
          <DashboardChatPanel
            studyGoals={profile.studyGoals}
            subscriptionStatus={subscriptionStatus}
            chatUsesCount={chatUsesCount}
            onChatUsesChange={setChatUsesCount}
          />
        </div>
        <DashboardProfilePanel
          profile={profile}
          onProfileChange={(patch) => setProfile((prev) => ({ ...prev, ...patch }))}
          onSave={saveProfile}
          saving={saving}
          saveMessage={saveMessage}
        />
      </div>
    </div>
  );
}
