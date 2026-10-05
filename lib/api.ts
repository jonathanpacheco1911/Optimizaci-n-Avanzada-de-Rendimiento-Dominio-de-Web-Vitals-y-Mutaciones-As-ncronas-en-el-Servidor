import "server-only";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
};

export async function apiFetch<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("Falta la variable de entorno BASE_URL. Copia .env.example a .env.local.");
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      cache: opts.cache,
      next: opts.next,
    });
  } catch {
    throw new ApiError(503, "No se pudo conectar con la API. Verifica que esté en ejecución.");
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, json?.message ?? `Error ${res.status} al consultar la API`, json?.errors);
  }

  return (json?.data ?? json) as T;
}
