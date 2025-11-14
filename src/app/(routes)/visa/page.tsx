"use client";
import { useEffect, useState } from "react";

type Visa = {
  destinationCountryCode: string;
  summary: string;
  officialUrl?: string | null;
};

export default function VisaPage() {
  const [nationality, setNationality] = useState("IN");
  const [destination, setDestination] = useState("DE");
  const [items, setItems] = useState<Visa[]>([]);

  useEffect(() => {
    fetch(`/api/visa?nationality=${nationality}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items));
  }, [nationality]);

  const current = items.find((v) => v.destinationCountryCode === destination);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Visa requirements</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input className="border p-2 rounded" value={nationality} onChange={(e) => setNationality(e.target.value.toUpperCase())} placeholder="Your nationality (e.g., IN)" />
        <input className="border p-2 rounded" value={destination} onChange={(e) => setDestination(e.target.value.toUpperCase())} placeholder="Destination (e.g., DE)" />
      </div>
      {current ? (
        <div className="border rounded p-4 space-y-2">
          <div className="font-medium">{current.destinationCountryCode}</div>
          <p className="text-sm leading-6">{current.summary}</p>
          {current.officialUrl && (
            <a className="text-blue-600 underline" href={current.officialUrl} target="_blank">Official guidance</a>
          )}
        </div>
      ) : (
        <div>No entry found for selected destination.</div>
      )}
    </div>
  );
}


