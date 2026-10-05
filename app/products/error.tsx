"use client";

import { ErrorView } from "@/components/error-view";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorView title="No pudimos cargar el catálogo" error={error} reset={reset} />;
}
