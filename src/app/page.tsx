"use client";

import Link from "next/link";
import Sprint1StartLink from "@/components/Sprint1StartLink";

const SETUP = [
  { n: 1, title: "Land on LARA", body: "See where you're headed before you commit to anything." },
  { n: 2, title: "Sign up", body: "One account keeps your plan in sync across devices." },
  { n: 3, title: "Create your profile", body: "Budget, level, countries, language. This powers every answer." },
];

const PROMPTS = [
  { n: 4, title: "General direction", body: "A personalized read on your study-abroad path." },
  { n: 5, title: "Country suggestions", body: "Which destinations fit your budget and language." },
  { n: 6, title: "Program matches", body: "Partner programs pulled from our school database." },
  { n: 7, title: "Admission requirements", body: "Documents, deadlines, and tests you'll need." },
  { n: 8, title: "Eligibility + full report", body: "Your readiness, gaps, and a downloadable plan." },
];

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-5 pt-20 md:pt-28 pb-16 text-center">
        <p className="eyebrow mb-6">Learning &amp; Relocation Assistant</p>
        <h1 className="section-heading mb-6">
          From curious to admitted,
          <br />
          <span style={{ color: "var(--accent)" }}>and fully relocated.</span>
        </h1>
        <p className="section-subheading max-w-xl mx-auto mb-10">
          One guided system takes you from your first question to your new home abroad,
          with AI that actually knows your profile and our partner schools.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Sprint1StartLink variant="primary" className="w-full sm:w-auto text-base">
            Start your journey
          </Sprint1StartLink>
          <Link href="#how" className="btn-outline w-full sm:w-auto text-base">
            How it works
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-4xl mx-auto px-5 py-16 scroll-mt-20">
        <div className="mb-12 text-center">
          <p className="eyebrow mb-3">The path</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
            Eight steps, no guesswork
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-x-14 gap-y-12">
          <div>
            <p className="eyebrow mb-6">Set up · 3 steps</p>
            <ol className="space-y-7">
              {SETUP.map((s) => (
                <FlowItem key={s.n} {...s} tone="ink" />
              ))}
            </ol>
          </div>

          <div>
            <p className="eyebrow mb-6">AI guidance · 5 prompts</p>
            <ol className="space-y-7">
              {PROMPTS.map((s) => (
                <FlowItem key={s.n} {...s} tone="accent" locked={s.n === 8} />
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Close */}
      <section className="max-w-3xl mx-auto px-5 py-20 text-center">
        <div
          className="rounded-3xl px-6 py-14"
          style={{ background: "var(--ink)" }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
            Ready when you are
          </h2>
          <p className="text-base md:text-lg mb-9 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.72)" }}>
            The first four prompts are free. Unlock your full eligibility report and
            hands-on relocation help from LARA EdTech when you're ready.
          </p>
          <Sprint1StartLink variant="primary" className="text-base">
            Create your profile
          </Sprint1StartLink>
        </div>
      </section>
    </div>
  );
}

function FlowItem({
  n,
  title,
  body,
  tone,
  locked,
}: {
  n: number;
  title: string;
  body: string;
  tone: "ink" | "accent";
  locked?: boolean;
}) {
  const dotColor = tone === "accent" ? "var(--accent)" : "var(--ink)";
  return (
    <li className="flex gap-4">
      <span
        className="step-dot text-white shrink-0"
        style={{ background: dotColor }}
        aria-hidden
      >
        {n}
      </span>
      <div className="pt-0.5">
        <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--ink)" }}>
          {title}
          {locked && (
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: "rgba(200,162,75,0.16)", color: "var(--gold)" }}
            >
              Premium
            </span>
          )}
        </h3>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--ink-soft)" }}>
          {body}
        </p>
      </div>
    </li>
  );
}
