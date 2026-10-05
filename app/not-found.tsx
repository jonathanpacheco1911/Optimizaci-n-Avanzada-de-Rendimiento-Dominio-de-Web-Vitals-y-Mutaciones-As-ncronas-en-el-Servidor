import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-2xl font-bold">No encontramos lo que buscas</h1>
      <p className="mt-2 text-slate-600">El recurso no existe o no tienes permiso para verlo.</p>
      <Link href="/products" className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-white">
        Volver al catálogo
      </Link>
    </div>
  );
}
