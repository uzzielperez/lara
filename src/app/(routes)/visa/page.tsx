"use client";
import { useEffect, useState } from "react";

type Visa = {
  destinationCountryCode: string;
  summary: string;
  officialUrl?: string | null;
};

const COUNTRY_FLAGS: Record<string, string> = {
  DE: "🇩🇪",
  NL: "🇳🇱",
  FR: "🇫🇷",
  IT: "🇮🇹",
  ES: "🇪🇸",
  SE: "🇸🇪",
  AT: "🇦🇹",
  BE: "🇧🇪",
  PL: "🇵🇱",
  PT: "🇵🇹",
};

export default function VisaPage() {
  const [nationality, setNationality] = useState("PH");
  const [destination, setDestination] = useState("DE");
  const [items, setItems] = useState<Visa[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/visa?nationality=${nationality}`)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [nationality]);

  const current = items.find((v) => v.destinationCountryCode === destination);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="section-heading">Visa Requirements</h1>
        <p className="section-subheading">Check student visa requirements for your destination</p>
      </div>

      {/* Input Section */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-teal mb-2">Your Nationality</label>
            <input 
              className="input-field" 
              value={nationality} 
              onChange={(e) => setNationality(e.target.value.toUpperCase())} 
              placeholder="e.g., PH, IN, NG" 
            />
            <p className="text-xs text-charcoal-light mt-1">Enter your country code (e.g., PH for Philippines)</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-teal mb-2">Destination Country</label>
            <input 
              className="input-field" 
              value={destination} 
              onChange={(e) => setDestination(e.target.value.toUpperCase())} 
              placeholder="e.g., DE, ES, NL" 
            />
            <p className="text-xs text-charcoal-light mt-1">Enter destination code (e.g., DE for Germany)</p>
          </div>
        </div>
      </div>

      {/* Quick Country Selection */}
      <div className="flex flex-wrap gap-2 justify-center">
        {Object.entries(COUNTRY_FLAGS).map(([code, flag]) => (
          <button
            key={code}
            onClick={() => setDestination(code)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              destination === code
                ? "bg-teal text-white shadow-sm"
                : "bg-white border border-cream-400 text-charcoal hover:border-primary-300"
            }`}
          >
            {flag} {code}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="w-12 h-12 border-4 border-cream-400 border-t-teal rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-charcoal-light">Loading visa information...</p>
        </div>
      ) : current ? (
        <div className="card-accent animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{COUNTRY_FLAGS[current.destinationCountryCode] || "🌍"}</span>
            <div>
              <h3 className="text-xl font-bold text-teal">{current.destinationCountryCode} Student Visa</h3>
              <p className="text-sm text-charcoal-light">Requirements for {nationality} nationals</p>
            </div>
          </div>
          
          <div className="bg-cream-100 rounded-xl p-4 mb-4">
            <p className="text-charcoal leading-relaxed">{current.summary}</p>
          </div>
          
          {current.officialUrl && (
            <a 
              className="inline-flex items-center gap-2 text-teal font-medium hover:text-primary-600 transition-colors" 
              href={current.officialUrl} 
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>🔗</span>
              Official guidance website
              <span className="text-xs">↗</span>
            </a>
          )}
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-cream-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <h3 className="text-lg font-semibold text-teal mb-2">No information found</h3>
          <p className="text-charcoal-light">
            We don&apos;t have visa information for {COUNTRY_FLAGS[destination] || ""} {destination} yet.
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-center text-xs text-charcoal-light bg-cream-200 rounded-lg p-3">
        ⚠️ This information is for guidance only. Always verify requirements with the official embassy or consulate.
      </div>
    </div>
  );
}
