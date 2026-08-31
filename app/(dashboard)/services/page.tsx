'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api-client';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface ServiceItem {
  categoryID: number;
  categoryName: string;
  description: string | null;
  icon: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function ServicesPage() {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);
  const [deleteError, setDeleteError] = useState('');

  // Form inputs
  const [formData, setFormData] = useState({ categoryName: '', description: '', icon: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);

  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const searchParam = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : '';
      const res = await apiFetch(`/api/v1/categories?page=${page}&limit=10${searchParam}`);
      setItems(res.items || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err: any) {
      console.error('[LOAD_SERVICES_ERROR]:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 250);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({ categoryName: '', description: '', icon: '' });
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoveLogo(false);
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: ServiceItem) => {
    setEditingItem(item);
    setFormData({
      categoryName: item.categoryName,
      description: item.description || '',
      icon: item.icon || '',
    });
    setSelectedFile(null);
    setPreviewUrl(item.logoUrl || null);
    setRemoveLogo(false);
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRemoveLogo(false);
    }
  };

  const handleRemoveSelectedLogo = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoveLogo(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setErrorMsg('');

    if (!formData.categoryName.trim()) {
      setErrorMsg('Category name is required');
      setFormLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      fd.append('categoryName', formData.categoryName.trim());
      if (formData.description) fd.append('description', formData.description.trim());
      if (formData.icon) fd.append('icon', formData.icon.trim());
      if (selectedFile) fd.append('logo', selectedFile);
      if (removeLogo) fd.append('removeLogo', 'true');

      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const endpoint = editingItem
        ? `/api/v1/categories/${editingItem.categoryID}`
        : '/api/v1/categories';

      const res = await fetch(endpoint, {
        method: editingItem ? 'PUT' : 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      const json = await res.json();
      if (!res.ok || json.status === 'error') {
        throw new Error(json.message || 'Operation failed');
      }

      setIsFormOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (item: ServiceItem) => {
    try {
      await apiFetch(`/api/v1/categories/${item.categoryID}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      loadData();
    } catch (err: any) {
      console.error('[TOGGLE_STATUS_ERROR]:', err);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteTarget) return;
    setFormLoading(true);
    setDeleteError('');

    try {
      await apiFetch(`/api/v1/categories/${deleteTarget.categoryID}`, { method: 'DELETE' });
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to permanently delete category.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Service Categories</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage directory pet care services and offerings</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#0d5c52] hover:bg-[#0a463e] text-white rounded-xl font-bold text-sm shadow transition flex items-center gap-2"
        >
          <span>＋</span> Add Service
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/70 flex items-center justify-between">
        <div className="relative w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search categories..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20 text-slate-800 placeholder:text-slate-400 focus:text-slate-900"
          />
          <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-400 text-sm">
                  Loading service records...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-400 text-sm">
                  No service categories found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.categoryID} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400 font-semibold">
                    #{item.categoryID}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100/60 flex items-center justify-center overflow-hidden shrink-0">
                        {item.logoUrl ? (
                          <img
                            src={item.logoUrl}
                            alt={item.categoryName}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-sm">🐾</span>
                        )}
                      </div>
                      <span>{item.categoryName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate text-xs">
                    {item.description || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {/* Status Action Button */}
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition ${
                        item.isActive
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
                    >
                      Edit
                    </button>

                    {/* Permanent Delete Button */}
                    <button
                      onClick={() => {
                        setDeleteError('');
                        setDeleteTarget(item);
                      }}
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

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingItem ? 'Edit Service' : 'Add New Service'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Service Name *
            </label>
            <input
              type="text"
              required
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              placeholder="e.g. Grooming"
              className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20 text-slate-800 placeholder:text-slate-400 focus:text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Bathing, styling and hygiene services"
              className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20 text-slate-800 placeholder:text-slate-400 focus:text-slate-900"
            />
          </div>

          {/* Logo Upload Container */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Service Logo
            </label>
            <div className="flex items-center gap-4">
              <label className="border-2 border-dashed border-slate-200 rounded-2xl w-24 h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition relative overflow-hidden shrink-0 bg-white">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-14 h-14 object-contain" />
                ) : (
                  <>
                    <span className="text-xl text-slate-400">📁</span>
                    <span className="text-[10px] font-bold text-slate-500 mt-1">Upload</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <div className="text-xs text-slate-500">
                <p className="font-semibold text-slate-700">Recommended: Square SVG or PNG</p>
                <p>Stored directly in Supabase Storage.</p>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveSelectedLogo}
                    className="text-xs text-rose-500 hover:underline mt-1 font-semibold block"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 rounded-xl bg-[#0d5c52] text-white text-sm font-bold shadow hover:bg-[#0a463e] disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : 'Save Service'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Permanent Hard Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handlePermanentDelete}
        title="Permanently Delete Service Category"
        message={
          deleteError
            ? deleteError
            : `Are you sure you want to permanently delete "${deleteTarget?.categoryName}"? This will permanently wipe the record and its storage files. This action cannot be undone.`
        }
        isLoading={formLoading}
      />
    </div>
  );
}