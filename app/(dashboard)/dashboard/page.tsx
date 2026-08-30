'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalClinics: 0,
    activeClinics: 0,
    totalServices: 0,
    totalLocations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [clinicsData, servicesData, locationsData] = await Promise.all([
          apiFetch('/api/v1/clinics?limit=1'),
          apiFetch('/api/v1/categories?limit=1'),
          apiFetch('/api/v1/locations?limit=1'),
        ]);

        setStats({
          totalClinics: clinicsData.pagination.totalItems,
          activeClinics: clinicsData.pagination.totalItems,
          totalServices: servicesData.pagination.totalItems,
          totalLocations: locationsData.pagination.totalItems,
        });
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Clinics</span>
            <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-sm font-bold">🏥</span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-gray-900">{loading ? '...' : stats.totalClinics}</span>
            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">↗ +12%</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Active Clinics</span>
            <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-sm font-bold">✓</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-gray-900">{loading ? '...' : stats.activeClinics}</span>
            <span className="text-xs text-gray-400 font-semibold">/ {stats.totalClinics}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Service Types</span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">🐾</span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-gray-900">{loading ? '...' : stats.totalServices}</span>
            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">Active</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Locations</span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">📍</span>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-gray-900">{loading ? '...' : stats.totalLocations}</span>
            <span className="text-xs font-bold text-gray-400">Total</span>
          </div>
        </div>
      </div>

      {/* Middle Analytical Overview Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Provider & Clinic Growth</h3>
              <p className="text-xs text-gray-400">New directory listings registered</p>
            </div>
          </div>
          <div className="h-56 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-slate-50/50 text-gray-400 text-sm">
            Activity Graph
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Listings by Category</h3>
              <p className="text-xs text-gray-400">Distribution across veterinary and pet services</p>
            </div>
          </div>
          <div className="h-56 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-slate-50/50 text-gray-400 text-sm">
            Category Breakdown Chart
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">Directory Quick Actions</h3>
            <p className="text-xs text-gray-400">Directly jump into primary data modules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/services"
            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-[#0d5c52] flex items-center justify-center font-bold text-lg">
                🐾
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#0d5c52]">Manage Services</h4>
                <p className="text-xs text-gray-400">Add, edit and organize pet care categories</p>
              </div>
            </div>
            <span className="text-[#0d5c52] font-bold text-lg">→</span>
          </Link>

          <Link
            href="/locations"
            className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/30 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg">
                📍
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-800">Manage Locations</h4>
                <p className="text-xs text-gray-400">Configure Provinces, Districts, and Cities</p>
              </div>
            </div>
            <span className="text-blue-800 font-bold text-lg">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}