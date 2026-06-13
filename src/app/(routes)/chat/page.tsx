"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Sprint1FlowSteps from "@/components/Sprint1FlowSteps";
import type { GuidedChatResponse } from "@/lib/guided-chat";
import { AI_PROMPT_STEPS } from "@/lib/sprint1-flow";
import type { ProfileInput } from "@/lib/user-profile";

type ChatMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; structured?: GuidedChatResponse };

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
      <p className="font-semibold text-teal">Direction</p>
      <p className="text-charcoal leading-relaxed">{data.direction}</p>
      <p className="font-semibold text-teal pt-1">Suggested paths</p>
      <ul className="list-disc pl-5 space-y-1 text-charcoal">
        {data.suggestions.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      {data.nextStep.href ? (
        <Link
          href={data.nextStep.href}
          className="inline-flex mt-2 btn-accent text-sm py-2 px-4"
        >
          {data.nextStep.label} →
        </Link>
      ) : (
        <p className="text-charcoal-light italic mt-2">Next: {data.nextStep.label}</p>
      )}
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const { status: authStatus } = useSession();
  const [profileReady, setProfileReady] = useState<boolean | null>(null);
  const [flowStep, setFlowStep] = useState(4);
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
      setFlowStep(data.flowStep ?? 3 + (data.aiPromptStep ?? 1));
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
    setFlowStep(3 + nextStep);
  }

  async function sendMessage(text: string) {
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
        body: JSON.stringify({
          messages: nextMessages,
          mode: "guided",
          rag: true,
          step,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "PROFILE_INCOMPLETE") {
          router.replace("/intake");
        }
        throw new Error(data?.error || "Request failed");
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
    if (starter) await sendMessage(starter);
  }

  async function startCurrentStep() {
    const starter = STEP_STARTERS[step];
    if (starter) await sendMessage(starter);
  }

  if (profileReady === null || authStatus === "loading") {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileReady) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 animate-fade-in py-12 px-4">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto text-3xl">
          👤
        </div>
        <h1 className="section-heading">Complete your profile first</h1>
        <p className="text-charcoal-light">
          Sprint 1 requires your profile before any AI prompts can run.
        </p>
        <Link href="/intake" className="btn-accent inline-block">
          Go to profile creation →
        </Link>
      </div>
    );
  }

  const currentMeta = AI_PROMPT_STEPS[step - 1];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in px-4 pb-8">
      <div className="text-center mb-2">
        <h1 className="section-heading">LARA Guide</h1>
        <p className="section-subheading">Prompt {step} of 5 — {currentMeta?.label}</p>
      </div>

      <Sprint1FlowSteps activeStep={flowStep} compact />

      <div className="bg-white rounded-xl border border-cream-400 p-4 shadow-sm">
        <div className="flex justify-between text-xs text-charcoal-light mb-2">
          <span>
            Prompt {step}/5 — {currentMeta?.label}
          </span>
          {step === 5 && (
            <span className="text-gold-600 font-medium">Premium unlock coming soon</span>
          )}
        </div>
        <div className="flex gap-1">
          {AI_PROMPT_STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-2 flex-1 rounded-full transition-colors ${
                s.id <= step ? "bg-teal" : "bg-cream-300"
              }`}
              title={s.label}
            />
          ))}
        </div>
        <p className="text-sm text-charcoal-light mt-2">{currentMeta?.description}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-cream-400 overflow-hidden">
        <div
          ref={listRef}
          className="h-[480px] overflow-auto p-6 space-y-4 bg-gradient-to-b from-cream-100 to-white"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <p className="text-charcoal-light max-w-md">
                Start <strong>{currentMeta?.label}</strong> for direction, suggested paths, and a
                clear next step.
              </p>
              <button
                type="button"
                onClick={startCurrentStep}
                className="btn-accent"
                disabled={loading}
              >
                Start {currentMeta?.label} →
              </button>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                  m.role === "user"
                    ? "bg-teal text-white rounded-br-md whitespace-pre-wrap"
                    : "bg-white border border-cream-400 text-charcoal rounded-bl-md shadow-sm"
                }`}
              >
                {m.role === "assistant" && m.structured ? (
                  <StructuredReply data={m.structured} />
                ) : (
                  <span className="whitespace-pre-wrap">{m.content}</span>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-cream-400 px-4 py-3 rounded-2xl shadow-sm">
                <div className="flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-2 h-2 bg-gold-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-cream-400 bg-cream-100 space-y-3">
          {step < 5 && messages.some((m) => m.role === "assistant") && (
            <button
              type="button"
              onClick={advanceStep}
              disabled={loading}
              className="w-full btn-outline text-sm py-2"
            >
              Continue to {AI_PROMPT_STEPS[step]?.label} →
            </button>
          )}
          <div className="flex gap-3">
            <textarea
              rows={2}
              className="input-field flex-1 resize-none"
              placeholder="Ask about this prompt…"
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
              type="button"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="btn-accent self-end disabled:opacity-50"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-charcoal-light text-center">
            <Link href="/profile" className="text-teal underline">
              Edit profile
            </Link>{" "}
            to refresh AI context
          </p>
        </div>
      </div>
    </div>
  );
}
