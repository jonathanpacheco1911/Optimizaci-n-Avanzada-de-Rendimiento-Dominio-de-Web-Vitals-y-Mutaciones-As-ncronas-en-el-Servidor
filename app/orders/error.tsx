"use client";

import { ErrorView } from "@/components/error-view";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView title="No pudimos cargar tu historial" error={error} reset={reset} />;
}
