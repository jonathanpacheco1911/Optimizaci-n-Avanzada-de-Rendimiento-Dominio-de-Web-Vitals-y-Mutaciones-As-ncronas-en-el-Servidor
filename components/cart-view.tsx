"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createOrderAction } from "@/app/actions/orders";
import { clearCart, removeFromCart, setQuantity, useCart } from "@/lib/cart-store";
import { money } from "@/lib/format";

export function CartView() {
  const { items, total } = useCart();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function checkout() {
    setError(null);
    startTransition(async () => {
      const result = await createOrderAction(items.map((i) => ({ productId: i.productId, quantity: i.quantity })));

      if (result.ok) {
        clearCart();
        router.push(`/checkout/${result.orderId}`);
        return;
      }
      if (result.unauthenticated) {
        router.push(`/login?next=${encodeURIComponent("/cart")}`);
        return;
      }
      setError(result.error);
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
        <p className="text-slate-600">Tu carrito está vacío.</p>
        <Link href="/products" className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-white">
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <ul className="space-y-3 lg:col-span-2">
        {items.map((item) => (
          <li key={item.productId} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg boder border-slate-100 bg-white">
              {item.imageUrl && (
                <Image src={item.imageUrl} alt={item.name} fill sizes="80px" unoptimized className="object-contain p-1" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/products/${item.productId}`} className="font-medium hover:underline">
                  {item.name}
                </Link>
                <p className="font-semibold">{money(item.price * item.quantity)}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    aria-label={`Quitar una unidad de ${item.name}`}
                    onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="h-8 w-8 rounded-lg border border-slate-300 disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm" aria-live="polite">
                    {item.quantity}
                  </span>
                  <button
                    aria-label={`Agregar una unidad de ${item.name}`}
                    onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="h-8 w-8 rounded-lg border border-slate-300 disabled:opacity-40"
                  >
                    +
                  </button>
                  <span className="ml-2 text-xs text-slate-500">{money(item.price)} c/u</span>
                </div>
                <button onClick={() => removeFromCart(item.productId)} className="text-sm text-red-600 hover:underline">
                  Quitar
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Resumen</h2>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Total</span>
          <span className="text-xl font-bold">{money(total)}</span>
        </div>
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          onClick={checkout}
          disabled={pending}
          className="w-full rounded-lg bg-slate-900 py-3 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {pending ? "Creando orden…" : "Crear orden y pagar"}
        </button>
        <button onClick={clearCart} className="w-full text-sm text-slate-500 hover:underline">
          Vaciar carrito
        </button>
      </aside>
    </div>
  );
}
