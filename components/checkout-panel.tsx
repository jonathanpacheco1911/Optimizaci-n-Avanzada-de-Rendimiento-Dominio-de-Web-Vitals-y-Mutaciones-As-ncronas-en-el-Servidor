"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { initiatePaymentAction, verifyPaymentAction } from "@/app/actions/orders";
import { money } from "@/lib/format";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export type CheckoutOrder = {
  id: number;
  total: number;
  currency: string;
  items: { id: number; name: string; quantity: number; subtotal: number }[];
};

function PaymentForm({ orderId, total, currency }: { orderId: number; total: number; currency: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/${orderId}/success` },
      redirect: "if_required", // tarjetas: sin redirección; otros métodos usan return_url
    });

    if (stripeError) {
      setError(stripeError.message ?? "No se pudo procesar el pago.");
      setSubmitting(false);
      return;
    }

    // Sincroniza el estado con la API (no depende del webhook) y refresca historial.
    await verifyPaymentAction(orderId);
    router.push(`/checkout/${orderId}/success`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full rounded-lg bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
      >
        {submitting ? "Procesando pago…" : `Pagar ${money(total, currency)}`}
      </button>
    </form>
  );
}

export function CheckoutPanel({ order }: { order: CheckoutOrder }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function startPayment() {
    setError(null);
    startTransition(async () => {
      const result = await initiatePaymentAction(order.id);
      if (result.ok) setClientSecret(result.clientSecret);
      else setError(result.error);
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Pago de la orden #{order.id}</h1>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 font-semibold">Resumen</h2>
        <ul className="divide-y divide-slate-100 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2">
              <span>
                {item.name} <span className="text-slate-500">× {item.quantity}</span>
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

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 font-semibold">Método de pago</h2>

        {!stripePromise ? (
          <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Falta configurar NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en tu archivo .env.local.
          </p>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret, locale: "es" }}>
            <PaymentForm orderId={order.id} total={order.total} currency={order.currency} />
          </Elements>
        ) : (
          <div className="space-y-3">
            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              onClick={startPayment}
              disabled={pending}
              className="w-full rounded-lg bg-slate-900 py-3 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
            >
              {pending ? "Preparando pago…" : "Continuar al pago"}
            </button>
            <p className="text-center text-xs text-slate-500">
              Modo prueba: usa la tarjeta 4242 4242 4242 4242, cualquier fecha futura y cualquier CVC.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
