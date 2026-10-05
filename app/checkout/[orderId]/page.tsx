import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutPanel } from "@/components/checkout-panel";
import { getOrder } from "@/lib/data";
import { statusInfo } from "@/lib/format";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await getOrder(orderId);

  if (order.status === "paid") redirect(`/checkout/${orderId}/success`);

  if (order.status !== "pending") {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center">
        <h1 className="text-xl font-bold">Orden #{order.id}</h1>
        <p className="mt-2 text-slate-600">Estado: {statusInfo(order.status).label}. Ya no se puede pagar.</p>
        <Link href="/orders" className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-white">
          Ver mis compras
        </Link>
      </div>
    );
  }

  return (
    <CheckoutPanel
      order={{
        id: order.id,
        total: Number(order.total),
        currency: order.currency,
        items: (order.items ?? []).map((i) => ({
          id: i.id,
          name: i.product?.name ?? `Producto #${i.product_id}`,
          quantity: i.quantity,
          subtotal: Number(i.subtotal),
        })),
      }}
    />
  );
}
