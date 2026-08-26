"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import ChatComposer from "@/components/chat/ChatComposer";
import ChatMarkdown from "@/components/chat/ChatMarkdown";

export type ChatBubble = { role: "user" | "assistant"; content: string };

type Props = {
  messages: ChatBubble[];
  loading?: boolean;
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  locked?: boolean;
  quickChips?: string[];
  onChipClick?: (text: string) => void;
  footer?: React.ReactNode;
  composerPlaceholder?: string;
  emptyState?: React.ReactNode;
};

export default function LaraChatView({
  messages,
  loading = false,
  input,
  setInput,
  onSend,
  locked = false,
  quickChips,
  onChipClick,
  footer,
  composerPlaceholder,
  emptyState,
}: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const started = messages.length > 0;

  useEffect(() => {
    if (started) {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading, started]);

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full max-w-3xl mx-auto px-4 sm:px-5">
      {!started && emptyState ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8">{emptyState}</div>
      ) : (
        <div ref={listRef} className="flex-1 overflow-auto space-y-4 py-4 min-h-0">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user" ? "max-w-[88%] whitespace-pre-wrap" : "max-w-full sm:max-w-[95%]"
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
      )}

      <div className="shrink-0 pb-4 pt-2 space-y-3">
        {quickChips && quickChips.length > 0 && onChipClick && (
          <div className="flex flex-wrap justify-center gap-2">
            {quickChips.map((chip) => (
              <button
                key={chip}
                type="button"
                className="text-xs px-3 py-1.5 rounded-full disabled:opacity-40"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--hairline-strong)",
                  color: "var(--ink-soft)",
                }}
                onClick={() => onChipClick(chip)}
                disabled={loading || locked}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <ChatComposer
          value={input}
          setValue={setInput}
          onSend={onSend}
          loading={loading}
          disabled={locked}
          placeholder={
            locked
              ? "Free prompts used — upgrade for unlimited chat"
              : composerPlaceholder ?? "Ask LARA anything…"
          }
          sendLabel="Send"
        />

        {footer ?? (
          <p className="text-center text-xs" style={{ color: "var(--ink-faint)" }}>
            LARA can be wrong. Verify key dates and figures.{" "}
            <Link href="/programs" className="underline">
              Browse programs
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
