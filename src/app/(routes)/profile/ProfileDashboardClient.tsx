"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardChatPanel from "@/components/dashboard/DashboardChatPanel";
import DashboardProfilePanel, {
  type DashboardProfileData,
} from "@/components/dashboard/DashboardProfilePanel";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardWelcomeBanner from "@/components/dashboard/DashboardWelcomeBanner";
import {
  chatPromptsRemaining,
  FREE_CHAT_PROMPTS,
  hasPremiumCoaching,
} from "@/lib/subscription";

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

export default function ProfileDashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status: authStatus } = useSession();
  const [showWelcome, setShowWelcome] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [profile, setProfile] = useState<DashboardProfileData>(EMPTY);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [chatUsesCount, setChatUsesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      setLeftOpen(mq.matches);
      setRightOpen(mq.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

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

  useEffect(() => {
    if (searchParams.get("welcome") === "1") {
      setShowWelcome(true);
      router.replace("/profile", { scroll: false });
    }
    if (searchParams.get("panel") === "profile") {
      setRightOpen(true);
    }
  }, [searchParams, router]);

  const dismissWelcome = useCallback(() => setShowWelcome(false), []);

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

  const premium = hasPremiumCoaching(subscriptionStatus);
  const remaining = chatPromptsRemaining(chatUsesCount, subscriptionStatus);

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
    <div className="flex h-full w-full">
      <DashboardSidebar
        completionPercent={completionPercent}
        subscriptionStatus={subscriptionStatus}
        collapsed={!leftOpen}
        onToggle={() => setLeftOpen((v) => !v)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="shrink-0 flex items-center justify-between gap-3 px-3 py-2 border-b"
          style={{ borderColor: "var(--hairline)", background: "var(--surface)" }}
        >
          <div className="flex items-center gap-2">
            {!leftOpen && (
              <button
                type="button"
                onClick={() => setLeftOpen(true)}
                className="w-8 h-8 rounded-lg text-sm"
                style={{ color: "var(--ink-soft)" }}
                title="Open menu"
              >
                ☰
              </button>
            )}
            <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
              LARA
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!premium && (
              <span className="text-xs hidden sm:inline" style={{ color: "var(--ink-faint)" }}>
                {remaining === null
                  ? "Premium"
                  : remaining === 0
                    ? "No prompts left"
                    : `${remaining}/${FREE_CHAT_PROMPTS} free`}
              </span>
            )}
            <button
              type="button"
              onClick={() => setRightOpen((v) => !v)}
              className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{
                background: rightOpen ? "rgba(199,93,58,0.1)" : "var(--surface-warm)",
                border: "1px solid var(--hairline)",
                color: "var(--ink-soft)",
              }}
            >
              {rightOpen ? "Hide profile" : "Profile & docs"}
            </button>
          </div>
        </header>

        {showWelcome && (
          <div className="shrink-0 max-w-2xl mx-auto w-full px-4 pt-4">
            <DashboardWelcomeBanner onDismiss={dismissWelcome} />
          </div>
        )}

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 min-w-0 flex flex-col">
            <DashboardChatPanel
              studyGoals={profile.studyGoals}
              subscriptionStatus={subscriptionStatus}
              chatUsesCount={chatUsesCount}
              onChatUsesChange={setChatUsesCount}
            />
          </div>

          {rightOpen && (
            <DashboardProfilePanel
              profile={profile}
              onProfileChange={(patch) => setProfile((prev) => ({ ...prev, ...patch }))}
              onSave={saveProfile}
              saving={saving}
              saveMessage={saveMessage}
              onClose={() => setRightOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
