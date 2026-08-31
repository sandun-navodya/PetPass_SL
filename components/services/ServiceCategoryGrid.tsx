'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export interface CategoryCardData {
  categoryID: number;
  categoryName: string;
  description: string | null;
  icon: string | null;
  logoUrl: string | null;
  providersCount?: number;
}

interface ServiceCategoryGridProps {
  categories: CategoryCardData[];
  loading: boolean;
}

export default function ServiceCategoryGrid({ categories, loading }: ServiceCategoryGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <section className="py-16 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with View Toggles */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-palette-charcoal tracking-tight">
              Browse by Category
            </h2>
            <p className="text-xs text-palette-muted mt-1 font-medium">
              Select a category to view specialized providers and clinics.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-palette-border shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-palette-cream text-[#0d5c52]'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-palette-cream text-[#0d5c52]'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="List View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Dynamic Category Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={`cat-skeleton-${i}`}
                className="h-48 bg-white border border-palette-border rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white border border-palette-border rounded-3xl p-12 text-center max-w-md mx-auto">
            <span className="text-3xl">🔍</span>
            <h3 className="text-base font-bold text-palette-charcoal mt-3">No categories found</h3>
            <p className="text-xs text-palette-muted mt-1">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col gap-4'
            }
          >
            {categories.map((cat) => (
              <div
                key={cat.categoryID}
                className="group bg-white rounded-3xl p-7 border border-palette-border hover:border-teal-200 hover:shadow-xl transition-all duration-200 flex flex-col justify-between relative"
              >
                <div>
                  {/* Card Top Row: Logo & Provider Pill */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#A8DCC8]/30 text-[#0d5c52] flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 group-hover:scale-105 transition">
                      {cat.logoUrl ? (
                        <img
                          src={cat.logoUrl}
                          alt={cat.categoryName}
                          className="w-7 h-7 object-contain"
                        />
                      ) : (
                        <span>{cat.icon || '🐾'}</span>
                      )}
                    </div>

                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px]">
                      {cat.providersCount ?? 120} Providers
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-palette-charcoal group-hover:text-[#0d5c52] transition">
                    {cat.categoryName}
                  </h3>
                  <p className="text-xs text-palette-muted leading-relaxed mt-2 line-clamp-2">
                    {cat.description || 'Specialized and licensed pet services provided across the island.'}
                  </p>
                </div>

                {/* Explore Link Action */}
                <div className="pt-6 mt-4 border-t border-slate-50">
                  <Link
                    href={`/clinics?category=${cat.categoryID}`}
                    className="text-xs font-bold text-[#0d5c52] hover:text-[#09443c] flex items-center gap-1.5 group-hover:translate-x-1 transition duration-150"
                  >
                    <span>Explore Services</span>
                    <span className="text-sm leading-none">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}