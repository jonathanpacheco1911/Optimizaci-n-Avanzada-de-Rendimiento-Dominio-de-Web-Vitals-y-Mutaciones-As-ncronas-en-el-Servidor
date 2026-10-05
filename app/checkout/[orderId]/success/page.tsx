import type { Metadata } from "next";
import Link from "next/link";
import { getOrder, syncPaymentStatus } from "@/lib/data";
import { formatDate, money, statusInfo } from "@/lib/format";

export const metadata: Metadata = { title: "Confirmación de compra" };

export default async function SuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  // Si Stripe redirigió aquí (return_url), sincronizamos el estado antes de leer la orden.
  await syncPaymentStatus(orderId);
  const order = await getOrder(orderId);

  const paid = order.status === "paid";
  const processing = !paid && order.payment?.status === "processing";
  const status = statusInfo(order.status);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div
        className={`rounded-xl p-6 text-center ${
          paid ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"
        }`}
      >
        <h1 className="text-2xl font-bold">
          {paid ? "¡Compra confirmada!" : processing ? "Estamos procesando tu pago" : "Tu pago aún no se confirma"}
        </h1>
        <p className="mt-1 text-sm">
          Orden #{order.id} · {formatDate(order.created_at)}
        </p>
        {!paid && (
          <p className="mt-2 text-sm">
            {processing
              ? "Esto puede tardar unos segundos. Revisa tu historial en un momento."
              : "Si el cobro no se completó, puedes intentarlo de nuevo."}
          </p>
        )}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Detalle</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
        </div>
        <ul className="divide-y divide-slate-100 text-sm">
          {(order.items ?? []).map((item) => (
            <li key={item.id} className="flex justify-between py-2">
              <span>
                {item.product?.name ?? `Producto #${item.product_id}`}{" "}
                <span className="text-slate-500">× {item.quantity}</span>
              </span>
              <span>{money(item.subtotal, order.currency)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-lg font-bold">
          <span>Total</span>
          <span>{money(order.total, order.currency)}</span>
        </div>
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        {!paid && !processing && (
          <Link href={`/checkout/${order.id}`} className="rounded-lg bg-slate-900 px-4 py-2 text-white">
            Reintentar pago
          </Link>
        )}
        <Link href="/orders" className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100">
          Ver mis compras
        </Link>
        <Link href="/products" className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
