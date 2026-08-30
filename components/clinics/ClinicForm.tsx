'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';

interface ServiceCategory {
  categoryID: number;
  categoryName: string;
}

interface LocationOption {
  locationID: number;
  locationName: string;
  locationType: string;
  parentLocationID: number | null;
}

interface OpeningHour {
  day: string;
  open: string;
  close: string;
}

const DEFAULT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface ClinicFormProps {
  initialData?: any;
  clinicId?: number;
}

export default function ClinicForm({ initialData, clinicId }: ClinicFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Primary Clinic State
  const [clinicName, setClinicName] = useState(initialData?.clinicName || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);

  // Images State
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || '');
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl || '');
  const [logoUploading, setLogoUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  // Contacts
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [website, setWebsite] = useState(initialData?.website || '');

  // Address & Hierarchy
  const [address, setAddress] = useState(initialData?.address || '');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | ''>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | ''>(
    initialData?.locationID || ''
  );
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [allLocations, setAllLocations] = useState<LocationOption[]>([]);

  // Services State
  const [availableServices, setAvailableServices] = useState<ServiceCategory[]>([]);
  const [selectedServiceIDs, setSelectedServiceIDs] = useState<number[]>(
    initialData?.services?.map((s: any) => s.categoryID) || []
  );

  // Opening Hours
  const [hours, setHours] = useState<OpeningHour[]>(() => {
    if (initialData?.openingHours && Array.isArray(initialData.openingHours)) {
      return initialData.openingHours;
    }
    return DEFAULT_DAYS.map((day) => ({ day, open: '08:00', close: '18:00' }));
  });

  // Load Locations & Available Services
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catsRes, locsRes] = await Promise.all([
          apiFetch('/api/v1/categories?limit=100'),
          apiFetch('/api/v1/locations?limit=200'),
        ]);

        setAvailableServices(catsRes.items || []);
        const rawLocs: LocationOption[] = locsRes.items || [];
        setAllLocations(rawLocs);
        setProvinces(rawLocs.filter((l) => l.locationType === 'Province'));

        // If editing, resolve parent Province from existing locationID
        if (initialData?.locationID) {
          const currentDistrict = rawLocs.find(
            (l) => l.locationID === Number(initialData.locationID)
          );
          if (currentDistrict?.parentLocationID) {
            setSelectedProvinceId(currentDistrict.parentLocationID);
          }
        }
      } catch (err) {
        console.error('[LOAD_FORM_METADATA_ERROR]:', err);
      }
    }
    loadMeta();
  }, [initialData]);

  // Update district options when selected province changes
  useEffect(() => {
    if (selectedProvinceId) {
      setDistricts(
        allLocations.filter(
          (l) =>
            l.locationType === 'District' &&
            l.parentLocationID === Number(selectedProvinceId)
        )
      );
    } else {
      setDistricts([]);
    }
  }, [selectedProvinceId, allLocations]);

  const toggleService = (id: number) => {
    setSelectedServiceIDs((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleHourChange = (day: string, field: 'open' | 'close', val: string) => {
    setHours((prev) =>
      prev.map((h) => (h.day === day ? { ...h, [field]: val } : h))
    );
  };

  const applyFirstToAllDays = () => {
    const first = hours[0];
    if (!first) return;
    setHours(hours.map((h) => ({ ...h, open: first.open, close: first.close })));
  };

  // Direct Supabase storage image upload
  const handleUploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'cover'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'logo') setLogoUploading(true);
    if (type === 'cover') setCoverUploading(true);

    try {
      if (clinicId) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const token = localStorage.getItem('access_token');
        const res = await fetch(`/api/v1/clinics/${clinicId}/images`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        const data = await res.json();
        if (data.status === 'success') {
          if (type === 'logo') setLogoUrl(data.data.url);
          if (type === 'cover') setCoverImageUrl(data.data.url);
        }
      } else {
        // Preview mode for local file before first clinic creation
        const fakeUrl = URL.createObjectURL(file);
        if (type === 'logo') setLogoUrl(fakeUrl);
        if (type === 'cover') setCoverImageUrl(fakeUrl);
      }
    } catch (err) {
      console.error('[IMAGE_UPLOAD_ERROR]:', err);
    } finally {
      if (type === 'logo') setLogoUploading(false);
      if (type === 'cover') setCoverUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    if (!clinicName.trim() || !address.trim() || !phone.trim() || !selectedDistrictId) {
      setErrorMsg('Please populate all required fields (*), including District.');
      setSaving(false);
      return;
    }

    const payload = {
      clinicName: clinicName.trim(),
      description: description.trim() || null,
      locationID: Number(selectedDistrictId),
      address: address.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || null,
      email: email.trim() || null,
      website: website.trim() || null,
      openingHours: hours,
      isActive,
      isFeatured,
      serviceIDs: selectedServiceIDs,
    };

    try {
      if (clinicId) {
        await apiFetch(`/api/v1/clinics/${clinicId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/api/v1/clinics', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      router.push('/clinics');
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111928] tracking-tight">Clinic Details</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create or update a veterinary clinic profile. Ensure all essential contact and service
            information is accurate before publishing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/clinics')}
            className="px-4 py-2 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-200/60 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d5c52] hover:bg-[#0a463e] text-white font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            <span>💾</span>
            <span>{saving ? 'Saving...' : 'Save Clinic'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Two-Column Grid Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Span (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Basic Information */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-[#0d5c52] font-bold">
              <span className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center text-xs">
                ℹ
              </span>
              <h2 className="text-base text-slate-900 font-bold">Basic Information</h2>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                Clinic Name *
              </label>
              <input
                type="text"
                required
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="e.g., Happy Paws Veterinary Clinic"
                className="w-full px-4 py-2.5 rounded-xl bg-[#f5f8fb] border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20 text-slate-800 placeholder:text-slate-400 focus:text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the clinic's specialties and atmosphere..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#f5f8fb] border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20 text-slate-800 placeholder:text-slate-400 focus:text-slate-900"
              />
            </div>

            {/* Images Dropzone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Logo Box */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                  Clinic Logo
                </label>
                <label className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition min-h-[140px] relative overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-20 h-20 object-contain" />
                  ) : (
                    <>
                      <span className="text-2xl text-slate-400">🖼</span>
                      <span className="text-xs font-bold text-slate-700 mt-2">
                        {logoUploading ? 'Uploading...' : 'Upload Logo'}
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => handleUploadImage(e, 'logo')}
                  />
                </label>
              </div>

              {/* Cover Box */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                  Cover Image
                </label>
                <label className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition min-h-[140px] relative overflow-hidden">
                  {coverImageUrl ? (
                    <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <span className="text-2xl text-slate-400">🏞</span>
                      <span className="text-xs font-bold text-slate-700 mt-2">
                        {coverUploading ? 'Uploading...' : 'Upload Cover'}
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => handleUploadImage(e, 'cover')}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* 2. Veterinary Services */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-[#0d5c52] font-bold">
              <span className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center text-xs">
                🐾
              </span>
              <h2 className="text-base text-slate-900 font-bold">Veterinary Services</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              {availableServices.map((cat) => {
                const checked = selectedServiceIDs.includes(cat.categoryID);
                return (
                  <label
                    key={cat.categoryID}
                    onClick={() => toggleService(cat.categoryID)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      checked
                        ? 'border-[#0d5c52] bg-teal-50/40 text-[#0d5c52]'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="rounded border-slate-300 text-[#0d5c52] focus:ring-[#0d5c52]"
                    />
                    <span className="text-xs font-bold">{cat.categoryName}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3. Location Settings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-[#0d5c52] font-bold">
              <span className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center text-xs">
                📍
              </span>
              <h2 className="text-base text-slate-900 font-bold">Location</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                  Province
                </label>
                <select
                  value={selectedProvinceId}
                  onChange={(e) => {
                    setSelectedProvinceId(Number(e.target.value));
                    setSelectedDistrictId('');
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f5f8fb] border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20 text-slate-800 focus:text-slate-900"
                >
                  <option value="">Select Province</option>
                  {provinces.map((p) => (
                    <option key={p.locationID} value={p.locationID}>
                      {p.locationName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                  District *
                </label>
                <select
                  required
                  value={selectedDistrictId}
                  onChange={(e) => setSelectedDistrictId(Number(e.target.value))}
                  disabled={!selectedProvinceId}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#f5f8fb] border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20 disabled:opacity-50 text-slate-800 focus:text-slate-900"
                >
                  <option value="">Select District</option>
                  {districts.map((d) => (
                    <option key={d.locationID} value={d.locationID}>
                      {d.locationName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main Street, Negombo"
                className="w-full px-4 py-2.5 rounded-xl bg-[#f5f8fb] border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20 text-slate-800 placeholder:text-slate-400 focus:text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                Google Maps URL
              </label>
              <input
                type="url"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#f5f8fb] border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20 text-slate-800 placeholder:text-slate-400 focus:text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Right Span (1/3 width) */}
        <div className="space-y-6">
          {/* 1. Publishing */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm space-y-4">
            <h2 className="text-base text-slate-900 font-bold">Publishing</h2>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs font-bold text-slate-800">Active Status</p>
                <p className="text-[11px] text-slate-400">Visible to public users</p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                  isActive ? 'bg-[#0d5c52]' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">Featured Clinic</p>
                <p className="text-[11px] text-slate-400">Highlight on homepage</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                  isFeatured ? 'bg-[#0d5c52]' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    isFeatured ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 2. Contact Information */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm space-y-4">
            <h2 className="text-base text-slate-900 font-bold">Contact</h2>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#f5f8fb] border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20 text-slate-800 placeholder:text-slate-400 focus:text-slate-900"
                />
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">📞</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                WhatsApp
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#f5f8fb] border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20 text-slate-800 placeholder:text-slate-400 focus:text-slate-900"
                />
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">💬</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                Website
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#f5f8fb] border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20 text-slate-800 placeholder:text-slate-400 focus:text-slate-900"
                />
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🌐</span>
              </div>
            </div>
          </div>

          {/* 3. Opening Hours */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base text-slate-900 font-bold">Hours</h2>
              <button
                type="button"
                onClick={applyFirstToAllDays}
                className="text-xs font-bold text-[#0d5c52] hover:underline"
              >
                Apply to all days
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {hours.map((h) => (
                <div key={h.day} className="flex items-center justify-between gap-2 text-xs">
                  <span className="w-10 font-bold text-slate-600">{h.day.substring(0, 3)}</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      value={h.open}
                      onChange={(e) => handleHourChange(h.day, 'open', e.target.value)}
                      className="px-2 py-1 rounded-lg bg-[#f5f8fb] border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20 text-slate-800 focus:text-slate-900"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="time"
                      value={h.close}
                      onChange={(e) => handleHourChange(h.day, 'close', e.target.value)}
                      className="px-2 py-1 rounded-lg bg-[#f5f8fb] border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0d5c52]/20 text-slate-800 focus:text-slate-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}