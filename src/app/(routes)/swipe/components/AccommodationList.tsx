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
    <div className="space-y-3">
      <div className="font-semibold text-teal flex items-center gap-2">
        <span>🏠</span> Places to stay nearby
      </div>
      <ul className="space-y-2">
        {items.map((a) => (
          <li 
            key={a.id} 
            className="flex items-center justify-between gap-3 border border-cream-300 rounded-lg p-3 bg-cream-50 hover:bg-cream-100 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-charcoal">{a.providerName}</div>
              <div className="text-xs text-charcoal-light flex items-center gap-1">
                <span>📍</span> {a.city}, {a.countryCode}
              </div>
              {a.description && (
                <div className="text-xs text-charcoal-light mt-1 truncate">{a.description}</div>
              )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-sm font-semibold text-gold-600">
                €{a.monthlyRent}
                <span className="text-xs text-charcoal-light">/mo</span>
              </div>
              <a 
                href={a.providerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-teal text-white rounded-lg text-sm font-medium hover:bg-teal-light transition-colors"
              >
                View
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
