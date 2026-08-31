'use client';

import React from 'react';

const valueProps = [
  {
    icon: '🔍',
    title: 'Discover Easily',
    desc: 'Find highly-rated services based on real customer reviews and detailed profiles.',
    bgColor: 'bg-palette-primary/15 text-palette-primaryDark',
  },
  {
    icon: '📍',
    title: 'Search by Location',
    desc: 'Quickly locate the nearest vet clinics, grooming parlors, or pet shops when you need them most.',
    bgColor: 'bg-palette-mint/40 text-emerald-800',
  },
  {
    icon: '📅',
    title: 'Direct Care Contacts',
    desc: 'Connect directly with certified clinics and veterinarians with direct phone & WhatsApp links.',
    bgColor: 'bg-palette-peach/40 text-amber-900',
  },
  {
    icon: '🛡️',
    title: 'Verified Professionals',
    desc: 'We ensure all listed clinics and professionals meet quality standards for your peace of mind.',
    bgColor: 'bg-palette-primary/15 text-palette-primaryDark',
  },
];

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="py-20 bg-palette-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Visual Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=500"
                  alt="Pet checkup"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 bg-palette-mint/20 rounded-3xl border border-palette-mint/40 text-center">
                <p className="text-3xl font-black text-emerald-800">99%</p>
                <p className="text-xs font-semibold text-emerald-700 mt-1">Satisfaction Rate</p>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="p-6 bg-palette-primary/10 rounded-3xl border border-palette-primary/20 text-center">
                <p className="text-3xl font-black text-palette-primaryDark">24/7</p>
                <p className="text-xs font-semibold text-palette-primaryDark mt-1">Directory Access</p>
              </div>
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=500"
                  alt="Pet wellness"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Text / Feature Bullets */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-palette-primary">
                WHY CHOOSE US
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-palette-charcoal tracking-tight mt-1">
                Simplifying Pet Care in Sri Lanka
              </h2>
            </div>

            <div className="space-y-6">
              {valueProps.map((prop, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl ${prop.bgColor} flex items-center justify-center font-bold text-xl shrink-0 mt-1`}
                  >
                    {prop.icon}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-palette-charcoal text-base mb-1">
                      {prop.title}
                    </h3>
                    <p className="text-xs text-palette-muted leading-relaxed">{prop.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}