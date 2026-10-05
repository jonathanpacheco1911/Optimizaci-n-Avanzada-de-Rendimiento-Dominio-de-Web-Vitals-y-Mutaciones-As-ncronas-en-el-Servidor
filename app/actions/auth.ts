"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ApiError, apiFetch } from "@/lib/api";
import { clearSession, getToken, setSession } from "@/lib/session";
import type { User } from "@/lib/types";

export type AuthState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[]>;
      values?: Record<string, string>;
    }
  | undefined;

type AuthResponse = { user: User; token: string };

// Evita open redirects: solo rutas internas.
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/products";
}

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, "email");
  const password = String(formData.get("password") ?? "");

  try {
    const { token } = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      cache: "no-store",
    });
    await setSession(token);
  } catch (e) {
    if (e instanceof ApiError) {
      return { error: e.message, fieldErrors: e.errors, values: { email } };
    }
    throw e;
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const values = {
    name: text(formData, "name"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    address: text(formData, "address"),
  };
  const password = String(formData.get("password") ?? "");
  const password_confirmation = String(formData.get("password_confirmation") ?? "");

  if (password !== password_confirmation) {
    return { error: "Las contraseñas no coinciden.", values };
  }

  try {
    const { token } = await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: {
        ...values,
        phone: values.phone || undefined,
        address: values.address || undefined,
        password,
        password_confirmation,
      },
      cache: "no-store",
    });
    await setSession(token);
  } catch (e) {
    if (e instanceof ApiError) {
      return { error: e.message, fieldErrors: e.errors, values };
    }
    throw e;
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction() {
  const token = await getToken();
  if (token) {
    try {
      await apiFetch("/auth/logout", { method: "POST", token, cache: "no-store" });
    } catch {
      // Si el token ya no es válido, igual cerramos la sesión local.
    }
  }
  await clearSession();
  revalidatePath("/", "layout");
  redirect("/products");
}
