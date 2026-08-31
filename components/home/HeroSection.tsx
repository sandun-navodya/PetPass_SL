'use client';

import React, { useState, useEffect } from 'react';

export default function HeroSection() {
  const [locations, setLocations] = useState<string[]>([
    'All Locations',
    'Colombo',
    'Gampaha',
    'Kandy',
    'Galle',
    'Negombo',
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoc, setSelectedLoc] = useState('All Locations');

  useEffect(() => {
    fetch('/api/v1/locations?limit=50')
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.data?.items) {
          const names: string[] = payload.data.items.map((i: any) => i.locationName);
          setLocations(['All Locations', ...Array.from(new Set(names))]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative overflow-hidden bg-palette-cream pt-10 pb-16 lg:pt-14 lg:pb-24">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-palette-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-palette-mint/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Headline & Search Container */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-palette-primary/15 text-palette-primaryDark text-xs font-bold tracking-wide uppercase">
              Veterinary & Pet Care Network in Sri Lanka
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-palette-charcoal tracking-tight leading-[1.15]">
              Find the Best Care for Your{' '}
              <span className="text-palette-primary block sm:inline">Best Friend</span>
            </h1>

            <p className="text-base sm:text-lg text-palette-muted max-w-xl font-normal leading-relaxed">
              Discover trusted veterinarians, certified grooming spas, and safe boarding facilities
              across Sri Lanka with verified pet-parent reviews.
            </p>

            {/* Filter Search Card */}
            <div className="bg-palette-surface rounded-2xl p-3 sm:p-4 shadow-xl border border-palette-border max-w-2xl mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                {/* Search Term */}
                <div className="sm:col-span-6 px-3 py-1">
                  <label className="block text-[11px] font-extrabold uppercase text-palette-muted tracking-wider mb-1">
                    What does your pet need?
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-palette-muted text-sm">🔍</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Grooming, Vet Clinic"
                      className="w-full text-sm font-medium text-palette-charcoal placeholder:text-palette-muted/60 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Location Selection */}
                <div className="sm:col-span-3 px-3 py-1 sm:border-l border-palette-border">
                  <label className="block text-[11px] font-extrabold uppercase text-palette-muted tracking-wider mb-1">
                    Where?
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-palette-primary text-sm">📍</span>
                    <select
                      value={selectedLoc}
                      onChange={(e) => setSelectedLoc(e.target.value)}
                      className="w-full text-xs font-bold text-palette-charcoal bg-transparent focus:outline-none cursor-pointer truncate"
                    >
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Trigger */}
                <div className="sm:col-span-3">
                  <a
                    href="#clinics"
                    className="w-full h-12 rounded-xl bg-palette-primary hover:bg-palette-primaryDark text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>Find Care</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Banner Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-palette-surface relative">
                <img
                  src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=900"
                  alt="Happy golden retriever with pet parent"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Verified Care Badge */}
              <div className="absolute -bottom-6 -left-6 bg-palette-surface p-4 rounded-2xl shadow-xl border border-palette-border flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-palette-mint/40 text-emerald-800 flex items-center justify-center font-bold text-xl">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-extrabold text-palette-charcoal">100+ Verified Clinics</p>
                  <p className="text-xs text-palette-muted">Island-wide licensed care</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}