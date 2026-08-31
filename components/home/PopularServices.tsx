'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface ServiceCategory {
  categoryID: number;
  categoryName: string;
  description: string | null;
  icon: string | null;
  logoUrl: string | null;
}

export default function PopularServices() {
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Alternating background and text colors matching your Soft Lavender + Mint palette
  const badgeColors = [
    'bg-palette-primary/10 text-palette-primaryDark',
    'bg-palette-mint/40 text-emerald-800',
    'bg-palette-peach/30 text-amber-900',
    'bg-palette-primary/15 text-palette-primaryDark',
    'bg-palette-mint/30 text-emerald-800',
    'bg-palette-peach/25 text-amber-900',
  ];

  useEffect(() => {
    fetch('/api/v1/categories?limit=8&isActive=true')
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.data?.items && Array.isArray(payload.data.items)) {
          // Hard-cap strictly to a maximum of 8 items for the home page
          setServices(payload.data.items.slice(0, 8));
        }
      })
      .catch((err) => console.error('[LOAD_POPULAR_SERVICES_ERROR]:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="services" className="py-16 bg-palette-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-palette-primary">
              CATEGORIES
            </span>
            <h2 className="text-3xl font-extrabold text-palette-charcoal tracking-tight mt-1">
              Popular Services
            </h2>
          </div>
          <Link
            href="/categories"
            className="text-sm font-bold text-palette-primary hover:text-palette-primaryDark inline-flex items-center gap-1.5 transition mt-2 sm:mt-0"
          >
            <span>View All</span>
            <span>→</span>
          </Link>
        </div>

        {/* Dynamic Service Grid (Max 8 cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="h-44 bg-palette-cream/50 border border-palette-border rounded-2xl animate-pulse"
              />
            ))
          ) : services.length === 0 ? (
            <p className="col-span-full text-center py-8 text-palette-muted text-sm font-medium">
              No services currently available.
            </p>
          ) : (
            services.slice(0, 8).map((item, idx) => (
              <div
                key={item.categoryID}
                className="group bg-palette-cream/60 hover:bg-palette-surface border border-palette-border rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
              >
                {/* Icon / Logo Container with alternating colors */}
                <div
                  className={`w-14 h-14 rounded-2xl ${
                    badgeColors[idx % badgeColors.length]
                  } flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition duration-200 overflow-hidden`}
                >
                  {item.logoUrl ? (
                    <img
                      src={item.logoUrl}
                      alt={item.categoryName}
                      className="w-8 h-8 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span>{item.icon || '🐾'}</span>
                  )}
                </div>

                <h3 className="font-extrabold text-palette-charcoal text-base group-hover:text-palette-primaryDark transition">
                  {item.categoryName}
                </h3>

                <p className="text-xs text-palette-muted font-medium mt-1 truncate max-w-full w-full px-2">
                  {item.description || 'Specialized Pet Care'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}