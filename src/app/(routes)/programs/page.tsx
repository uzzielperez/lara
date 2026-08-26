"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { DISCOVERY_ROUTES } from "@/lib/discovery-routes";
import { signInUrl } from "@/lib/sprint1-flow";

type ProgramCard = {
  id: string;
  title: string;
  school: string;
  city: string;
  countryCode: string;
  tuitionAnnual?: number | null;
  applicationDeadline?: string | null;
};

type ProfileDefaults = {
  targetCountries: string[];
  universityBudgetMax: number | null;
  shortlistNeedsRefresh: boolean;
};

const COUNTRY_FLAGS: Record<string, string> = {
  DE: "🇩🇪",
  NL: "🇳🇱",
  FR: "🇫🇷",
  ES: "🇪🇸",
  GB: "🇬🇧",
  CH: "🇨🇭",
  SE: "🇸🇪",
};

export default function ProgramsPage() {
  const { data: session, status: authStatus } = useSession();
  const [programs, setPrograms] = useState<ProgramCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileDefaults, setProfileDefaults] = useState<ProfileDefaults | null>(null);
  const [usingProfileDefaults, setUsingProfileDefaults] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    country: "",
    maxTuition: "",
    deadlineBefore: "",
  });
  const [savedPrograms, setSavedPrograms] = useState<Set<string>>(new Set());
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetch("/api/programs").then((r) => r.json()), fetch("/api/profile").then((r) => r.json())])
      .then(([programData, profileData]) => {
        setPrograms(programData.programs ?? []);

        if (profileData.complete && profileData.profile) {
          const countries = Array.isArray(profileData.profile.targetCountries)
            ? (profileData.profile.targetCountries as string[])
            : [];
          const maxBudget = profileData.profile.universityBudgetMax ?? null;

          setProfileDefaults({
            targetCountries: countries,
            universityBudgetMax: maxBudget,
            shortlistNeedsRefresh: Boolean(profileData.shortlistNeedsRefresh),
          });

          setFilters({
            country: countries[0] ?? "",
            maxTuition: maxBudget != null ? String(maxBudget) : "",
            deadlineBefore: "",
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return programs.filter((p) => {
      const okSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.school.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.countryCode.toLowerCase().includes(q);
      const okCountry =
        !filters.country || p.countryCode === filters.country.toUpperCase();
      const okTuition =
        !filters.maxTuition || (p.tuitionAnnual ?? 0) <= Number(filters.maxTuition);
      const okDeadline =
        !filters.deadlineBefore ||
        (p.applicationDeadline
          ? new Date(p.applicationDeadline) <= new Date(filters.deadlineBefore)
          : true);
      return okSearch && okCountry && okTuition && okDeadline;
    });
  }, [programs, search, filters]);

  function resetToProfileDefaults() {
    if (!profileDefaults) return;
    setUsingProfileDefaults(true);
    setFilters({
      country: profileDefaults.targetCountries[0] ?? "",
      maxTuition:
        profileDefaults.universityBudgetMax != null
          ? String(profileDefaults.universityBudgetMax)
          : "",
      deadlineBefore: "",
    });
    setSearch("");
  }

  function clearAllFilters() {
    setUsingProfileDefaults(false);
    setFilters({ country: "", maxTuition: "", deadlineBefore: "" });
    setSearch("");
  }

  async function saveToApplications(programId: string) {
    if (!session) {
      setSaveMessage("Sign in to save programs to your tracker");
      setTimeout(() => setSaveMessage(null), 4000);
      return;
    }

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId, status: "SAVED" }),
      });

      if (res.ok) {
        setSavedPrograms((prev) => new Set([...prev, programId]));
        setSaveMessage("Saved to your applications");
        setTimeout(() => setSaveMessage(null), 2000);
      }
    } catch (error) {
      console.error("Error saving program:", error);
      setSaveMessage("Could not save program");
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-28">
        <div
          className="w-10 h-10 border-2 rounded-full animate-spin"
          style={{ borderColor: "var(--hairline-strong)", borderTopColor: "var(--ink)" }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 animate-fade-in space-y-6">
      {authStatus === "unauthenticated" && (
        <div
          className="rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 text-sm"
          style={{ background: "rgba(199,93,58,0.08)", border: "1px solid rgba(199,93,58,0.2)", color: "var(--ink)" }}
        >
          <p className="flex-1">
            Browse freely — sign up free to save programs and get a personalized study-abroad plan.
          </p>
          <Link href={signInUrl("/programs")} className="btn-primary text-sm !py-2.5 whitespace-nowrap">
            Sign up free
          </Link>
        </div>
      )}

      {saveMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <div className="px-5 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-3" style={{ background: "var(--ink)" }}>
            <span>{saveMessage}</span>
            {!session && saveMessage.includes("Sign in") && (
              <Link href={signInUrl("/programs")} className="underline font-semibold">
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Program Discovery</p>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--ink)" }}>
            Browse programs
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--ink-soft)" }}>
            Search partner programs and save matches to track your applications.
          </p>
        </div>
        <Link href={DISCOVERY_ROUTES.applications} className="btn-outline text-sm !py-2.5">
          My applications →
        </Link>
      </div>

      {profileDefaults?.shortlistNeedsRefresh && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(199,93,58,0.08)", border: "1px solid rgba(199,93,58,0.2)", color: "var(--ink)" }}
        >
          Your profile changed — refresh suggestions when your shortlist is ready.{" "}
          <Link href="/profile" className="underline font-medium">
            View profile
          </Link>
        </div>
      )}

      {profileDefaults && usingProfileDefaults && (
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ background: "rgba(199,93,58,0.12)", color: "var(--accent)" }}
          >
            Based on your profile
          </span>
          <button type="button" onClick={clearAllFilters} className="text-xs underline" style={{ color: "var(--ink-faint)" }}>
            Clear defaults
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          className="input-field lg:col-span-2"
          placeholder="Search programs, schools, cities…"
          value={search}
          onChange={(e) => {
            setUsingProfileDefaults(false);
            setSearch(e.target.value);
          }}
        />
        <input
          className="input-field"
          placeholder="Country (e.g. ES, DE)"
          value={filters.country}
          onChange={(e) => {
            setUsingProfileDefaults(false);
            setFilters({ ...filters, country: e.target.value });
          }}
        />
        <input
          className="input-field"
          placeholder="Max tuition €/year"
          value={filters.maxTuition}
          onChange={(e) => {
            setUsingProfileDefaults(false);
            setFilters({ ...filters, maxTuition: e.target.value });
          }}
        />
        <input
          className="input-field sm:col-span-2 lg:col-span-1"
          type="date"
          value={filters.deadlineBefore}
          onChange={(e) => {
            setUsingProfileDefaults(false);
            setFilters({ ...filters, deadlineBefore: e.target.value });
          }}
        />
        <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
          {profileDefaults && (
            <button type="button" onClick={resetToProfileDefaults} className="btn-outline text-sm !py-2.5">
              Reset to profile
            </button>
          )}
          <button type="button" onClick={clearAllFilters} className="btn-outline text-sm !py-2.5">
            Clear all
          </button>
        </div>
      </div>

      <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
        {filtered.length} program{filtered.length === 1 ? "" : "s"}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((program) => (
          <article key={program.id} className="premium-card !p-5 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <span className="text-lg">{COUNTRY_FLAGS[program.countryCode] ?? "🌍"}</span>
              <span className="text-xs font-medium" style={{ color: "var(--ink-faint)" }}>
                {program.countryCode}
              </span>
            </div>
            <h2 className="font-bold text-lg mb-1" style={{ color: "var(--ink)" }}>
              {program.title}
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--ink-soft)" }}>
              {program.school}
            </p>
            <div className="space-y-1.5 text-sm mb-5 flex-1" style={{ color: "var(--ink-soft)" }}>
              <p>{program.city}, {program.countryCode}</p>
              <p>€{program.tuitionAnnual?.toLocaleString() ?? 0}/year</p>
              <p>
                {program.applicationDeadline
                  ? `Deadline ${new Date(program.applicationDeadline).toLocaleDateString()}`
                  : "Rolling admissions"}
              </p>
            </div>
            <button
              type="button"
              className={`w-full text-sm !py-2.5 rounded-xl font-medium transition-colors ${
                savedPrograms.has(program.id) ? "btn-outline" : "btn-primary"
              }`}
              onClick={() => saveToApplications(program.id)}
              disabled={savedPrograms.has(program.id)}
            >
              {savedPrograms.has(program.id) ? "Saved" : "Save to applications"}
            </button>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="mb-4" style={{ color: "var(--ink-soft)" }}>
            No programs match your search and filters.
          </p>
          <button type="button" onClick={clearAllFilters} className="btn-primary text-sm">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
