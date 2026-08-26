"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import IntakeOptionCards from "@/components/IntakeOptionCards";
import ChatMarkdown from "@/components/chat/ChatMarkdown";
import CvUploadZone from "@/components/dashboard/CvUploadZone";
import IntakeProgressSteps from "@/components/IntakeProgressSteps";
import {
  getAssistantMessage,
  INTAKE_GOAL_OPTIONS,
  INTAKE_LOOKING_FORWARD_OPTIONS,
  type IntakeOption,
  type IntakePhase,
} from "@/lib/intake-flow";

type ChatMessage =
  | { role: "assistant"; content: string; phase: IntakePhase }
  | { role: "user"; content: string };

export default function IntakePage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [phase, setPhase] = useState<IntakePhase>("welcome");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [saved, setSaved] = useState({
    studyGoals: "",
    goalsDetail: "",
    backgroundStory: "",
    lookingForward: "",
  });
  const listRef = useRef<HTMLDivElement>(null);
  const booted = useRef(false);

  const displayName = session?.user?.name?.split(" ")[0] || "there";

  const appendAssistant = useCallback(
    (nextPhase: IntakePhase) => {
      setPhase(nextPhase);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: getAssistantMessage(nextPhase, displayName), phase: nextPhase },
      ]);
    },
    [displayName]
  );

  const appendUser = (content: string) => {
    setMessages((prev) => [...prev, { role: "user", content }]);
  };

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    fetch("/api/onboarding")
      .then((res) => res.json())
      .then((data) => {
        if (data.profileComplete) {
          router.replace("/profile");
        }
      })
      .catch(console.error)
      .finally(() => setCheckingProfile(false));
  }, [authStatus, router]);

  useEffect(() => {
    if (checkingProfile || booted.current || authStatus !== "authenticated") return;
    booted.current = true;
    appendAssistant("welcome");
  }, [checkingProfile, authStatus, appendAssistant]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, phase]);

  async function saveProfile(fields: Record<string, unknown>, markComplete = false) {
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, markIntakeComplete: markComplete, aiPromptStep: 1 }),
    });
  }

  async function handleGoalSelect(option: IntakeOption) {
    appendUser(option.label);
    const goals = option.value;
    setSaved((s) => ({ ...s, studyGoals: goals }));
    await saveProfile({ studyGoals: goals });
    appendAssistant("goals_detail");
  }

  async function handleGoalsDetailSubmit(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    appendUser(trimmed);
    const combined = saved.studyGoals
      ? `${saved.studyGoals}. ${trimmed}`
      : trimmed;
    setSaved((s) => ({ ...s, studyGoals: combined, goalsDetail: trimmed }));
    await saveProfile({ studyGoals: combined });
    setDraft("");
    appendAssistant("background");
  }

  async function handleBackgroundSubmit(text: string) {
    const trimmed = text.trim();
    if (!trimmed && !cvFileName) return;
    if (trimmed) {
      appendUser(trimmed);
      setSaved((s) => ({ ...s, backgroundStory: trimmed }));
      await saveProfile({ backgroundStory: trimmed });
    }
    setDraft("");
    appendAssistant("looking_forward");
  }

  async function handleCvUploaded(data: { cvFileName: string; warning?: string }) {
    setCvFileName(data.cvFileName);
    const note = data.warning ? `\n(${data.warning})` : "";
    appendUser(`📄 Uploaded CV: ${data.cvFileName}${note}`);
  }

  async function finishIntake(lookingForward: string) {
    await saveProfile(
      {
        studyGoals: saved.studyGoals,
        backgroundStory: saved.backgroundStory || undefined,
        lookingForward,
      },
      true
    );
    appendAssistant("complete");
    window.setTimeout(() => router.replace("/profile?welcome=1"), 1200);
  }

  async function handleLookingForwardSelect(option: IntakeOption) {
    appendUser(option.label);
    setSaved((s) => ({ ...s, lookingForward: option.value }));
    await finishIntake(option.value);
  }

  async function handleLookingForwardText(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    appendUser(trimmed);
    setSaved((s) => ({ ...s, lookingForward: trimmed }));
    setDraft("");
    await finishIntake(trimmed);
  }

  if (authStatus === "loading" || checkingProfile) {
    return (
      <div className="flex justify-center py-28">
        <div
          className="w-10 h-10 border-2 rounded-full animate-spin"
          style={{ borderColor: "var(--hairline-strong)", borderTopColor: "var(--ink)" }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 animate-fade-in">
      <div className="mb-6">
        <IntakeProgressSteps activeStep={3} />
      </div>

      <div className="mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
          Tell LARA about you
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
          A quick conversation — add budgets and details later in your dashboard.
        </p>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--hairline)", background: "var(--surface-warm)" }}
      >
        <div ref={listRef} className="h-[520px] overflow-auto p-5 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user" ? "max-w-[92%] whitespace-pre-wrap" : "max-w-full"
                }`}
                style={
                  m.role === "user"
                    ? { background: "var(--ink)", color: "#fff", borderBottomRightRadius: 6 }
                    : {
                        background: "var(--surface)",
                        border: "1px solid var(--hairline)",
                        color: "var(--ink)",
                        borderBottomLeftRadius: 6,
                      }
                }
              >
                {m.role === "assistant" ? <ChatMarkdown content={m.content} /> : m.content}
              </div>
            </div>
          ))}

          {/* Interactive area for current phase */}
          {phase === "welcome" && messages.length > 0 && (
            <IntakeOptionCards options={INTAKE_GOAL_OPTIONS} onSelect={handleGoalSelect} disabled={loading} />
          )}

          {phase === "background" && (
            <div className="flex justify-start pl-1">
              <div
                className="max-w-[92%] w-full px-4 py-3 rounded-2xl"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--hairline)",
                  borderBottomLeftRadius: 6,
                }}
              >
                <CvUploadZone cvFileName={cvFileName} compact onUploaded={handleCvUploaded} />
              </div>
            </div>
          )}

          {phase === "looking_forward" && (
            <IntakeOptionCards
              options={INTAKE_LOOKING_FORWARD_OPTIONS}
              onSelect={handleLookingForwardSelect}
              disabled={loading}
            />
          )}

          {phase === "complete" && (
            <div className="flex flex-col items-center gap-3 pt-2 text-center">
              <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
                Taking you to your dashboard…
              </p>
              <Link href="/profile?welcome=1" className="btn-primary text-sm !py-2.5">
                Go to dashboard now →
              </Link>
            </div>
          )}
        </div>

        {/* Composer — hidden on complete and welcome (options only) */}
        {phase !== "complete" && phase !== "welcome" && (
          <div className="p-4 space-y-2" style={{ borderTop: "1px solid var(--hairline)" }}>
            {phase === "background" && cvFileName && (
              <button
                type="button"
                onClick={() => appendAssistant("looking_forward")}
                className="btn-accent w-full text-sm !py-2.5"
              >
                Continue with CV only →
              </button>
            )}
            <div className="flex gap-2.5">
              <textarea
                rows={2}
                className="input-field flex-1 resize-none !py-2.5 text-sm"
                placeholder={
                  phase === "goals_detail"
                    ? "e.g. Data science in Spain or Germany, starting next year…"
                    : phase === "background"
                      ? "Describe your education, jobs, skills…"
                      : "Or type what excites you most…"
                }
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (phase === "goals_detail") handleGoalsDetailSubmit(draft);
                    else if (phase === "background") handleBackgroundSubmit(draft);
                    else if (phase === "looking_forward") handleLookingForwardText(draft);
                  }
                }}
              />
              <button
                type="button"
                className="btn-primary !px-4 text-sm self-end disabled:opacity-40"
                disabled={!draft.trim() && phase !== "background"}
                onClick={() => {
                  if (phase === "goals_detail") handleGoalsDetailSubmit(draft);
                  else if (phase === "background") handleBackgroundSubmit(draft);
                  else if (phase === "looking_forward") handleLookingForwardText(draft);
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}

        {phase === "welcome" && (
          <div className="p-4" style={{ borderTop: "1px solid var(--hairline)" }}>
            <div className="flex gap-2.5">
              <textarea
                rows={1}
                className="input-field flex-1 resize-none !py-2.5 text-sm"
                placeholder="Or describe what you're looking for…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const t = draft.trim();
                    if (!t) return;
                    appendUser(t);
                    setSaved((s) => ({ ...s, studyGoals: t }));
                    saveProfile({ studyGoals: t });
                    setDraft("");
                    appendAssistant("goals_detail");
                  }
                }}
              />
              <button
                type="button"
                className="btn-primary !px-4 text-sm self-end disabled:opacity-40"
                disabled={!draft.trim()}
                onClick={() => {
                  const t = draft.trim();
                  if (!t) return;
                  appendUser(t);
                  setSaved((s) => ({ ...s, studyGoals: t }));
                  saveProfile({ studyGoals: t });
                  setDraft("");
                  appendAssistant("goals_detail");
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs mt-4" style={{ color: "var(--ink-faint)" }}>
        Budget, countries & deadlines — add anytime in{" "}
        <Link href="/profile" className="underline">
          your dashboard
        </Link>
      </p>
    </div>
  );
}
