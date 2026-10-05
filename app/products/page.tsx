import type { Metadata } from "next";
import { Suspense } from "react";
import { Pagination } from "@/components/pagination";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/skeletons";
import { getProducts } from "@/lib/data";

export const metadata: Metadata = { title: "Catálogo" };

type Props = { searchParams: Promise<{ page?: string; search?: string }> };

// Sección "pesada": se resuelve dentro de Suspense para que el resto de la página
// (título y buscador) se pinte de inmediato mientras llegan los productos.
async function ProductGrid({ page, search }: { page: number; search?: string }) {
  const products = await getProducts(page, search);

  if (products.data.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
        No encontramos productos{search ? ` para “${search}”` : ""}.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.data.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index < 4} />
        ))}
      </div>
      <Pagination basePath="/products" page={products.current_page} lastPage={products.last_page} params={{ search }} />
    </>
  );
}

export default async function ProductsPage({ searchParams }: Props) {
  const { page, search } = await searchParams;
  const current = Math.max(1, Number(page) || 1);
  const term = search?.trim() || undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Catálogo</h1>
          <p className="text-sm text-slate-600">Explora los productos disponibles.</p>
        </div>
        <form action="/products" className="flex gap-2">
          <label htmlFor="search" className="sr-only">
            Buscar productos
          </label>
          <input
            id="search"
            name="search"
            defaultValue={term}
            placeholder="Buscar por nombre…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-64"
          />
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            Buscar
          </button>
        </form>
      </div>

      <Suspense key={`${current}-${term ?? ""}`} fallback={<ProductGridSkeleton />}>
        <ProductGrid page={current} search={term} />
      </Suspense>
    </div>
  );
}
