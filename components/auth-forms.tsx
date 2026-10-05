"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction, type AuthState } from "@/app/actions/auth";

const input =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none";

function Field({
  label,
  name,
  type = "text",
  required = true,
  autoComplete,
  defaultValue,
  state,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
  state: AuthState;
}) {
  const fieldError = state?.fieldErrors?.[name]?.[0];
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={fieldError ? true : undefined}
        className={input}
      />
      {fieldError && <p className="text-xs text-red-600">{fieldError}</p>}
    </div>
  );
}

function FormShell({
  title,
  state,
  pending,
  action,
  submitLabel,
  footer,
  children,
}: {
  title: string;
  state: AuthState;
  pending: boolean;
  action: (formData: FormData) => void;
  submitLabel: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-bold">{title}</h1>
      <form action={action} className="space-y-4">
        {children}
        {state?.error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-slate-900 py-2.5 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {pending ? "Procesando…" : submitLabel}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">{footer}</p>
    </div>
  );
}

export function LoginForm({ next, expired }: { next?: string; expired?: boolean }) {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <div className="space-y-3">
      {expired && (
        <p className="mx-auto max-w-md rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Tu sesión expiró. Inicia sesión de nuevo.
        </p>
      )}
      <FormShell
        title="Iniciar sesión"
        state={state}
        pending={pending}
        action={action}
        submitLabel="Ingresar"
        footer={
          <>
            ¿No tienes cuenta?{" "}
            <Link
              href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
              className="font-medium underline"
            >
              Regístrate
            </Link>
          </>
        }
      >
        <input type="hidden" name="next" value={next ?? ""} />
        <Field label="Correo" name="email" type="email" autoComplete="email" defaultValue={state?.values?.email} state={state} />
        <Field label="Contraseña" name="password" type="password" autoComplete="current-password" state={state} />
      </FormShell>
    </div>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(registerAction, undefined);

  return (
    <FormShell
      title="Crear cuenta"
      state={state}
      pending={pending}
      action={action}
      submitLabel="Registrarme"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-medium underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Nombre completo" name="name" autoComplete="name" defaultValue={state?.values?.name} state={state} />
      <Field label="Correo" name="email" type="email" autoComplete="email" defaultValue={state?.values?.email} state={state} />
      <Field label="Teléfono (opcional)" name="phone" type="tel" required={false} autoComplete="tel" defaultValue={state?.values?.phone} state={state} />
      <Field label="Dirección (opcional)" name="address" required={false} autoComplete="street-address" defaultValue={state?.values?.address} state={state} />
      <Field label="Contraseña" name="password" type="password" autoComplete="new-password" state={state} />
      <Field label="Confirmar contraseña" name="password_confirmation" type="password" autoComplete="new-password" state={state} />
    </FormShell>
  );
}
