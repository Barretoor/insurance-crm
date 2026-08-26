"use client";

import { useRouter } from "next/navigation";

export function RefreshButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="text-sm font-medium text-gray-500 hover:text-gray-900 hover:underline"
    >
      Actualizar
    </button>
  );
}
