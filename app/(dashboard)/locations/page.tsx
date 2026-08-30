'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api-client';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface LocationItem {
  locationID: number;
  locationName: string;
  locationType: 'Province' | 'District' | 'City';
  parentLocationID: number | null;
  isActive: boolean;
  createdAt: string;
}

export default function LocationsPage() {
  const [items, setItems] = useState<LocationItem[]>([]);
  const [allParents, setAllParents] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LocationItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form input fields
  const [formData, setFormData] = useState({
    locationName: '',
    locationType: 'Province',
    parentLocationID: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const typeParam = typeFilter ? `&locationType=${typeFilter}` : '';
      const res = await apiFetch(
        `/api/v1/locations?page=${page}&limit=10&search=${encodeURIComponent(search)}${typeParam}`
      );
      setItems(res.items);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter]);

  // Load parent locations for dropdown mapping
  const loadParentOptions = async () => {
    try {
      const res = await apiFetch('/api/v1/locations?limit=100');
      setAllParents(res.items);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  useEffect(() => {
    loadParentOptions();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({ locationName: '', locationType: 'Province', parentLocationID: '' });
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: LocationItem) => {
    setEditingItem(item);
    setFormData({
      locationName: item.locationName,
      locationType: item.locationType,
      parentLocationID: item.parentLocationID ? String(item.parentLocationID) : '',
    });
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        locationName: formData.locationName,
        locationType: formData.locationType,
        parentLocationID: formData.parentLocationID ? parseInt(formData.parentLocationID, 10) : null,
      };

      if (editingItem) {
        await apiFetch(`/api/v1/locations/${editingItem.locationID}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/api/v1/locations', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setIsFormOpen(false);
      loadData();
      loadParentOptions();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setFormLoading(true);
    try {
      await apiFetch(`/api/v1/locations/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Geographic Locations</h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage Provinces, Districts, and Cities in Sri Lanka</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#0d5c52] hover:bg-[#0a463e] text-white rounded-xl font-bold text-sm shadow transition flex items-center gap-2"
        >
          <span>＋</span> Add Location
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search location..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20 text-slate-800 placeholder:text-slate-400 focus:text-slate-900"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
        </div>

        <div className="flex items-center gap-2">
          {['', 'Province', 'District', 'City'].map((type) => (
            <button
              key={type}
              onClick={() => {
                setTypeFilter(type);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                typeFilter === type
                  ? 'bg-[#0d5c52] text-white'
                  : 'bg-slate-50 text-gray-600 hover:bg-slate-100'
              }`}
            >
              {type === '' ? 'All Types' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-slate-50/50">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Parent Reference</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
                  Loading geographic locations...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
                  No locations found matching filters.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const parent = allParents.find((p) => p.locationID === item.parentLocationID);
                return (
                  <tr key={item.locationID} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400 font-semibold">
                      #{item.locationID}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">{item.locationName}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                          item.locationType === 'Province'
                            ? 'bg-purple-50 text-purple-700'
                            : item.locationType === 'District'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {item.locationType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                      {parent ? `${parent.locationName} (${parent.locationType})` : '— (Root)'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.isActive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        {item.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(item.locationID)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingItem ? 'Edit Location' : 'Add New Location'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
              Location Name *
            </label>
            <input
              type="text"
              required
              value={formData.locationName}
              onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20 text-slate-800 placeholder:text-slate-400 focus:text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
              Location Type *
            </label>
            <select
              value={formData.locationType}
              onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20 text-slate-800 focus:text-slate-900"
            >
              <option value="Province">Province</option>
              <option value="District">District</option>
              <option value="City">City</option>
            </select>
          </div>

          {formData.locationType !== 'Province' && (
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">
                Parent Location *
              </label>
              <select
                value={formData.parentLocationID}
                onChange={(e) => setFormData({ ...formData, parentLocationID: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20 text-slate-800 focus:text-slate-900"
              >
                <option value="">Select Parent Region</option>
                {allParents
                  .filter((p) =>
                    formData.locationType === 'District'
                      ? p.locationType === 'Province'
                      : p.locationType === 'District'
                  )
                  .map((p) => (
                    <option key={p.locationID} value={p.locationID}>
                      {p.locationName} ({p.locationType})
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 rounded-xl bg-[#0d5c52] text-white text-sm font-bold shadow hover:bg-[#0a463e] disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : 'Save Location'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Location"
        message="Are you sure you want to deactivate this location? Connected clinics or child regions may be affected."
        isLoading={formLoading}
      />
    </div>
  );
}