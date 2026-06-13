"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import PaywallCard from "@/components/PaywallCard";
import type { GuidedChatResponse } from "@/lib/guided-chat";
import { AI_PROMPT_STEPS } from "@/lib/sprint1-flow";

type ChatMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; structured?: GuidedChatResponse }
  | { role: "paywall"; content: string; teaser?: string };

const STEP_STARTERS: Record<number, string> = {
  1: "Give me a personalized general study overview for my situation.",
  2: "Which target countries should I prioritize and why?",
  3: "What program recommendations fit my profile?",
  4: "What admission requirements should I prepare?",
  5: "How eligible am I? What gaps should I improve?",
};

function StructuredReply({ data }: { data: GuidedChatResponse }) {
  return (
    <div className="space-y-3 text-sm">
      <p className="leading-relaxed" style={{ color: "var(--ink)" }}>{data.direction}</p>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--ink-faint)" }}>
          Paths to consider
        </p>
        <ul className="space-y-1.5">
          {data.suggestions.map((s, i) => (
            <li key={i} className="flex gap-2.5" style={{ color: "var(--ink-soft)" }}>
              <span style={{ color: "var(--accent)" }}>→</span> {s}
            </li>
          ))}
        </ul>
      </div>
      {data.nextStep.href ? (
        <Link href={data.nextStep.href} className="btn-accent !py-2 !px-4 text-sm mt-1">
          {data.nextStep.label} →
        </Link>
      ) : (
        <p className="text-xs italic" style={{ color: "var(--ink-faint)" }}>Next: {data.nextStep.label}</p>
      )}
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const { status: authStatus } = useSession();
  const [profileReady, setProfileReady] = useState<boolean | null>(null);
  const [step, setStep] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const loadProfile = useCallback(async () => {
    if (authStatus !== "authenticated") return;
    try {
      const res = await fetch("/api/onboarding");
      const data = await res.json();
      if (!data.profileComplete) {
        setProfileReady(false);
        return;
      }
      setProfileReady(true);
      setStep(data.aiPromptStep ?? 1);
    } catch {
      setProfileReady(false);
    }
  }, [authStatus]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/auth/signin?callbackUrl=/chat");
      return;
    }
    if (authStatus !== "loading") loadProfile();
  }, [authStatus, loadProfile, router]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function persistStep(nextStep: number) {
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aiPromptStep: nextStep }),
    });
  }

  async function sendMessage(text: string, atStep = step) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, mode: "guided", step: atStep }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "PROFILE_INCOMPLETE") router.replace("/intake");
        throw new Error(data?.error || "Request failed");
      }

      if (data.locked) {
        setMessages([
          ...nextMessages,
          { role: "paywall", content: "locked", teaser: data.teaser },
        ]);
        return;
      }

      setMessages([
        ...nextMessages,
        { role: "assistant", content: data.structured.direction, structured: data.structured },
      ]);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed";
      setMessages([...nextMessages, { role: "assistant", content: `Error: ${errorMessage}` }]);
    } finally {
      setLoading(false);
    }
  }

  async function advanceStep() {
    if (step >= 5) return;
    const next = step + 1;
    setStep(next);
    await persistStep(next);
    const starter = STEP_STARTERS[next];
    if (starter) await sendMessage(starter, next);
  }

  async function startCurrentStep() {
    const starter = STEP_STARTERS[step];
    if (starter) await sendMessage(starter, step);
  }

  if (profileReady === null || authStatus === "loading") {
    return (
      <div className="flex justify-center py-28">
        <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: "var(--hairline-strong)", borderTopColor: "var(--ink)" }} />
      </div>
    );
  }

  if (!profileReady) {
    return (
      <div className="max-w-md mx-auto text-center space-y-5 py-24 px-5">
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--ink)" }}>One step first</h1>
        <p style={{ color: "var(--ink-soft)" }}>
          Create your profile so LARA can personalize every answer.
        </p>
        <Link href="/intake" className="btn-primary inline-flex">Create profile</Link>
      </div>
    );
  }

  const currentMeta = AI_PROMPT_STEPS[step - 1];
  const hasAssistantReply = messages.some((m) => m.role === "assistant");

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 animate-fade-in">
      {/* Header + progress */}
      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-3">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
            LARA Guide
          </h1>
          <span className="text-sm font-medium" style={{ color: "var(--ink-faint)" }}>
            Prompt {step} of 5
          </span>
        </div>
        <div className="flex gap-1.5">
          {AI_PROMPT_STEPS.map((s) => (
            <div
              key={s.id}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{ background: s.id <= step ? "var(--accent)" : "var(--hairline-strong)" }}
              title={s.label}
            />
          ))}
        </div>
        <p className="text-sm mt-2.5" style={{ color: "var(--ink-soft)" }}>
          <span className="font-semibold" style={{ color: "var(--ink)" }}>{currentMeta?.label}.</span>{" "}
          {currentMeta?.description}
        </p>
      </div>

      {/* Conversation */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--hairline)", background: "var(--surface-warm)" }}>
        <div ref={listRef} className="h-[460px] overflow-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 px-6">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-xl"
                style={{ background: "rgba(199,93,58,0.1)" }}
              >
                ✦
              </div>
              <p style={{ color: "var(--ink-soft)" }}>
                Start <span className="font-semibold" style={{ color: "var(--ink)" }}>{currentMeta?.label}</span> for
                direction, a few paths, and one clear next step.
              </p>
              <button onClick={startCurrentStep} className="btn-primary text-sm" disabled={loading}>
                Start {currentMeta?.label}
              </button>
            </div>
          )}

          {messages.map((m, i) => {
            if (m.role === "paywall") {
              return <PaywallCard key={i} teaser={m.teaser} />;
            }
            return (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[88%] px-4 py-3 rounded-2xl"
                  style={
                    m.role === "user"
                      ? { background: "var(--ink)", color: "#fff", borderBottomRightRadius: 6 }
                      : { background: "var(--surface)", border: "1px solid var(--hairline)", borderBottomLeftRadius: 6 }
                  }
                >
                  {m.role === "assistant" && m.structured ? (
                    <StructuredReply data={m.structured} />
                  ) : (
                    <span className="whitespace-pre-wrap text-sm">{m.content}</span>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--hairline)" }}>
                <div className="flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--accent)", animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="p-4 space-y-3" style={{ borderTop: "1px solid var(--hairline)" }}>
          {step < 5 && hasAssistantReply && (
            <button onClick={advanceStep} disabled={loading} className="btn-outline w-full text-sm !py-2.5">
              Continue to {AI_PROMPT_STEPS[step]?.label} →
            </button>
          )}
          {step === 5 && hasAssistantReply && (
            <Link href="/report" className="btn-accent w-full text-sm !py-2.5">
              View full report →
            </Link>
          )}
          <div className="flex gap-2.5">
            <textarea
              rows={1}
              className="input-field flex-1 resize-none !py-2.5"
              placeholder="Ask a follow-up…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="btn-primary !px-5 text-sm disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs mt-4" style={{ color: "var(--ink-faint)" }}>
        <Link href="/profile" className="underline">Edit profile</Link> to refresh LARA&apos;s context
      </p>
    </div>
  );
}
