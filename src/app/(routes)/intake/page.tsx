"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Sprint1FlowSteps from "@/components/Sprint1FlowSteps";
import { CEFR_LEVELS } from "@/lib/user-profile";

export default function IntakePage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [form, setForm] = useState({
    nationalityCode: "",
    rentBudgetMin: 500,
    rentBudgetMax: 1200,
    universityBudgetMin: 0,
    universityBudgetMax: 20000,
    targetCountries: ["ES"] as string[],
    degreeLevels: ["MASTERS"],
    cefrLevel: "B2",
    desiredStart: "",
  });

  useEffect(() => {
    if (authStatus !== "authenticated") return;

    fetch("/api/onboarding")
      .then((res) => res.json())
      .then((data) => {
        if (data.profileComplete) {
          router.replace("/chat");
          return;
        }
        return fetch("/api/profile");
      })
      .then((res) => {
        if (!res || !res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data?.profile) {
          const p = data.profile;
          setForm((prev) => ({
            ...prev,
            nationalityCode: p.nationalityCode || prev.nationalityCode,
            rentBudgetMin: p.budgetMinMonthly || prev.rentBudgetMin,
            rentBudgetMax: p.budgetMaxMonthly || prev.rentBudgetMax,
            targetCountries: (p.targetCountries || prev.targetCountries).slice(0, 3),
            degreeLevels: p.degreeLevels || prev.degreeLevels,
            cefrLevel: p.cefrLevel || prev.cefrLevel,
            universityBudgetMin: p.universityBudgetMin ?? prev.universityBudgetMin,
            universityBudgetMax: p.universityBudgetMax ?? prev.universityBudgetMax,
            desiredStart: p.desiredStart ? p.desiredStart.split("T")[0] : prev.desiredStart,
          }));
        }
      })
      .catch((err) => console.error("Error loading profile:", err))
      .finally(() => setCheckingProfile(false));
  }, [session, authStatus, router]);

  const displayName = session?.user?.name?.split(" ")[0] || "there";

  const questions = [
    {
      id: 1,
      title: `Hi ${displayName}! 👋`,
      subtitle: "Let's build your study-abroad profile — required before AI guidance",
      input: (
        <div className="rounded-xl bg-primary-50 border border-primary-200 p-5 text-charcoal space-y-2 text-sm">
          <p>✓ Budget (rent + tuition)</p>
          <p>✓ Academic level & up to 3 countries</p>
          <p>✓ CEFR language level & start date</p>
        </div>
      ),
    },
    {
      id: 2,
      title: "What's your nationality?",
      subtitle: "This helps us show you the right visa requirements",
      input: (
        <input
          className="input-field text-lg"
          placeholder="e.g., PH for Philippines, AE for UAE"
          value={form.nationalityCode}
          onChange={(e) =>
            setForm({ ...form, nationalityCode: e.target.value.toUpperCase() })
          }
        />
      ),
    },
    {
      id: 3,
      title: "What's your monthly rent budget?",
      subtitle: "This helps us find accommodation within your range",
      input: (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-charcoal-light mb-1 block">Minimum (€/month)</label>
            <input
              type="number"
              className="input-field text-lg"
              value={form.rentBudgetMin}
              onChange={(e) =>
                setForm({ ...form, rentBudgetMin: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="text-sm text-charcoal-light mb-1 block">Maximum (€/month)</label>
            <input
              type="number"
              className="input-field text-lg"
              value={form.rentBudgetMax}
              onChange={(e) =>
                setForm({ ...form, rentBudgetMax: Number(e.target.value) })
              }
            />
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "What's your university budget?",
      subtitle: "Annual tuition range in euros",
      input: (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-charcoal-light mb-1 block">Minimum (€/year)</label>
            <input
              type="number"
              className="input-field text-lg"
              value={form.universityBudgetMin}
              onChange={(e) =>
                setForm({ ...form, universityBudgetMin: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="text-sm text-charcoal-light mb-1 block">Maximum (€/year)</label>
            <input
              type="number"
              className="input-field text-lg"
              value={form.universityBudgetMax}
              onChange={(e) =>
                setForm({ ...form, universityBudgetMax: Number(e.target.value) })
              }
            />
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: "Which countries interest you?",
      subtitle: "Choose up to 3 countries",
      input: (
        <div className="space-y-3">
          <p className="text-sm text-charcoal-light">{form.targetCountries.length}/3 selected</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { code: "DE", name: "🇩🇪 Germany" },
              { code: "NL", name: "🇳🇱 Netherlands" },
              { code: "FR", name: "🇫🇷 France" },
              { code: "IT", name: "🇮🇹 Italy" },
              { code: "ES", name: "🇪🇸 Spain" },
              { code: "SE", name: "🇸🇪 Sweden" },
            ].map((country) => (
              <button
                key={country.code}
                type="button"
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  form.targetCountries.includes(country.code)
                    ? "border-teal bg-primary-50 text-teal shadow-sm"
                    : "border-cream-400 hover:border-primary-300 text-charcoal bg-white"
                }`}
                onClick={() => {
                  const has = form.targetCountries.includes(country.code);
                  const newCountries = has
                    ? form.targetCountries.filter((c) => c !== country.code)
                    : form.targetCountries.length < 3
                      ? [...form.targetCountries, country.code]
                      : form.targetCountries;
                  setForm({ ...form, targetCountries: newCountries });
                }}
              >
                {country.name}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: "What degree level are you looking for?",
      subtitle: "We'll match programs to this level",
      input: (
        <div className="space-y-3">
          {[
            { value: "BACHELORS", label: "Bachelor's Degree", icon: "🎓" },
            { value: "MASTERS", label: "Master's Degree", icon: "📚" },
            { value: "PHD", label: "PhD", icon: "🔬" },
            { value: "DIPLOMA", label: "Diploma", icon: "📜" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 ${
                form.degreeLevels.includes(option.value)
                  ? "border-teal bg-primary-50 text-teal shadow-sm"
                  : "border-cream-400 hover:border-primary-300 text-charcoal bg-white"
              }`}
              onClick={() => setForm({ ...form, degreeLevels: [option.value] })}
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      id: 7,
      title: "What's your language level (CEFR)?",
      subtitle: "Used for program and visa guidance",
      input: (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CEFR_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                form.cefrLevel === level
                  ? "border-teal bg-primary-50 text-teal"
                  : "border-cream-400 hover:border-primary-300 bg-white"
              }`}
              onClick={() => setForm({ ...form, cefrLevel: level })}
            >
              {level}
            </button>
          ))}
        </div>
      ),
    },
    {
      id: 8,
      title: "When would you like to start?",
      subtitle: "We'll surface programs with the right deadlines",
      input: (
        <input
          className="input-field text-lg"
          type="date"
          value={form.desiredStart}
          onChange={(e) => setForm({ ...form, desiredStart: e.target.value })}
        />
      ),
    },
  ];

  const currentQuestion = questions[step - 1];

  async function next() {
    if (step < questions.length) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nationalityCode: form.nationalityCode,
            budgetMinMonthly: form.rentBudgetMin,
            budgetMaxMonthly: form.rentBudgetMax,
            universityBudgetMin: form.universityBudgetMin,
            universityBudgetMax: form.universityBudgetMax,
            targetCountries: form.targetCountries.slice(0, 3),
            degreeLevels: form.degreeLevels,
            cefrLevel: form.cefrLevel,
            desiredStart: form.desiredStart,
            markIntakeComplete: true,
            aiPromptStep: 1,
          }),
        });

        if (!res.ok) throw new Error("Failed to save profile");
        router.push("/chat");
      } catch (err) {
        console.error("Error saving profile:", err);
        alert("Could not save your profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  }

  function back() {
    if (step > 1) setStep(step - 1);
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return form.nationalityCode.trim() !== "";
      case 3:
        return form.rentBudgetMin > 0 && form.rentBudgetMax > form.rentBudgetMin;
      case 4:
        return (
          form.universityBudgetMin >= 0 &&
          form.universityBudgetMax >= form.universityBudgetMin
        );
      case 5:
        return form.targetCountries.length >= 1 && form.targetCountries.length <= 3;
      case 6:
        return form.degreeLevels.length > 0;
      case 7:
        return !!form.cefrLevel;
      case 8:
        return form.desiredStart !== "";
      default:
        return false;
    }
  };

  if (authStatus === "loading" || checkingProfile) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-fade-in px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-cream-300 p-6 sm:p-8 w-full max-w-2xl">
        <div className="mb-6">
          <Sprint1FlowSteps activeStep={3} compact />
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: "var(--ink-faint)" }}>
              Profile · Step {step} of {questions.length}
            </span>
            <span className="text-sm font-medium" style={{ color: "var(--accent)" }}>
              {Math.round((step / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full rounded-full h-1.5" style={{ background: "var(--hairline-strong)" }}>
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(step / questions.length) * 100}%`, background: "var(--accent)" }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2" style={{ color: "var(--ink)" }}>{currentQuestion.title}</h1>
          <p className="text-lg" style={{ color: "var(--ink-soft)" }}>{currentQuestion.subtitle}</p>
        </div>

        <div className="mb-8">{currentQuestion.input}</div>

        <div className="flex justify-between items-center">
          <button
            className="px-5 py-2.5 text-charcoal-light hover:text-teal transition-colors font-medium"
            onClick={back}
            disabled={step === 1 || loading}
          >
            {step > 1 ? "← Back" : ""}
          </button>

          <button
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
              canProceed() && !loading
                ? "btn-accent shadow-md hover:shadow-lg"
                : "bg-cream-300 text-charcoal-light/50 cursor-not-allowed"
            }`}
            onClick={next}
            disabled={!canProceed() || loading}
          >
            {loading && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {step === questions.length ? "Start AI Guide →" : "Continue →"}
          </button>
        </div>

        <p className="text-center text-xs text-charcoal-light mt-6">
          Need to update later?{" "}
          <Link href="/profile" className="text-teal underline">
            Profile settings
          </Link>
        </p>
      </div>
    </div>
  );
}
