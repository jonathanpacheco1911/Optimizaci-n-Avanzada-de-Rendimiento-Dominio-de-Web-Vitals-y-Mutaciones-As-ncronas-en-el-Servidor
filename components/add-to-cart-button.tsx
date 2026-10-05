"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart-store";

type Props = {
  product: { id: number; name: string; price: number; imageUrl: string | null; stock: number };
  className?: string;
};

export function AddToCartButton({ product, className = "" }: Props) {
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function handleClick() {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={soldOut}
      className={`rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 ${className}`}
    >
      {soldOut ? "Agotado" : added ? "Agregado ✓" : "Agregar al carrito"}
    </button>
  );
}
