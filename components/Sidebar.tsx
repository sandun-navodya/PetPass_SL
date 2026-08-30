'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Pixel-accurate SVG icons matching the sidebar design
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
  </svg>
);

const ClinicsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2m-8 0h10a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2zm4 6h4m-2-2v4" />
  </svg>
);

const ServiceProvidersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-1a4 4 0 00-5-3.87M9 20H4v-1a4 4 0 015-3.87m0-7.13a4 4 0 110-8 4 4 0 010 8zm8 0a3.5 3.5 0 110-7 3.5 3.5 0 010 7z" />
  </svg>
);

const ServicesIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="5" cy="8" r="2.2" />
    <circle cx="10" cy="4.5" r="2.2" />
    <circle cx="15" cy="4.5" r="2.2" />
    <circle cx="19" cy="8" r="2.2" />
    <path d="M12 10.5c-3.3 0-6 2.3-6 5.5 0 2.8 2.2 4.5 4.5 4.5 1.5 0 2.2-.6 3.5-.6s2 .6 3.5.6c2.3 0 4.5-1.7 4.5-4.5 0-3.2-2.7-5.5-6-5.5z" />
  </svg>
);

const LocationsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a7 7 0 00-7 7c0 4.5 7 13 7 13s7-8.5 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
  </svg>
);

const SubmissionsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const MediaIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { label: 'Clinics', href: '/clinics', icon: ClinicsIcon },
  { label: 'Service Providers', href: '/providers', icon: ServiceProvidersIcon },
  { label: 'Services', href: '/services', icon: ServicesIcon },
  { label: 'Locations', href: '/locations', icon: LocationsIcon },
  { label: 'Submissions', href: '/submissions', icon: SubmissionsIcon },
  { label: 'Media', href: '/media', icon: MediaIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0d5c52] text-white flex flex-col justify-between shrink-0 shadow-xl min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="px-6 pt-7 pb-6">
          <h1 className="font-extrabold text-2xl tracking-tight text-white">PetPass SL</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#15796d] text-white shadow-sm'
                    : 'text-teal-100/80 hover:bg-[#11695e] hover:text-white'
                }`}
              >
                <div className={`shrink-0 ${isActive ? 'text-white' : 'text-teal-200/90'}`}>
                  <Icon />
                </div>
                <span className="tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Settings / Sign Out */}
      <div className="p-4 border-t border-[#126b60]">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 px-4 py-2.5 w-full text-left rounded-xl text-teal-200 hover:bg-[#11695e] hover:text-white text-sm font-semibold transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}