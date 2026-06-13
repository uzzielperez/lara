"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Report = {
  summary?: string;
  countries?: { name: string; why: string }[];
  programs?: { school: string; program: string; country: string; note?: string }[];
  requirements?: string[];
  eligibility?: { score?: number; strengths?: string[]; gaps?: string[] };
  nextActions?: string[];
};

export default function ReportPage() {
  const [state, setState] = useState<"loading" | "locked" | "error" | "ready">("loading");
  const [report, setReport] = useState<Report | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string>("");

  useEffect(() => {
    fetch("/api/report")
      .then(async (res) => {
        if (res.status === 402) {
          setState("locked");
          return null;
        }
        if (!res.ok) {
          setState("error");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setReport(data.report);
        setName(data.name);
        setGeneratedAt(data.generatedAt);
        setState("ready");
      })
      .catch(() => setState("error"));
  }, []);

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-4">
        <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: "var(--hairline-strong)", borderTopColor: "var(--ink)" }} />
        <p style={{ color: "var(--ink-soft)" }}>Compiling your report…</p>
      </div>
    );
  }

  if (state === "locked") {
    return (
      <div className="max-w-md mx-auto text-center py-28 px-5 space-y-5">
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--ink)" }}>This report is premium</h1>
        <p style={{ color: "var(--ink-soft)" }}>Unlock your full eligibility report to view and download it.</p>
        <Link href="/pricing" className="btn-primary inline-flex">See plans</Link>
      </div>
    );
  }

  if (state === "error" || !report) {
    return (
      <div className="max-w-md mx-auto text-center py-28 px-5 space-y-5">
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--ink)" }}>Couldn&apos;t build the report</h1>
        <Link href="/chat" className="btn-outline inline-flex">Back to LARA Guide</Link>
      </div>
    );
  }

  const score = report.eligibility?.score;

  return (
    <div className="max-w-3xl mx-auto px-5 py-12 animate-fade-in">
      {/* Action bar (hidden on print) */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <Link href="/chat" className="btn-ghost text-sm">← Back to guide</Link>
        <button onClick={() => window.print()} className="btn-primary text-sm">
          Download PDF
        </button>
      </div>

      <article className="card !p-8 sm:!p-12 space-y-10">
        <header>
          <p className="eyebrow mb-2">Eligibility report</p>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
            {name ? `${name}'s study-abroad plan` : "Your study-abroad plan"}
          </h1>
          {generatedAt && (
            <p className="text-xs mt-2" style={{ color: "var(--ink-faint)" }}>
              Generated {new Date(generatedAt).toLocaleDateString()}
            </p>
          )}
        </header>

        {report.summary && (
          <p className="text-lg leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            {report.summary}
          </p>
        )}

        {typeof score === "number" && (
          <div className="flex items-center gap-5">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-extrabold text-white"
              style={{ background: score >= 70 ? "var(--success)" : score >= 45 ? "var(--gold)" : "var(--accent)" }}
            >
              {score}
            </div>
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Eligibility score out of 100, based on your profile against matched programs.
            </p>
          </div>
        )}

        <Section title="Recommended countries">
          {report.countries?.map((c) => (
            <Row key={c.name} head={c.name} body={c.why} />
          ))}
        </Section>

        <Section title="Matched programs">
          {report.programs?.map((p, i) => (
            <Row
              key={i}
              head={`${p.program} — ${p.school}`}
              body={[p.country, p.note].filter(Boolean).join(" · ")}
            />
          ))}
        </Section>

        <Section title="Requirements">
          <ul className="space-y-2">
            {report.requirements?.map((r, i) => (
              <li key={i} className="flex gap-2.5 text-sm" style={{ color: "var(--ink-soft)" }}>
                <span style={{ color: "var(--accent)" }}>•</span> {r}
              </li>
            ))}
          </ul>
        </Section>

        {report.eligibility && (
          <Section title="Strengths and gaps">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--success)" }}>Strengths</p>
                <ul className="space-y-1.5 text-sm" style={{ color: "var(--ink-soft)" }}>
                  {report.eligibility.strengths?.map((s, i) => <li key={i}>+ {s}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--accent)" }}>To improve</p>
                <ul className="space-y-1.5 text-sm" style={{ color: "var(--ink-soft)" }}>
                  {report.eligibility.gaps?.map((g, i) => <li key={i}>− {g}</li>)}
                </ul>
              </div>
            </div>
          </Section>
        )}

        <Section title="Next actions">
          <ol className="space-y-2">
            {report.nextActions?.map((a, i) => (
              <li key={i} className="flex gap-3 text-sm" style={{ color: "var(--ink-soft)" }}>
                <span className="font-bold" style={{ color: "var(--ink)" }}>{i + 1}.</span> {a}
              </li>
            ))}
          </ol>
        </Section>

        <footer className="pt-6" style={{ borderTop: "1px solid var(--hairline)" }}>
          <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
            Want a hand with scholarships, applications, or housing?{" "}
            <a
              href="mailto:hello@filipinas-abroad.com?subject=LARA%20EdTech%20help"
              className="font-semibold"
              style={{ color: "var(--accent)" }}
            >
              Talk to LARA EdTech
            </a>
          </p>
        </footer>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--ink)" }}>
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Row({ head, body }: { head: string; body?: string }) {
  return (
    <div className="pb-3" style={{ borderBottom: "1px solid var(--hairline)" }}>
      <p className="font-semibold" style={{ color: "var(--ink)" }}>{head}</p>
      {body && <p className="text-sm mt-0.5" style={{ color: "var(--ink-soft)" }}>{body}</p>}
    </div>
  );
}
