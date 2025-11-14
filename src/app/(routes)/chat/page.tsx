"use client";
import { useEffect, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const MODES = [
  { id: "schools", label: "Find Schools" },
  { id: "cv", label: "Edit CV" },
  { id: "profile", label: "Improve Profile" },
  { id: "housing", label: "Find Housing" },
] as const;

type ModeId = typeof MODES[number]["id"];

export default function ChatPage() {
  const [mode, setMode] = useState<ModeId>("schools");
  const [rag, setRag] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const nextMessages = [...messages, { role: "user", content: text } as ChatMessage];
    setMessages(nextMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, mode, rag }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed";
      setMessages([...nextMessages, { role: "assistant", content: `Error: ${errorMessage}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Assistant</h1>

      <div className="flex items-center gap-2 flex-wrap">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-3 py-1 text-sm rounded border ${mode === m.id ? "bg-black text-white" : "bg-white text-gray-900"}`}
          >
            {m.label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm">
          <input type="checkbox" checked={rag} onChange={(e) => setRag(e.target.checked)} />
          Use RAG
        </label>
      </div>

      <div ref={listRef} className="border rounded bg-white h-[480px] overflow-auto p-3 space-y-3 text-gray-900">
        {messages.length === 0 && (
          <div className="text-gray-500 text-sm">Ask me to find programs or housing, or paste part of your CV to improve it.</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`whitespace-pre-wrap ${m.role === "user" ? "text-right" : "text-left"}`}>
            <div className={`inline-block px-3 py-2 rounded ${m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-sm text-gray-500">Thinking…</div>}
      </div>

      <div className="flex gap-2">
        <textarea
          rows={3}
          className="flex-1 border rounded p-2"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={send} className="px-4 py-2 bg-black text-white rounded self-end">Send</button>
      </div>
    </div>
  );
}

