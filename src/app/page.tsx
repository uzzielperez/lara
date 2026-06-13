"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SAMPLE_QUESTIONS = [
  "How much does it cost to study abroad?",
  "Are there scholarships for my degree?",
  "How much are tuition fees usually?",
  "How long does it take to get a visa?",
  "What are the important dates and timelines?",
  "What's the process of studying abroad?",
  "Which countries are most affordable?",
  "Do I need to speak the local language?",
];

const FEATURED_PARTNERS = [
  {
    name: "Universitat de Barcelona",
    city: "Barcelona",
    type: "Public",
    tuition: "€4,246 – €9,840 / yr",
    url: "https://web.ub.edu/en/",
  },
  {
    name: "EU Business School",
    city: "Barcelona",
    type: "Private",
    tuition: "€16,350 – €49,350 / yr",
    url: "https://www.euruni.edu",
  },
  {
    name: "Barcelona Technology School",
    city: "Barcelona",
    type: "Private",
    tuition: "€17,500 / yr",
    url: "https://barcelonatechnologyschool.com",
  },
];

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const started = messages.length > 0;

  useEffect(() => {
    if (started) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, started]);

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, mode: "public" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setMessages([...next, { role: "assistant", content: data.reply }]);
      setTurns((t) => t + 1);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setMessages([...next, { role: "assistant", content: `Sorry, ${msg}. Please try again.` }]);
    } finally {
      setLoading(false);
    }
  }

  const showNudge = turns >= 1;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col animate-fade-in">
      {!started ? (
        /* ---------- Empty state: hero + composer + sample chips ---------- */
        <section className="flex-1 flex flex-col items-center justify-center px-5 py-10">
          <div className="w-full max-w-2xl text-center">
            <p className="eyebrow mb-5 justify-center">LARA · Study abroad assistant</p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4" style={{ color: "var(--ink)" }}>
              Ask me anything about
              <br />
              <span style={{ color: "var(--accent)" }}>studying abroad</span>
            </h1>
            <p className="text-lg mb-9" style={{ color: "var(--ink-soft)" }}>
              No sign-up needed. I&apos;m tuned to LARA&apos;s partner schools and programs.
            </p>

            <Composer value={input} setValue={setInput} onSend={() => ask(input)} loading={loading} autoFocus />

            <p className="text-xs mt-5 mb-3" style={{ color: "var(--ink-faint)" }}>Try one of these</p>
          </div>

          {/* Rolling sample questions */}
          <div className="w-full max-w-5xl space-y-2.5">
            <SampleRow items={SAMPLE_QUESTIONS} onPick={ask} />
            <SampleRow items={[...SAMPLE_QUESTIONS].reverse()} onPick={ask} reverse />
          </div>

          {/* Partner schools */}
          <div className="w-full max-w-3xl mt-14">
            <p className="text-xs text-center mb-4" style={{ color: "var(--ink-faint)" }}>
              A few of our partner schools in Spain
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {FEATURED_PARTNERS.map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="premium-card !p-5 block group"
                >
                  <p className="text-xs font-medium mb-2" style={{ color: "var(--ink-faint)" }}>
                    {p.city} · {p.type}
                  </p>
                  <h3 className="font-bold leading-snug mb-3" style={{ color: "var(--ink)" }}>
                    {p.name}
                  </h3>
                  <p className="text-sm mb-3" style={{ color: "var(--ink-soft)" }}>{p.tuition}</p>
                  <span className="text-sm font-semibold inline-flex items-center gap-1" style={{ color: "var(--accent)" }}>
                    Visit site
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      ) : (
        /* ---------- Conversation ---------- */
        <section className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-5 py-6">
          <div ref={listRef} className="flex-1 overflow-auto space-y-4 pb-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[88%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                  style={
                    m.role === "user"
                      ? { background: "var(--ink)", color: "#fff", borderBottomRightRadius: 6 }
                      : { background: "var(--surface)", border: "1px solid var(--hairline)", color: "var(--ink)", borderBottomLeftRadius: 6 }
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}

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

            {showNudge && !loading && (
              <div className="rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3" style={{ background: "rgba(199,93,58,0.07)", border: "1px solid rgba(199,93,58,0.2)" }}>
                <p className="text-sm flex-1" style={{ color: "var(--ink)" }}>
                  Want answers tailored to <span className="font-semibold">your</span> budget, level, and countries? Create a free profile.
                </p>
                <Link href="/auth/signin?callbackUrl=%2Fintake" className="btn-primary text-sm whitespace-nowrap !py-2.5">
                  Get my plan
                </Link>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Composer value={input} setValue={setInput} onSend={() => ask(input)} loading={loading} />
            <p className="text-center text-xs mt-3" style={{ color: "var(--ink-faint)" }}>
              LARA can be wrong. Verify key dates and figures.{" "}
              <Link href="/auth/signin?callbackUrl=%2Fintake" className="underline">Sign up</Link> for a personalized plan.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function Composer({
  value,
  setValue,
  onSend,
  loading,
  autoFocus,
}: {
  value: string;
  setValue: (v: string) => void;
  onSend: () => void;
  loading: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div
      className="flex items-end gap-2 p-2 rounded-2xl"
      style={{ background: "var(--surface)", border: "1px solid var(--hairline-strong)" }}
    >
      <textarea
        rows={1}
        autoFocus={autoFocus}
        className="flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none"
        style={{ color: "var(--ink)" }}
        placeholder="Ask about costs, scholarships, visas, timelines…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <button
        onClick={onSend}
        disabled={loading || !value.trim()}
        className="btn-primary !px-4 !py-2.5 text-sm disabled:opacity-40"
        aria-label="Send"
      >
        Ask
      </button>
    </div>
  );
}

function SampleRow({
  items,
  onPick,
  reverse,
}: {
  items: string[];
  onPick: (q: string) => void;
  reverse?: boolean;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee-mask overflow-hidden" style={{ maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }}>
      <div className={`marquee-track ${reverse ? "reverse" : ""}`}>
        {doubled.map((q, i) => (
          <button key={`${q}-${i}`} className="q-chip" onClick={() => onPick(q)} tabIndex={-1}>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
