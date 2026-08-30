'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import ClinicForm from '@/components/clinics/ClinicForm';

export default function EditClinicPage() {
  const params = useParams();
  const clinicId = Number(params.id);

  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClinic() {
      try {
        const data = await apiFetch(`/api/v1/clinics/${clinicId}`);
        setInitialData(data);
      } catch (err) {
        console.error('[LOAD_EDIT_CLINIC_ERROR]:', err);
      } finally {
        setLoading(false);
      }
    }
    if (clinicId) {
      loadClinic();
    }
  }, [clinicId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm">
        Loading clinic profile details...
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="p-12 text-center text-rose-500 font-bold text-sm">
        Clinic record not found.
      </div>
    );
  }

  return <ClinicForm initialData={initialData} clinicId={clinicId} />;
}