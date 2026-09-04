"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import "./globals.css";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 font-sans text-gray-900">
        <h2 className="text-lg font-medium">Algo salió mal.</h2>
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700"
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
