"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";

export function CartLink() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      className="relative rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100"
      aria-label={`Carrito, ${count} artículos`}
    >
      Carrito
      {count > 0 && (
        <span className="ml-2 rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">{count}</span>
      )}
    </Link>
  );
}
