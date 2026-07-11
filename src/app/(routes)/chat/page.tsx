"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import PaywallCard from "@/components/PaywallCard";
import StudyAbroadPathCard from "@/components/dashboard/StudyAbroadPathCard";
import { CHAT_WELCOME, STUDY_ABROAD_PATH } from "@/lib/study-abroad-path";
import {
  chatPromptsRemaining,
  FREE_CHAT_PROMPTS,
  isPremium,
} from "@/lib/subscription";

type ChatMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string }
  | { role: "paywall"; content: string; teaser?: string };

const QUICK_CHIPS = [
  "What's the simplest path to study abroad?",
  "What programs fit my profile?",
  "Visa requirements for my target country",
];

export default function ChatPage() {
  const router = useRouter();
  const { status: authStatus } = useSession();
  const [profileReady, setProfileReady] = useState<boolean | null>(null);
  const [chatUsesCount, setChatUsesCount] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const premium = isPremium(subscriptionStatus);
  const remaining = chatPromptsRemaining(chatUsesCount, subscriptionStatus);

  const loadProfile = useCallback(async () => {
    if (authStatus !== "authenticated") return;
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (!data.complete) {
        setProfileReady(false);
        return;
      }
      setProfileReady(true);
      const uses = data.chatUsesCount ?? 0;
      const status = data.profile?.subscriptionStatus ?? null;
      setChatUsesCount(uses);
      setSubscriptionStatus(status);
      setLocked(uses >= FREE_CHAT_PROMPTS && !isPremium(status));
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

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading || locked) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
          })),
          mode: "ask",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "PROFILE_INCOMPLETE") router.replace("/intake");
        throw new Error(data?.error || "Request failed");
      }

      if (data.locked) {
        setLocked(true);
        setChatUsesCount(data.chatUsesCount ?? FREE_CHAT_PROMPTS);
        setMessages([
          ...nextMessages,
          { role: "paywall", content: "locked", teaser: data.teaser },
        ]);
        return;
      }

      if (typeof data.chatUsesCount === "number") {
        setChatUsesCount(data.chatUsesCount);
        if (!premium && data.chatUsesCount >= FREE_CHAT_PROMPTS) setLocked(true);
      }

      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed";
      setMessages([...nextMessages, { role: "assistant", content: `Error: ${errorMessage}` }]);
    } finally {
      setLoading(false);
    }
  }

  if (profileReady === null || authStatus === "loading") {
    return (
      <div className="flex justify-center py-28">
        <div
          className="w-10 h-10 border-2 rounded-full animate-spin"
          style={{ borderColor: "var(--hairline-strong)", borderTopColor: "var(--ink)" }}
        />
      </div>
    );
  }

  if (!profileReady) {
    return (
      <div className="max-w-md mx-auto text-center space-y-5 py-24 px-5">
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--ink)" }}>
          One step first
        </h1>
        <p style={{ color: "var(--ink-soft)" }}>
          Tell LARA what you&apos;re looking for — a quick chat, no budget needed yet.
        </p>
        <Link href="/intake" className="btn-primary inline-flex">
          Start intake chat
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">
        <div>
          <div className="mb-5">
            <div className="flex items-baseline justify-between mb-2">
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
                Ask LARA anything
              </h1>
              <span className="text-sm font-medium" style={{ color: "var(--ink-faint)" }}>
                {premium
                  ? "Premium · unlimited"
                  : remaining === 0
                    ? "No free prompts left"
                    : `${remaining} of ${FREE_CHAT_PROMPTS} free`}
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Personalized answers about programs, visas, and your study-abroad path.
            </p>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--hairline)", background: "var(--surface-warm)" }}
          >
            <div ref={listRef} className="h-[460px] overflow-auto p-5 space-y-4">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div
                    className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--hairline)",
                      color: "var(--ink)",
                    }}
                  >
                    {CHAT_WELCOME}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        className="text-xs px-3 py-1.5 rounded-full"
                        style={{
                          background: "var(--surface)",
                          border: "1px solid var(--hairline-strong)",
                          color: "var(--ink-soft)",
                        }}
                        onClick={() => sendMessage(chip)}
                        disabled={loading || locked}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => {
                if (m.role === "paywall") {
                  return (
                    <PaywallCard
                      key={i}
                      title="Unlock unlimited LARA chat"
                      subtitle={m.teaser}
                      features={[
                        "Unlimited ask-anything questions",
                        "Full eligibility report & matched programs",
                        "Scholarship leads and application coaching",
                        "Voice & live call support with LARA EdTech",
                      ]}
                      primaryCta="Upgrade to Premium"
                    />
                  );
                }
                return (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className="max-w-[88%] px-4 py-3 rounded-2xl"
                      style={
                        m.role === "user"
                          ? { background: "var(--ink)", color: "#fff", borderBottomRightRadius: 6 }
                          : {
                              background: "var(--surface)",
                              border: "1px solid var(--hairline)",
                              borderBottomLeftRadius: 6,
                            }
                      }
                    >
                      <span className="whitespace-pre-wrap text-sm">{m.content}</span>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div
                    className="px-4 py-3 rounded-2xl"
                    style={{ background: "var(--surface)", border: "1px solid var(--hairline)" }}
                  >
                    <div className="flex gap-1">
                      {[0, 150, 300].map((d) => (
                        <span
                          key={d}
                          className="w-1.5 h-1.5 rounded-full animate-bounce"
                          style={{ background: "var(--accent)", animationDelay: `${d}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 space-y-3" style={{ borderTop: "1px solid var(--hairline)" }}>
              {locked && messages.every((m) => m.role !== "paywall") && (
                <PaywallCard
                  title="Unlock unlimited LARA chat"
                  subtitle="You've used your 5 free questions. Upgrade for unlimited guidance and coaching."
                  features={[
                    "Unlimited ask-anything questions",
                    "Full eligibility report & matched programs",
                    "Scholarship leads and application coaching",
                    "Voice & live call support with LARA EdTech",
                  ]}
                  primaryCta="Upgrade to Premium"
                />
              )}
              <div className="flex gap-2.5">
                <textarea
                  rows={1}
                  className="input-field flex-1 resize-none !py-2.5"
                  placeholder={locked ? "Upgrade to keep chatting…" : "Ask anything about studying abroad…"}
                  value={input}
                  disabled={locked}
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
                  disabled={loading || !input.trim() || locked}
                  className="btn-primary !px-5 text-sm disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-xs mt-4" style={{ color: "var(--ink-faint)" }}>
            <Link href="/profile" className="underline">
              Edit profile
            </Link>{" "}
            to refresh LARA&apos;s context ·{" "}
            <Link href="/programs" className="underline">
              Browse programs
            </Link>
          </p>
        </div>

        <aside className="hidden lg:block">
          <StudyAbroadPathCard currentStep={2} />
          <div
            className="rounded-xl p-4 text-xs leading-relaxed space-y-2"
            style={{ background: "var(--surface)", border: "1px solid var(--hairline)" }}
          >
            {STUDY_ABROAD_PATH.map((s) => (
              <p key={s.step} style={{ color: "var(--ink-soft)" }}>
                <span className="font-semibold" style={{ color: "var(--ink)" }}>
                  {s.step}. {s.title}
                </span>
                {" — "}
                {s.description}
              </p>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
