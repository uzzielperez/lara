"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PaywallCard from "@/components/PaywallCard";
import { CHAT_WELCOME } from "@/lib/study-abroad-path";
import {
  chatPromptsRemaining,
  FREE_CHAT_PROMPTS,
  hasPremiumCoaching,
  isPremium,
} from "@/lib/subscription";

const QUICK_CHIPS = [
  "What's the simplest path abroad?",
  "What programs fit me?",
  "Visa requirements for Spain",
];

type ChatMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string }
  | { role: "paywall"; content: string; teaser?: string };

type Props = {
  studyGoals?: string;
  subscriptionStatus?: string | null;
  chatUsesCount?: number;
  onChatUsesChange?: (count: number) => void;
};

export default function DashboardChatPanel({
  studyGoals,
  subscriptionStatus,
  chatUsesCount = 0,
  onChatUsesChange,
}: Props) {
  const [usesCount, setUsesCount] = useState(chatUsesCount);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const premium = hasPremiumCoaching(subscriptionStatus);
  const remaining = chatPromptsRemaining(usesCount, subscriptionStatus);

  useEffect(() => {
    setUsesCount(chatUsesCount);
    setLocked(chatUsesCount >= FREE_CHAT_PROMPTS && !isPremium(subscriptionStatus));
  }, [chatUsesCount, subscriptionStatus]);

  useEffect(() => {
    if (messages.length > 0) return;
    setMessages([
      {
        role: "assistant",
        content: studyGoals
          ? `${CHAT_WELCOME}\n\nI remember your goal: "${studyGoals.slice(0, 100)}${studyGoals.length > 100 ? "…" : ""}"`
          : CHAT_WELCOME,
      },
    ]);
  }, [studyGoals, messages.length]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading || locked) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next
            .filter((m) => m.role !== "paywall")
            .map((m) => ({ role: m.role, content: m.content })),
          mode: "ask",
        }),
      });
      const data = await res.json();
      if (data.code === "PROFILE_INCOMPLETE") {
        setMessages([
          ...next,
          {
            role: "assistant",
            content: "Complete the intake chat first — or fill in your story on the right.",
          },
        ]);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.locked) {
        setLocked(true);
        setUsesCount(data.chatUsesCount ?? FREE_CHAT_PROMPTS);
        onChatUsesChange?.(data.chatUsesCount ?? FREE_CHAT_PROMPTS);
        setMessages([...next, { role: "paywall", content: "locked", teaser: data.teaser }]);
        return;
      }
      if (typeof data.chatUsesCount === "number") {
        setUsesCount(data.chatUsesCount);
        onChatUsesChange?.(data.chatUsesCount);
        if (!isPremium(subscriptionStatus) && data.chatUsesCount >= FREE_CHAT_PROMPTS) {
          setLocked(true);
        }
      }
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Something went wrong. Try again or open full chat." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col h-full min-w-0 border-r" style={{ borderColor: "var(--hairline)" }}>
      <div
        className="px-5 py-3 border-b flex items-center justify-between gap-3"
        style={{ borderColor: "var(--hairline)" }}
      >
        <div>
          <h2 className="text-sm font-bold" style={{ color: "var(--ink)" }}>
            Ask LARA anything
          </h2>
          <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
            {premium
              ? "Premium · unlimited questions"
              : remaining === 0
                ? "No free prompts left"
                : `${remaining} of ${FREE_CHAT_PROMPTS} free prompts left`}
          </p>
        </div>
        <Link href="/chat" className="text-xs underline shrink-0" style={{ color: "var(--accent)" }}>
          Full chat
        </Link>
      </div>

      <div className="flex-1 overflow-auto p-5 space-y-4">
        {messages.map((m, i) => {
          if (m.role === "paywall") {
            return (
              <PaywallCard
                key={i}
                title="Unlock unlimited LARA chat"
                subtitle={m.teaser}
                features={[
                  "Unlimited ask-anything questions",
                  "Full eligibility report",
                  "Application coaching",
                  "Voice & call support",
                ]}
                primaryCta="Upgrade to Premium"
              />
            );
          }
          return (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
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
                {m.content}
              </div>
            </div>
          );
        })}
        {loading && (
          <p className="text-xs" style={{ color: "var(--ink-faint)" }}>
            LARA is thinking…
          </p>
        )}
      </div>

      <div className="p-4 border-t space-y-3" style={{ borderColor: "var(--hairline)" }}>
        <div className="flex flex-wrap gap-2">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              className="text-xs px-3 py-1.5 rounded-full disabled:opacity-40"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--hairline-strong)",
                color: "var(--ink-soft)",
              }}
              onClick={() => send(chip)}
              disabled={loading || locked}
            >
              {chip}
            </button>
          ))}
        </div>

        <div
          className="flex items-end gap-2 p-2 rounded-2xl"
          style={{ background: "var(--surface)", border: "1px solid var(--hairline-strong)" }}
        >
          <Link
            href="/profile#documents"
            className="p-2 rounded-lg text-lg leading-none shrink-0"
            title="Upload documents"
            style={{ color: "var(--ink-soft)" }}
          >
            +
          </Link>
          <textarea
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none py-2"
            style={{ color: "var(--ink)" }}
            placeholder={locked ? "Upgrade to keep chatting…" : "Ask LARA anything…"}
            value={input}
            disabled={locked}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
          />
          {premium ? (
            <>
              <button type="button" className="p-2 text-lg opacity-50" title="Voice input (coming soon)">
                🎤
              </button>
              <button type="button" className="p-2 text-lg opacity-50" title="Call LARA (coming soon)">
                📞
              </button>
            </>
          ) : (
            <>
              <Link href="/pricing" className="p-2 text-lg opacity-40 relative" title="Voice input — Premium">
                🎤
                <span className="absolute -top-0.5 -right-0.5 text-[8px]">🔒</span>
              </Link>
              <Link
                href="/pricing"
                className="p-2 rounded-full text-sm"
                style={{ background: "var(--ink)", color: "#fff" }}
                title="Live coaching call — Premium"
              >
                📞
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => send(input)}
            disabled={loading || !input.trim() || locked}
            className="btn-primary !px-4 !py-2 text-sm disabled:opacity-40 shrink-0"
          >
            Send
          </button>
        </div>

        {!premium && (
          <p className="text-center text-xs" style={{ color: "var(--ink-faint)" }}>
            <Link href="/pricing" className="underline">
              Upgrade for unlimited chat & coaching
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
