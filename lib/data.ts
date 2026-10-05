import "server-only";
import { notFound, redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { requireToken } from "@/lib/session";
import type { Order, Paginated, Payment, Product } from "@/lib/types";

// ---------- Lecturas públicas (Server Components) ----------

export function getProducts(page = 1, search?: string) {
  const params = new URLSearchParams({ page: String(page), per_page: "12" });
  if (search) params.set("search", search);
  return apiFetch<Paginated<Product>>(`/products?${params}`, {
    next: { revalidate: 60, tags: ["products"] },
  });
}

export async function getProduct(id: string): Promise<Product> {
  try {
    return await apiFetch<Product>(`/products/${encodeURIComponent(id)}`, {
      next: { revalidate: 60, tags: ["products"] },
    });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

// ---------- Lecturas protegidas (nunca se cachean) ----------

// Token vencido o revocado: limpiamos la cookie en un Route Handler y vamos al login.
function handleAuthError(e: unknown): never {
  if (e instanceof ApiError) {
    if (e.status === 401) redirect("/auth/logout");
    if (e.status === 403 || e.status === 404) notFound();
  }
  throw e;
}

export async function getOrders(page = 1): Promise<Paginated<Order>> {
  const token = await requireToken("/orders");
  try {
    return await apiFetch<Paginated<Order>>(`/orders?page=${page}`, { token, cache: "no-store" });
  } catch (e) {
    handleAuthError(e);
  }
}

export async function getOrder(id: string): Promise<Order> {
  const token = await requireToken(`/checkout/${id}`);
  try {
    return await apiFetch<Order>(`/orders/${encodeURIComponent(id)}`, { token, cache: "no-store" });
  } catch (e) {
    handleAuthError(e);
  }
}

/** Sincroniza con Stripe (la API actualiza el estado de la orden). Ignora errores: es informativo. */
export async function syncPaymentStatus(id: string): Promise<Payment | null> {
  const token = await requireToken(`/checkout/${id}/success`);
  try {
    return await apiFetch<Payment>(`/orders/${encodeURIComponent(id)}/payment/status`, {
      token,
      cache: "no-store",
    });
  } catch {
    return null;
  }
}
