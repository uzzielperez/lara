"use client";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import AccommodationList from "./components/AccommodationList";

type ProgramCard = {
  id: string;
  title: string;
  school: string;
  city: string;
  countryCode: string;
  tuitionAnnual?: number | null;
  applicationDeadline?: string | null;
};

export default function SwipePage() {
  const { data: session } = useSession();
  const [programs, setPrograms] = useState<ProgramCard[]>([]);
  const [cursor, setCursor] = useState(0);
  const [filters, setFilters] = useState({ country: "", maxTuition: "", deadlineBefore: "" });
  const [showAll, setShowAll] = useState(false);
  const [savedPrograms, setSavedPrograms] = useState<Set<string>>(new Set());
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/programs")
      .then((r) => r.json())
      .then((data) => setPrograms(data.programs));
  }, []);

  const filtered = useMemo(() => {
    return programs.filter((p) => {
      const okCountry = !filters.country || p.countryCode === filters.country.toUpperCase();
      const okTuition = !filters.maxTuition || (p.tuitionAnnual ?? 0) <= Number(filters.maxTuition);
      const okDeadline = !filters.deadlineBefore || (p.applicationDeadline ? new Date(p.applicationDeadline) <= new Date(filters.deadlineBefore) : true);
      return okCountry && okTuition && okDeadline;
    });
  }, [programs, filters]);

  const current = filtered[cursor];

  function swipe(direction: "LEFT" | "RIGHT") {
    if (!current) return;
    fetch("/api/swipe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ programId: current.id, direction }) });
    setCursor((c) => Math.min(filtered.length - 1, c + 1));
  }

  async function saveToApplications(programId: string) {
    if (!session) {
      setSaveMessage("Please sign in to save programs");
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId, status: "SAVED" }),
      });
      
      if (res.ok) {
        setSavedPrograms(prev => new Set([...prev, programId]));
        setSaveMessage("✓ Saved to your applications!");
        setTimeout(() => setSaveMessage(null), 2000);
      }
    } catch (error) {
      console.error("Error saving program:", error);
      setSaveMessage("Error saving program");
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Toast Message */}
      {saveMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="px-6 py-3 bg-teal text-white rounded-lg shadow-lg font-medium">
            {saveMessage}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="section-heading">Discover Programs</h1>
          <p className="text-charcoal-light">Find your perfect study program in Europe</p>
        </div>
        <button 
          className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            showAll 
              ? "bg-white text-teal border-2 border-teal hover:bg-primary-50" 
              : "btn-accent"
          }`}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "← Swipe Mode" : "Show All →"}
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input 
          className="input-field" 
          placeholder="Country (e.g., DE, ES, NL)" 
          value={filters.country} 
          onChange={(e) => setFilters({ ...filters, country: e.target.value })} 
        />
        <input 
          className="input-field" 
          placeholder="Max tuition (€/year)" 
          value={filters.maxTuition} 
          onChange={(e) => setFilters({ ...filters, maxTuition: e.target.value })} 
        />
        <input 
          className="input-field" 
          type="date" 
          value={filters.deadlineBefore} 
          onChange={(e) => setFilters({ ...filters, deadlineBefore: e.target.value })} 
        />
      </div>

      {showAll ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((program, i) => (
            <div 
              key={program.id} 
              className="card animate-slide-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                  {program.countryCode}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-teal mb-1">{program.title}</h3>
              <p className="text-sm text-charcoal-light mb-3">{program.school}</p>
              
              <div className="space-y-1 text-sm text-charcoal mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-charcoal-light">📍</span>
                  {program.city}, {program.countryCode}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-charcoal-light">💰</span>
                  €{program.tuitionAnnual?.toLocaleString() ?? 0}/year
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-charcoal-light">📅</span>
                  {program.applicationDeadline ? new Date(program.applicationDeadline).toLocaleDateString() : "Rolling"}
                </div>
              </div>
              
              <div className="flex gap-2 pt-3 border-t border-cream-300">
                <button 
                  className="flex-1 px-3 py-2 border-2 border-cream-400 rounded-lg text-sm text-charcoal hover:bg-cream-200 transition-colors" 
                  onClick={() => swipe("LEFT")}
                >
                  Skip
                </button>
                <button 
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    savedPrograms.has(program.id)
                      ? "bg-green-100 text-green-700"
                      : "bg-primary-100 text-primary-700 hover:bg-primary-200"
                  }`}
                  onClick={() => saveToApplications(program.id)}
                  disabled={savedPrograms.has(program.id)}
                >
                  {savedPrograms.has(program.id) ? "✓ Saved" : "📌 Save"}
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="w-16 h-16 bg-cream-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <p className="text-charcoal-light">No programs matching your filters.</p>
              <button 
                onClick={() => setFilters({ country: "", maxTuition: "", deadlineBefore: "" })}
                className="mt-4 text-teal font-medium hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {current ? (
            <div className="card-accent max-w-lg mx-auto">
              <div className="flex items-start justify-between mb-4">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                  {current.countryCode}
                </span>
                <span className="text-sm text-charcoal-light">
                  {cursor + 1} of {filtered.length}
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-teal mb-2">{current.title}</h3>
              <p className="text-charcoal-light mb-4">{current.school}</p>
              
              <div className="space-y-2 text-charcoal mb-6">
                <div className="flex items-center gap-3 p-3 bg-cream-100 rounded-lg">
                  <span>📍</span>
                  <span>{current.city}, {current.countryCode}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-cream-100 rounded-lg">
                  <span>💰</span>
                  <span>€{current.tuitionAnnual?.toLocaleString() ?? 0}/year</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-cream-100 rounded-lg">
                  <span>📅</span>
                  <span>Deadline: {current.applicationDeadline ? new Date(current.applicationDeadline).toLocaleDateString() : "Rolling admissions"}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  className="flex-1 btn-outline" 
                  onClick={() => swipe("LEFT")}
                >
                  ← Skip
                </button>
                <button 
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    savedPrograms.has(current.id)
                      ? "bg-green-100 text-green-700 border-2 border-green-200"
                      : "bg-primary-100 text-primary-700 hover:bg-primary-200 border-2 border-primary-200"
                  }`}
                  onClick={() => saveToApplications(current.id)}
                  disabled={savedPrograms.has(current.id)}
                >
                  {savedPrograms.has(current.id) ? "✓ Saved" : "📌 Save"}
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-cream-300">
                <AccommodationList city={current.city} countryCode={current.countryCode} />
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎉</span>
              </div>
              <h3 className="text-xl font-semibold text-teal mb-2">All caught up!</h3>
              <p className="text-charcoal-light">No more programs matching your filters.</p>
              <button 
                onClick={() => setFilters({ country: "", maxTuition: "", deadlineBefore: "" })}
                className="mt-4 btn-primary"
              >
                Clear filters & start over
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
