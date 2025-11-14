"use client";
import { useEffect, useState } from "react";

type Accommodation = {
  id: string;
  providerName: string;
  providerUrl: string;
  monthlyRent: number;
  currency: string;
  city: string;
  countryCode: string;
  description?: string | null;
};

export default function AccommodationList({ city, countryCode }: { city: string; countryCode: string }) {
  const [items, setItems] = useState<Accommodation[]>([]);

  useEffect(() => {
    if (!city || !countryCode) return;
    fetch(`/api/accommodations?city=${encodeURIComponent(city)}&country=${countryCode}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items));
  }, [city, countryCode]);

  if (!items.length) return null;

  return (
    <div className="space-y-2">
      <div className="font-medium text-gray-900">Places to stay nearby</div>
      <ul className="space-y-2">
        {items.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 border rounded p-2 bg-white text-gray-900">
            <div>
              <div className="text-sm text-gray-900">{a.providerName}</div>
              <div className="text-xs text-gray-600">{a.city}, {a.countryCode}</div>
              <div className="text-xs text-gray-700">{a.description}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-900">{a.monthlyRent} {a.currency}</div>
              <a href={a.providerUrl} target="_blank" className="px-3 py-1 bg-black text-white rounded text-sm">View</a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
