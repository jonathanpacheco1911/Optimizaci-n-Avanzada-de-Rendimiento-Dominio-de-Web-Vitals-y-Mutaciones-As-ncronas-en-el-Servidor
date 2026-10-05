"use server";

import { revalidatePath } from "next/cache";
import { ApiError, apiFetch } from "@/lib/api";
import { getToken } from "@/lib/session";
import type { Order, Payment } from "@/lib/types";

export type CartLine = { productId: number; quantity: number };

export type CreateOrderResult =
  | { ok: true; orderId: number }
  | { ok: false; error: string; unauthenticated?: boolean };

/** Mutación: crea la orden en la API (reserva stock) y refresca las vistas afectadas. */
export async function createOrderAction(lines: CartLine[]): Promise<CreateOrderResult> {
  const token = await getToken();
  if (!token) {
    return { ok: false, error: "Inicia sesión para continuar con tu compra.", unauthenticated: true };
  }

  const items = lines
    .filter((l) => Number.isInteger(l.productId) && Number.isInteger(l.quantity) && l.quantity > 0)
    .map((l) => ({ product_id: l.productId, quantity: l.quantity }));

  if (items.length === 0) return { ok: false, error: "Tu carrito está vacío." };

  try {
    const order = await apiFetch<Order>("/orders", {
      method: "POST",
      token,
      body: { items },
      cache: "no-store",
    });

    // El stock cambió y el historial tiene una orden nueva: evitamos UI desactualizada.
    revalidatePath("/orders");
    revalidatePath("/products");
    revalidatePath("/products/[id]", "page");

    return { ok: true, orderId: order.id };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 401) {
        return { ok: false, error: "Tu sesión expiró. Inicia sesión de nuevo.", unauthenticated: true };
      }
      return { ok: false, error: e.message };
    }
    throw e;
  }
}

/** Mutación: crea el PaymentIntent en Stripe a través de la API y devuelve el client_secret. */
export async function initiatePaymentAction(
  orderId: number,
): Promise<{ ok: true; clientSecret: string } | { ok: false; error: string }> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Tu sesión expiró. Inicia sesión de nuevo." };

  try {
    const data = await apiFetch<{ payment: Payment; client_secret: string }>(`/orders/${orderId}/pay`, {
      method: "POST",
      token,
      cache: "no-store",
    });
    return { ok: true, clientSecret: data.client_secret };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, error: e.message };
    throw e;
  }
}

/** Mutación: sincroniza el estado del pago con Stripe y refresca historial y confirmación. */
export async function verifyPaymentAction(
  orderId: number,
): Promise<{ ok: true; status: string } | { ok: false; error: string }> {
  const token = await getToken();
  if (!token) return { ok: false, error: "Tu sesión expiró." };

  try {
    const payment = await apiFetch<Payment>(`/orders/${orderId}/payment/status`, {
      token,
      cache: "no-store",
    });
    revalidatePath("/orders");
    revalidatePath(`/checkout/${orderId}`);
    revalidatePath(`/checkout/${orderId}/success`);
    return { ok: true, status: payment.status };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, error: e.message };
    throw e;
  }
}
