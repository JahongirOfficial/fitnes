"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Xatolik yuz berdi</h2>
      <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
        {error.message || "Kutilmagan xatolik yuz berdi. Iltimos, qayta urinib ko'ring."}
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
      >
        <RefreshCw className="w-4 h-4" />
        Qayta urinish
      </button>
    </div>
  );
}
