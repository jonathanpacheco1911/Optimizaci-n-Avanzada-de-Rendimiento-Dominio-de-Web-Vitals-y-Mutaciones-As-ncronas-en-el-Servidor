import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/constants";
import type { User } from "@/lib/types";

export async function getToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

// Cookie httpOnly: JavaScript del navegador no puede leerla (protege contra XSS).
export async function setSession(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Defensa en profundidad: además del proxy, cada página protegida verifica el token. */
export async function requireToken(next?: string): Promise<string> {
  const token = await getToken();
  if (!token) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return token;
}

// cache() de React evita repetir /auth/me dentro de un mismo render.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await getToken();
  if (!token) return null;
  try {
    return await apiFetch<User>("/auth/me", { token, cache: "no-store" });
  } catch {
    return null;
  }
});
