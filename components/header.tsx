import Link from "next/link";
import { Suspense } from "react";
import { logoutAction } from "@/app/actions/auth";
import { CartLink } from "@/components/cart-link";
import { getCurrentUser } from "@/lib/session";

async function UserMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link href="/login" className="font-medium text-slate-700 hover:text-slate-900">
          Ingresar
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-700"
        >
          Crear cuenta
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <Link href="/orders" className="font-medium text-slate-700 hover:text-slate-900">
        Mis compras
      </Link>
      <span className="hidden text-slate-500 sm:inline">Hola, {user.name.split(" ")[0]}</span>
      <form action={logoutAction}>
        <button type="submit" className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-100">
          Salir
        </button>
      </form>
    </div>
  );
}

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/products" className="text-lg font-bold tracking-tight">
            Tienda
          </Link>
          <Link href="/products" className="hidden text-sm text-slate-600 hover:text-slate-900 sm:block">
            Catálogo
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <CartLink />
          <Suspense fallback={<div className="h-8 w-40 animate-pulse rounded-lg bg-slate-100" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
