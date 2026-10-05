import Link from "next/link";

type Props = {
  basePath: string;
  page: number;
  lastPage: number;
  params?: Record<string, string | undefined>;
};

export function Pagination({ basePath, page, lastPage, params = {} }: Props) {
  if (lastPage <= 1) return null;

  const href = (p: number) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
    q.set("page", String(p));
    return `${basePath}?${q}`;
  };

  const base = "rounded-lg border px-3 py-1.5 text-sm";
  const enabled = "border-slate-300 bg-white hover:bg-slate-100";
  const disabled = "pointer-events-none border-slate-200 text-slate-300";

  return (
    <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Paginación">
      <Link
        href={href(page - 1)}
        aria-disabled={page <= 1}
        className={`${base} ${page <= 1 ? disabled : enabled}`}
      >
        ← Anterior
      </Link>
      <span className="text-sm text-slate-600">
        Página {page} de {lastPage}
      </span>
      <Link
        href={href(page + 1)}
        aria-disabled={page >= lastPage}
        className={`${base} ${page >= lastPage ? disabled : enabled}`}
      >
        Siguiente →
      </Link>
    </nav>
  );
}
