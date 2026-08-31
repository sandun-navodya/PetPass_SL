'use client';

import React, { useState, useEffect } from 'react';

interface Clinic {
  clinicID: number;
  clinicName: string;
  description: string;
  locationName: string;
  coverImageUrl?: string;
  logoUrl?: string;
  isFeatured: boolean;
}

const fallbackClinics: Clinic[] = [
  {
    clinicID: 1,
    clinicName: 'Colombo City Vets',
    description: 'Providing state-of-the-art medical care, surgery, and wellness programs for your pets.',
    locationName: 'Colombo 03',
    coverImageUrl: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&q=80&w=600',
    isFeatured: true,
  },
  {
    clinicID: 2,
    clinicName: 'Kandy Animal Hospital',
    description: 'Comprehensive 24/7 emergency care and specialized diagnostics serving the central province.',
    locationName: 'Peradeniya',
    coverImageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600',
    isFeatured: true,
  },
  {
    clinicID: 3,
    clinicName: 'Paws & Whiskers Spa',
    description: 'Premium grooming, dental care, and spa treatments to keep your pets looking and feeling healthy.',
    locationName: 'Negombo',
    coverImageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=600',
    isFeatured: true,
  },
];

export default function FeaturedClinics() {
  const [clinics, setClinics] = useState<Clinic[]>(fallbackClinics);

  useEffect(() => {
    fetch('/api/v1/clinics?limit=3&isFeatured=true')
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.data?.items?.length) {
          setClinics(payload.data.items);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="clinics" className="py-20 bg-palette-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-palette-primary">
            PREMIUM CARE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-palette-charcoal tracking-tight mt-1">
            Featured Clinics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {clinics.map((clinic) => (
            <div
              key={clinic.clinicID}
              className="bg-palette-surface rounded-3xl overflow-hidden border border-palette-border shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Clinic Cover Picture */}
                <div className="relative h-52 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={clinic.coverImageUrl || fallbackClinics[0].coverImageUrl}
                    alt={clinic.clinicName}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-4 right-4 bg-palette-mint/90 text-emerald-900 text-xs font-black px-3 py-1 rounded-full shadow-sm">
                    Featured
                  </span>
                </div>

                {/* Profile Overview */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-palette-primary/10 text-palette-primary flex items-center justify-center font-bold text-sm shrink-0">
                      🏥
                    </div>
                    <div>
                      <h3 className="font-extrabold text-palette-charcoal text-lg leading-snug">
                        {clinic.clinicName}
                      </h3>
                      <p className="text-xs text-palette-muted flex items-center gap-1">
                        <span>📍</span> {clinic.locationName}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-palette-muted leading-relaxed line-clamp-3">
                    {clinic.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="px-6 pb-6 pt-2">
                <button
                  onClick={() => alert(`Connecting with ${clinic.clinicName}`)}
                  className="w-full py-2.5 rounded-xl bg-palette-primary/10 hover:bg-palette-primary hover:text-white text-palette-primaryDark font-bold text-xs transition duration-150 flex items-center justify-center gap-2"
                >
                  <span>View Details</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}