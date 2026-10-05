"use client";

import Link from "next/link";

// Vista compartida por los error.tsx de cada segmento.
export function ErrorView({
  title = "Algo salió mal",
  error,
  reset,
}: {
  title?: string;
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert" className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <h2 className="text-lg font-semibold text-red-900">{title}</h2>
      <p className="mt-2 text-sm text-red-800">
        {error.message || "Ocurrió un error inesperado. Intenta de nuevo."}
      </p>
      <div className="mt-4 flex justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
        >
          Reintentar
        </button>
        <Link href="/products" className="rounded-lg border border-red-300 px-4 py-2 text-sm hover:bg-red-100">
          Ir al catálogo
        </Link>
      </div>
    </div>
  );
}
