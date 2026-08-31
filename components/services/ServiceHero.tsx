'use client';

import React from 'react';
import Image from 'next/image';

interface ServiceHeroProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export default function ServiceHero({
  search,
  onSearchChange,
  onSearchSubmit,
}: ServiceHeroProps) {
  return (
    <section className="relative overflow-hidden bg-palette-cream pt-10 pb-16 lg:pt-14 lg:pb-20 border-b border-palette-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text & Search Area */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-6 h-1 rounded-full bg-[#0d5c52]" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0d5c52]">
                DIRECTORY
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-palette-charcoal tracking-tight leading-[1.15]">
              Explore Pet <br />
              <span className="relative inline-block">
                Services
                <span className="absolute left-0 -bottom-2 w-full h-1.5 bg-[#A8DCC8] rounded-full" />
              </span>
            </h1>

            <p className="text-sm sm:text-base text-palette-muted max-w-xl leading-relaxed">
              Find the right service for every stage of your pet&apos;s life. From routine grooming
              to specialized training, connect with trusted professionals across Sri Lanka.
            </p>

            {/* Quick Search Input */}
            <form onSubmit={onSearchSubmit} className="max-w-xl pt-2">
              <div className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-lg border border-palette-border flex items-center gap-3">
                <span className="pl-3 text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search for grooming, daycare, etc..."
                  className="w-full text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0d5c52] hover:bg-[#09443c] text-white text-xs font-bold transition shadow-sm shrink-0"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Right Visual Container */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white relative">
                <Image
                  src="/servicePage_img.jpg"
                  alt="Veterinarian grooming a golden retriever"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Floating Verified Pros Pill */}
              <div className="absolute -bottom-5 left-6 bg-white py-3 px-5 rounded-2xl shadow-xl border border-palette-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#A8DCC8]/40 text-emerald-800 flex items-center justify-center font-bold text-lg">
                  🛡️
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    VERIFIED PROS
                  </p>
                  <p className="text-lg font-black text-palette-charcoal leading-tight">500+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}