"use client";

import { useEffect, useState } from "react";
import ChatCreditsModal from "@/components/chat/ChatCreditsModal";
import LaraChatView from "@/components/chat/LaraChatView";
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

type ChatMessage = { role: "user" | "assistant"; content: string };

type Props = {
  studyGoals?: string;
  subscriptionStatus?: string | null;
  chatUsesCount?: number;
  onChatUsesChange?: (count: number) => void;
  onCreditsExhausted?: () => void;
};

export default function DashboardChatPanel({
  studyGoals,
  subscriptionStatus,
  chatUsesCount = 0,
  onChatUsesChange,
  onCreditsExhausted,
}: Props) {
  const [usesCount, setUsesCount] = useState(chatUsesCount);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
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

  function triggerCreditsModal() {
    setShowCreditsModal(true);
    onCreditsExhausted?.();
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    if (locked) {
      triggerCreditsModal();
      return;
    }

    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          mode: "ask",
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed");

      if (data.locked) {
        setLocked(true);
        setUsesCount(data.chatUsesCount ?? FREE_CHAT_PROMPTS);
        onChatUsesChange?.(data.chatUsesCount ?? FREE_CHAT_PROMPTS);
        triggerCreditsModal();
        return;
      }

      if (typeof data.chatUsesCount === "number") {
        setUsesCount(data.chatUsesCount);
        onChatUsesChange?.(data.chatUsesCount);
        if (!isPremium(subscriptionStatus) && data.chatUsesCount >= FREE_CHAT_PROMPTS) {
          setLocked(true);
          triggerCreditsModal();
        }
      }

      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="flex flex-col h-full min-w-0" style={{ background: "var(--surface-warm)" }}>
        <div
          className="shrink-0 px-4 py-3 border-b text-center"
          style={{ borderColor: "var(--hairline)" }}
        >
          <h1 className="text-sm font-bold" style={{ color: "var(--ink)" }}>
            Ask LARA anything
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink-faint)" }}>
            {premium
              ? "Premium · unlimited"
              : remaining === 0
                ? "No free prompts left"
                : `${remaining} of ${FREE_CHAT_PROMPTS} free prompts left`}
          </p>
        </div>

        <LaraChatView
          messages={messages}
          loading={loading}
          input={input}
          setInput={setInput}
          onSend={() => send(input)}
          locked={locked}
          quickChips={QUICK_CHIPS}
          onChipClick={send}
          composerPlaceholder="Ask LARA anything about studying abroad…"
        />
      </section>

      <ChatCreditsModal open={showCreditsModal} onClose={() => setShowCreditsModal(false)} />
    </>
  );
}
