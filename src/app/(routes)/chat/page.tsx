"use client";
import { useEffect, useRef, useState } from "react";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const MODES = [
  { id: "schools", label: "Find Schools", icon: "🎓" },
  { id: "cv", label: "Edit CV", icon: "📄" },
  { id: "profile", label: "Improve Profile", icon: "👤" },
  { id: "housing", label: "Find Housing", icon: "🏠" },
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
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="section-heading">AI Assistant</h1>
        <p className="section-subheading">Get personalized help for your study abroad journey</p>
      </div>

      {/* Mode Selection */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              mode === m.id 
                ? "bg-teal text-white shadow-md" 
                : "bg-white text-charcoal border-2 border-cream-400 hover:border-primary-300"
            }`}
          >
            <span>{m.icon}</span>
            {m.label}
          </button>
        ))}
        <label className="ml-4 flex items-center gap-2 text-sm text-charcoal-light">
          <input 
            type="checkbox" 
            checked={rag} 
            onChange={(e) => setRag(e.target.checked)}
            className="w-4 h-4 accent-teal rounded"
          />
          Use RAG
        </label>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-xl shadow-sm border border-cream-400 overflow-hidden">
        <div 
          ref={listRef} 
          className="h-[480px] overflow-auto p-6 space-y-4 bg-gradient-to-b from-cream-100 to-white"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-charcoal-light max-w-md">
                Ask me to find programs, housing options, or paste part of your CV to get improvement suggestions.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div 
              key={i} 
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div 
                className={`max-w-[80%] px-4 py-3 rounded-2xl whitespace-pre-wrap ${
                  m.role === "user" 
                    ? "bg-teal text-white rounded-br-md" 
                    : "bg-white border border-cream-400 text-charcoal rounded-bl-md shadow-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-cream-400 text-charcoal-light px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-cream-400 bg-cream-100">
          <div className="flex gap-3">
            <textarea
              rows={2}
              className="input-field flex-1 resize-none"
              placeholder="Type your message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button 
              onClick={send} 
              disabled={loading || !input.trim()}
              className="btn-accent self-end disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
