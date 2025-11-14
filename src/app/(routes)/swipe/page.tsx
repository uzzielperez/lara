"use client";
import { useEffect, useMemo, useState } from "react";
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
  const [programs, setPrograms] = useState<ProgramCard[]>([]);
  const [cursor, setCursor] = useState(0);
  const [filters, setFilters] = useState({ country: "", maxTuition: "", deadlineBefore: "" });
  const [showAll, setShowAll] = useState(false);

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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Discover programs</h1>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Swipe Mode" : "Show All"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input className="border p-2 rounded" placeholder="Country (e.g., DE)" value={filters.country} onChange={(e) => setFilters({ ...filters, country: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Max tuition annual (cents)" value={filters.maxTuition} onChange={(e) => setFilters({ ...filters, maxTuition: e.target.value })} />
        <input className="border p-2 rounded" type="date" value={filters.deadlineBefore} onChange={(e) => setFilters({ ...filters, deadlineBefore: e.target.value })} />
      </div>

      {showAll ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((program) => (
            <div key={program.id} className="border rounded p-4 space-y-3 bg-white shadow-sm text-gray-900">
              <div className="text-lg font-medium text-gray-900">{program.title}</div>
              <div className="text-sm text-gray-700">{program.school}</div>
              <div className="text-sm text-gray-800">{program.city}, {program.countryCode}</div>
              <div className="text-sm text-gray-800">Tuition: €{program.tuitionAnnual?.toLocaleString() ?? 0}</div>
              <div className="text-sm text-gray-800">Deadline: {program.applicationDeadline ? new Date(program.applicationDeadline).toLocaleDateString() : "N/A"}</div>
              <div className="flex gap-2 pt-2">
                <button 
                  className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900 hover:bg-gray-50 bg-white" 
                  onClick={() => swipe("LEFT")}
                >
                  Nope
                </button>
                <button 
                  className="px-3 py-1 bg-black text-white rounded text-sm hover:bg-gray-800" 
                  onClick={() => swipe("RIGHT")}
                >
                  Interested
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No programs matching filters.
            </div>
          )}
        </div>
      ) : (
        <>
          {current ? (
            <div className="border rounded p-6 space-y-3 bg-white text-gray-900">
              <div className="text-lg font-medium text-gray-900">{current.title}</div>
              <div className="text-sm text-gray-700">{current.school}</div>
              <div className="text-sm text-gray-800">{current.city}, {current.countryCode}</div>
              <div className="text-sm text-gray-800">Tuition: €{current.tuitionAnnual?.toLocaleString() ?? 0}</div>
              <div className="text-sm text-gray-800">Deadline: {current.applicationDeadline ? new Date(current.applicationDeadline).toLocaleDateString() : "N/A"}</div>
              <div className="flex gap-4 pt-4">
                <button className="px-4 py-2 border border-gray-300 rounded text-gray-900 hover:bg-gray-50 bg-white" onClick={() => swipe("LEFT")}>Nope</button>
                <button className="px-4 py-2 bg-black text-white rounded" onClick={() => swipe("RIGHT")}>Interested</button>
              </div>
              <AccommodationList city={current.city} countryCode={current.countryCode} />
            </div>
          ) : (
            <div>No more programs matching filters.</div>
          )}
        </>
      )}
    </div>
  );
}


