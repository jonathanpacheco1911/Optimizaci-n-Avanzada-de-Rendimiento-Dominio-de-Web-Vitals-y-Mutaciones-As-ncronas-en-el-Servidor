export function money(value: string | number, currency = "usd") {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(Number(value));
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-SV", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendiente de pago", className: "bg-amber-100 text-amber-800" },
  paid: { label: "Pagada", className: "bg-emerald-100 text-emerald-800" },
  failed: { label: "Pago fallido", className: "bg-red-100 text-red-800" },
};

export function statusInfo(status: string) {
  return ORDER_STATUS[status] ?? { label: status, className: "bg-slate-100 text-slate-700" };
}
