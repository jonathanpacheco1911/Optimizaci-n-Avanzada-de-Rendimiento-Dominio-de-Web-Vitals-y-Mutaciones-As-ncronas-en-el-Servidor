import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = { title: "Carrito" };

export default function CartPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tu carrito</h1>
      <CartView />
    </div>
  );
}
