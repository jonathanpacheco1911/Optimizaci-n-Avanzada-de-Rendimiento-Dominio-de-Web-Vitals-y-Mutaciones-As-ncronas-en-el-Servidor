import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Pagination } from "@/components/pagination";
import { OrdersSkeleton } from "@/components/skeletons";
import { getOrders } from "@/lib/data";
import { formatDate, money, statusInfo } from "@/lib/format";
import { requireToken } from "@/lib/session";

export const metadata: Metadata = { title: "Mis compras" };

async function OrdersList({ page }: { page: number }) {
  const orders = await getOrders(page);

  if (orders.data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
        <p className="text-slate-600">Aún no tienes compras.</p>
        <Link href="/products" className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-white">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-4">
        {orders.data.map((order) => {
          const status = statusInfo(order.status);
          return (
            <li key={order.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">Orden #{order.id}</p>
                  <p className="text-xs text-slate-500">{formatDate(order.created_at)}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
              </div>

              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {(order.items ?? []).map((item) => (
                  <li key={item.id} className="flex justify-between py-1.5">
                    <span>
                      {item.product?.name ?? `Producto #${item.product_id}`}{" "}
                      <span className="text-slate-500">× {item.quantity}</span>
                    </span>
                    <span>{money(item.subtotal, order.currency)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="font-bold">{money(order.total, order.currency)}</span>
                {order.status === "pending" && (
                  <Link
                    href={`/checkout/${order.id}`}
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
                  >
                    Pagar ahora
                  </Link>
                )}
                {order.status === "paid" && (
                  <Link href={`/checkout/${order.id}/success`} className="text-sm text-slate-600 hover:underline">
                    Ver comprobante
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <Pagination basePath="/orders" page={orders.current_page} lastPage={orders.last_page} />
    </>
  );
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireToken("/orders"); // vista protegida
  const { page } = await searchParams;
  const current = Math.max(1, Number(page) || 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mis compras</h1>
      <Suspense key={current} fallback={<OrdersSkeleton />}>
        <OrdersList page={current} />
      </Suspense>
    </div>
  );
}
