"use client";

import Link from "next/link";
import { useState } from "react";
import { hasPremiumCoaching } from "@/lib/subscription";

const QUICK_CHIPS = [
  "What programs fit me?",
  "Update my goals",
  "Visa requirements for Spain",
];

type Props = {
  studyGoals?: string;
  subscriptionStatus?: string | null;
};

export default function DashboardChatPanel({ studyGoals, subscriptionStatus }: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: studyGoals
        ? `Hi! I remember you're looking for: "${studyGoals.slice(0, 120)}${studyGoals.length > 120 ? "…" : ""}"\n\nAsk me anything — or use the profile panel to add more details for better matches.`
        : "Hi! I'm LARA. Tell me what you're exploring, or fill in your profile on the right to get personalized guidance.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const premium = hasPremiumCoaching(subscriptionStatus);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
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
          mode: "guided",
          step: 1,
        }),
      });
      const data = await res.json();
      if (data.code === "PROFILE_INCOMPLETE") {
        setMessages([
          ...next,
          {
            role: "assistant",
            content: "Complete the intake chat first so I can personalize answers — or fill in your story on the right.",
          },
        ]);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.structured?.direction) {
        setMessages([
          ...next,
          {
            role: "assistant",
            content: `${data.structured.direction}\n\nNext: ${data.structured.nextStep?.label ?? "Continue in LARA Guide"}`,
          },
        ]);
      }
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Something went wrong. Try again or open the full LARA Guide." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col h-full min-w-0 border-r" style={{ borderColor: "var(--hairline)" }}>
      <div className="flex-1 overflow-auto p-5 space-y-4">
        {messages.map((m, i) => (
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
        ))}
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
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ background: "var(--surface)", border: "1px solid var(--hairline-strong)", color: "var(--ink-soft)" }}
              onClick={() => send(chip)}
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
            placeholder="Ask LARA anything…"
            value={input}
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
              <Link
                href="/pricing"
                className="p-2 text-lg opacity-40 relative"
                title="Voice input — Premium"
              >
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
            disabled={loading || !input.trim()}
            className="btn-primary !px-4 !py-2 text-sm disabled:opacity-40 shrink-0"
          >
            Send
          </button>
        </div>

        <p className="text-center text-xs" style={{ color: "var(--ink-faint)" }}>
          <Link href="/chat" className="underline">
            Open full LARA Guide
          </Link>
          {!premium && (
            <>
              {" "}
              ·{" "}
              <Link href="/pricing" className="underline">
                Upgrade for coaching & calls
              </Link>
            </>
          )}
        </p>
      </div>
    </section>
  );
}
