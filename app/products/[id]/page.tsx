import type { Metadata } from "next";
import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductImage } from "@/components/product-image";
import { getProduct } from "@/lib/data";
import { money } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  return { title: product.name, description: product.description ?? undefined };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  const price = Number(product.price);

  return (
    <div className="space-y-6">
      <Link href="/products" className="text-sm text-slate-600 hover:underline">
        ← Volver al catálogo
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white">
          <ProductImage src={product.image_url} alt={product.name} priority sizes="(min-width: 768px) 50vw, 100vw" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold">{money(price)}</p>
          <p className="whitespace-pre-line text-slate-700">{product.description ?? "Sin descripción."}</p>

          <dl className="grid grid-cols-2 gap-2 text-sm text-slate-600">
            <dt>SKU</dt>
            <dd className="font-mono">{product.sku}</dd>
            <dt>Disponibilidad</dt>
            <dd className={product.stock > 0 ? "" : "font-medium text-red-600"}>
              {product.stock > 0 ? `${product.stock} en stock` : "Agotado"}
            </dd>
          </dl>

          <AddToCartButton
            className="w-full py-3 text-base sm:w-auto"
            product={{
              id: product.id,
              name: product.name,
              price,
              imageUrl: product.image_url,
              stock: product.stock,
            }}
          />
        </div>
      </div>
    </div>
  );
}
