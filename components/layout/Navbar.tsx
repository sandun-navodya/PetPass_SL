'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-palette-surface/90 backdrop-blur-md border-b border-palette-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-palette-primary/15 text-palette-primary flex items-center justify-center font-bold text-xl group-hover:bg-palette-primary group-hover:text-white transition duration-200">
            🐾
          </div>
          <span className="font-extrabold text-xl sm:text-2xl text-palette-charcoal tracking-tight">
            PetPass<span className="text-palette-primary">SL</span>
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-semibold transition pb-1 ${
              pathname === '/'
                ? 'font-bold text-palette-primaryDark border-b-2 border-palette-primary'
                : 'text-palette-muted hover:text-palette-primaryDark'
            }`}
          >
            HOME
          </Link>
          <Link
            href="/categories"
            className={`text-sm font-semibold transition pb-1 ${
              pathname.startsWith('/categories')
                ? 'font-bold text-palette-primaryDark border-b-2 border-palette-primary'
                : 'text-palette-muted hover:text-palette-primaryDark'
            }`}
          >
            SERVICES
          </Link>
          <Link
            href="/#clinics"
            className="text-sm font-semibold text-palette-muted hover:text-palette-primaryDark transition pb-1"
          >
            CLINICS
          </Link>
          <Link
            href="/#why-us"
            className="text-sm font-semibold text-palette-muted hover:text-palette-primaryDark transition pb-1"
          >
            ABOUT
          </Link>
          <Link
            href="/#contact"
            className="text-sm font-semibold text-palette-muted hover:text-palette-primaryDark transition pb-1"
          >
            CONTACT
          </Link>
        </nav>

        {/* Right CTA Area */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="tel:1990"
            className="px-4 py-2.5 rounded-full bg-palette-mint/30 text-emerald-800 text-xs font-bold hover:bg-palette-mint/50 transition flex items-center gap-2 border border-palette-mint"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            24/7 Pet Helpline
          </a>

          <Link
            href="/login"
            className="w-10 h-10 rounded-full bg-palette-cream border border-palette-border text-palette-charcoal flex items-center justify-center font-bold hover:border-palette-primary transition shadow-sm"
            title="Admin Login"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-palette-charcoal rounded-lg hover:bg-palette-cream"
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-palette-surface border-b border-palette-border px-6 py-4 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className={`block text-sm ${
              pathname === '/' ? 'font-bold text-palette-primary' : 'font-medium text-palette-charcoal'
            }`}
          >
            HOME
          </Link>
          <Link
            href="/categories"
            onClick={() => setMobileOpen(false)}
            className={`block text-sm ${
              pathname.startsWith('/categories') ? 'font-bold text-palette-primary' : 'font-medium text-palette-charcoal'
            }`}
          >
            SERVICES
          </Link>
          <Link
            href="/#clinics"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-medium text-palette-charcoal"
          >
            CLINICS
          </Link>
          <Link
            href="/#why-us"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-medium text-palette-charcoal"
          >
            ABOUT
          </Link>
          <Link
            href="/#contact"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-medium text-palette-charcoal"
          >
            CONTACT
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-medium text-palette-primaryDark pt-2 border-t border-palette-border"
          >
            Admin Login
          </Link>
        </div>
      )}
    </header>
  );
}