import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#EEF2FF] text-[#25252B] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 4-Column Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 pb-16">
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-palette-primary/15 text-palette-primary flex items-center justify-center font-bold text-xl group-hover:bg-palette-primary group-hover:text-white transition duration-200">
            🐾
          </div>
          <span className="font-extrabold text-xl sm:text-2xl text-palette-charcoal tracking-tight">
            PetPass<span className="text-palette-primary">SL</span>
          </span>
        </Link>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-xs">
              Connecting Sri Lankan pet owners with premium veterinary services and care discovery.
            </p>
          </div>

          {/* Column 2: Explore Links */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1E293B]">
              EXPLORE
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#64748B] font-medium">
              <li>
                <Link href="/categories" className="hover:text-[#0d5c52] transition">
                  Pet Services
                </Link>
              </li>
              <li>
                <Link href="/#clinics" className="hover:text-[#0d5c52] transition">
                  Find Clinics
                </Link>
              </li>
              <li>
                <Link href="/#why-us" className="hover:text-[#0d5c52] transition">
                  Why Choose Us
                </Link>
              </li>
              <li>
                <a href="tel:1990" className="hover:text-[#0d5c52] transition">
                  Emergency Contacts
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: About Us (Replaced 'For Businesses') */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1E293B]">
              ABOUT US
            </h4>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              PetPass SL is Sri Lanka’s dedicated pet wellness directory, created to help pet parents easily discover certified veterinary hospitals, grooming salons, and 24/7 animal emergency centers across the island.
            </p>
          </div>

          {/* Column 4: Follow Us */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1E293B]">
              FOLLOW US
            </h4>
            <div className="flex items-center gap-3 pt-1">
              {/* Share Icon */}
              <a
                href="#"
                aria-label="Share"
                className="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-[#1E293B] flex items-center justify-center transition shadow-sm border border-slate-200/60"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </a>

              {/* Website / Globe Icon */}
              <a
                href="#"
                aria-label="Website"
                className="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-[#1E293B] flex items-center justify-center transition shadow-sm border border-slate-200/60"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 000 18M12 3a14 14 0 010 18" />
                </svg>
              </a>

              {/* Email / Mail Icon */}
              <a
                href="mailto:contact@petpass.lk"
                aria-label="Email"
                className="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-[#1E293B] flex items-center justify-center transition shadow-sm border border-slate-200/60"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 border-t border-[#CBD5E1]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-4">
          <p className="font-medium">
            © 2026 PetPass SL. All rights reserved.
          </p>

          <div className="flex items-center gap-6 font-semibold text-[#475569]">
            <Link href="/privacy" className="hover:underline hover:text-[#0d5c52] transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline hover:text-[#0d5c52] transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}