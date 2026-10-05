import Image from "next/image";

// `unoptimized`: image_url puede apuntar a cualquier host (incluido localhost),
// así evitamos configurar remotePatterns. Mantiene lazy-loading y evita CLS.
export function ProductImage({
  src,
  alt,
  priority = false,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw",
}: {
  src: string | null;
  alt: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
        Sin imagen
      </div>
    );
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized className="object-contain p-3" />;
}
