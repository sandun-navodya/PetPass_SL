'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface ClinicItem {
  clinicID: number;
  clinicName: string;
  email?: string;
  phone?: string;
  locationID: number;
  locationName: string;
  logoUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  servicesCount?: number;
  updatedAt?: string;
  createdAt: string;
}

export default function ClinicsPage() {
  const router = useRouter();
  const [clinics, setClinics] = useState<ClinicItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Pagination States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'true' | 'false'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Soft Delete Modal State
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClinics = useCallback(async () => {
    setLoading(true);
    try {
      let query = `/api/v1/clinics?page=${page}&limit=10&search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'all') {
        query += `&isActive=${statusFilter === 'active'}`;
      }
      if (featuredFilter !== 'all') {
        query += `&isFeatured=${featuredFilter === 'true'}`;
      }

      const res = await apiFetch(query);
      setClinics(res.items || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalItems(res.pagination?.totalItems || 0);
    } catch (err) {
      console.error('[FETCH_CLINICS_ERROR]:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, featuredFilter]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchClinics();
    }, 250);
    return () => clearTimeout(debounceTimer);
  }, [fetchClinics]);

  const handleToggleFeatured = async (id: number, current: boolean) => {
    try {
      await apiFetch(`/api/v1/clinics/${id}/featured`, {
        method: 'PATCH',
        body: JSON.stringify({ isFeatured: !current }),
      });
      setClinics((prev) =>
        prev.map((c) => (c.clinicID === id ? { ...c, isFeatured: !current } : c))
      );
    } catch (err) {
      console.error('[TOGGLE_FEATURED_ERROR]:', err);
    }
  };

  const handleToggleActive = async (id: number, current: boolean) => {
    try {
      await apiFetch(`/api/v1/clinics/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !current }),
      });
      setClinics((prev) =>
        prev.map((c) => (c.clinicID === id ? { ...c, isActive: !current } : c))
      );
    } catch (err) {
      console.error('[TOGGLE_ACTIVE_ERROR]:', err);
    }
  };

  const handleDeleteClinic = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/v1/clinics/${deleteTargetId}`, {
        method: 'DELETE',
      });
      setDeleteTargetId(null);
      fetchClinics();
    } catch (err) {
      console.error('[DELETE_CLINIC_ERROR]:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111928] tracking-tight">
            Clinics Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and oversee veterinary clinic network.
          </p>
        </div>
        <Link
          href="/clinics/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d5c52] hover:bg-[#0a463e] text-white font-bold text-sm shadow-md transition"
        >
          <span className="text-lg leading-none">+</span>
          <span>Add Clinic</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search clinics by name or location..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#f5f8fb] border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20"
          />
          <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="px-3.5 py-2.5 bg-[#f5f8fb] border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold focus:outline-none"
          >
            <option value="all">Status: All</option>
            <option value="active">Status: Active</option>
            <option value="inactive">Status: Inactive</option>
          </select>

          <select
            value={featuredFilter}
            onChange={(e) => {
              setFeaturedFilter(e.target.value as any);
              setPage(1);
            }}
            className="px-3.5 py-2.5 bg-[#f5f8fb] border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold focus:outline-none"
          >
            <option value="all">Featured: All</option>
            <option value="true">Featured: Yes</option>
            <option value="false">Featured: No</option>
          </select>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                <th className="px-6 py-4">Clinic Name</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Services</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4">Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Loading clinics data...
                  </td>
                </tr>
              ) : clinics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No clinics found matching criteria.
                  </td>
                </tr>
              ) : (
                clinics.map((item) => (
                  <tr key={item.clinicID} className="hover:bg-slate-50/60 transition">
                    {/* Clinic Name & Icon/Logo */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-[#0d5c52] flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                          {item.logoUrl ? (
                            <img
                              src={item.logoUrl}
                              alt={item.clinicName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            '✚'
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">{item.clinicName}</p>
                          <p className="text-xs text-slate-400">{item.email || 'No email registered'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 text-slate-700 font-semibold">{item.locationName}</td>

                    {/* Services Count Bubble */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                        {item.servicesCount || 0}
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(item.clinicID, item.isActive)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                          item.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {item.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Featured Switch */}
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(item.clinicID, item.isFeatured)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                          item.isFeatured ? 'bg-[#0d5c52]' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                            item.isFeatured ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Updated At */}
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                      {formatDate(item.updatedAt || item.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => router.push(`/clinics/${item.clinicID}`)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(item.clinicID)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div>
            Showing {clinics.length > 0 ? (page - 1) * 10 + 1 : 0} to{' '}
            {Math.min(page * 10, totalItems)} of {totalItems} entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                      page === p
                        ? 'bg-[#0d5c52] text-white'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                );
              }
              if (p === page - 2 || p === page + 2) {
                return <span key={p}>...</span>;
              }
              return null;
            })}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteClinic}
        title="Soft Delete Clinic"
        message="Are you sure you want to deactivate this veterinary clinic? It will be marked inactive and removed from public listings."
        isLoading={isDeleting}
      />
    </div>
  );
}