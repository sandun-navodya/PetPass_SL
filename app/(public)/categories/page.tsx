'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EmergencyCta from '@/components/home/EmergencyCta';
import ServiceHero from '@/components/services/ServiceHero';
import ServiceCategoryGrid, { CategoryCardData } from '@/components/services/ServiceCategoryGrid';

export default function ServicesPage() {
  const [categories, setCategories] = useState<CategoryCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCategories = useCallback(async (searchQuery = '') => {
    setLoading(true);
    try {
      const queryParam = searchQuery.trim()
        ? `&search=${encodeURIComponent(searchQuery.trim())}`
        : '';
      const res = await fetch(`/api/v1/categories?limit=50&isActive=true${queryParam}`);
      const payload = await res.json();

      if (payload?.data?.items) {
        setCategories(payload.data.items);
      }
    } catch (err) {
      console.error('[SERVICES_DIRECTORY_LOAD_ERROR]:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadCategories(search);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] font-sans text-palette-charcoal selection:bg-palette-primary selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Top Hero with Search and Visual Assets */}
        <ServiceHero
          search={search}
          onSearchChange={setSearch}
          onSearchSubmit={handleSearchSubmit}
        />

        {/* Browse Category Cards */}
        <ServiceCategoryGrid categories={categories} loading={loading} />

        {/* 24/7 Helpline Banner (Replaces Service Provider CTA) */}
        <EmergencyCta />
      </main>

      <Footer />
    </div>
  );
}