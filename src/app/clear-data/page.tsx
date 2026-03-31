'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearDataPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear all localStorage keys used by the app
    const keysToRemove = [
      'tenchi-uploaded-data',
      'tenchi_sop_upload_v2',
      'tenchi_uploaded_data',
    ];
    keysToRemove.forEach(key => {
      try { localStorage.removeItem(key); } catch {}
    });

    // Clear any other app-related localStorage
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.toLowerCase().includes('tenchi')) {
          localStorage.removeItem(key);
        }
      });
    } catch {}

    // Redirect to upload page after clearing
    router.replace('/upload');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080d1a] text-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium">Clearing all cached data...</p>
        <p className="text-sm text-slate-400 mt-2">You will be redirected shortly</p>
      </div>
    </div>
  );
}
