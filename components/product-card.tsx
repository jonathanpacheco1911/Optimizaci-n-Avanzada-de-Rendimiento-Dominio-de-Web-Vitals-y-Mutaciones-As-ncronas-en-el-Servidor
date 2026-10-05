import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductImage } from "@/components/product-image";
import { money } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const price = Number(product.price);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Link href={`/products/${product.id}`} className="relative block aspect-[4/3] border-b-slate-100 bg-white">
        <ProductImage src={product.image_url} alt={product.name} priority={priority} />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/products/${product.id}`} className="font-semibold leading-tight hover:underline">
          {product.name}
        </Link>
        <p className="text-lg font-bold">{money(price)}</p>
        <p className={`text-xs ${product.stock > 0 ? "text-slate-500" : "text-red-600"}`}>
          {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}
        </p>
        <AddToCartButton
          className="mt-auto"
          product={{
            id: product.id,
            name: product.name,
            price,
            imageUrl: product.image_url,
            stock: product.stock,
          }}
        />
      </div>
    </article>
  );
}
