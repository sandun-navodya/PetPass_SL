'use client';

import React, { useEffect, useState } from 'react';

export default function Topbar() {
  const [admin, setAdmin] = useState<{ fullName?: string; role?: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin_user');
      if (stored) setAdmin(JSON.parse(stored));
    } catch {
      // fallback
    }
  }, []);

  return (
    <header className="h-16 bg-[#e6edf5] px-8 flex items-center justify-between shrink-0">
      <div className="relative w-96">
        <input
          type="text"
          placeholder="Search records, providers..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20 text-sm transition text-slate-800 placeholder:text-slate-400 focus:text-slate-900"
        />
        <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">🔍</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-600 shadow-sm hover:bg-gray-50">
          🔔
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800 leading-tight">
              {admin?.fullName || 'Admin User'}
            </p>
            <p className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
              {admin?.role || 'SUPER ADMIN'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0d5c52] text-white flex items-center justify-center font-bold text-sm shadow">
            {admin?.fullName ? admin.fullName.charAt(0) : 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}