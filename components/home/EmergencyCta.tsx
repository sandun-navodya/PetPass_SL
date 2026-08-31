'use client';

import React from 'react';

export default function EmergencyCta() {
  return (
    <section className="py-12 bg-palette-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-palette-primaryDark to-palette-primary p-8 sm:p-12 shadow-2xl text-white">
          {/* Geometric Watermark */}
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" fill="currentColor">
              <path d="M45,-76C58,-69,68,-57,76,-44C84,-30,89,-15,88,-0.5C87,14,80,28,72,41C64,53,55,65,42,73C30,81,15,86,-0.5,87C-16,88,-32,85,-45,77C-58,70,-69,57,-76,43C-84,29,-88,14,-87,-0.5C-86,-15,-80,-30,-71,-42C-62,-54,-50,-64,-37,-72C-24,-80,-12,-86,1,-87C14,-89,28,-86,45,-76Z" />
            </svg>
          </div>

          <div className="relative max-w-2xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-wider">
              Emergency & Support
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug">
              Need Immediate Veterinary Care in Sri Lanka?
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Find 24/7 on-call clinics, pet ambulance services, and emergency animal dispensaries in
              Colombo, Kandy, Galle, and major cities.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="tel:1990"
                className="px-6 py-3 rounded-xl bg-palette-surface text-palette-primaryDark font-bold text-sm hover:bg-palette-cream transition shadow-md flex items-center gap-2"
              >
                <span>📞 Call 24/7 Helpline</span>
              </a>
              <a
                href="#clinics"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition"
              >
                Browse Emergency Clinics
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}