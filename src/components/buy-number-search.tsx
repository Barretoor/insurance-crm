"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AvailableNumber = {
  phoneNumber: string;
  friendlyName: string;
  locality: string | null;
  region: string | null;
};

export function BuyNumberSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AvailableNumber[] | null>(null);
  const [priceInfo, setPriceInfo] = useState<{
    monthlyPrice: number | null;
    priceUnit: string;
  } | null>(null);
  const [purchasingNumber, setPurchasingNumber] = useState<string | null>(null);
  const [purchasedNumbers, setPurchasedNumbers] = useState<Set<string>>(new Set());

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || searching) return;

    setSearching(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(
        `/api/numbers/available?query=${encodeURIComponent(trimmed)}`
      );
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error ?? "No se pudo buscar números disponibles.");
        return;
      }

      setResults(data.numbers);
      setPriceInfo({ monthlyPrice: data.monthlyPrice, priceUnit: data.priceUnit });
      if (data.numbers.length === 0) {
        setError("No se encontraron números disponibles para esa búsqueda.");
      }
    } catch {
      setError("No se pudo buscar números disponibles.");
    } finally {
      setSearching(false);
    }
  }

  async function handlePurchase(number: AvailableNumber) {
    setPurchasingNumber(number.phoneNumber);
    setError(null);

    try {
      const response = await fetch("/api/numbers/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: number.phoneNumber, region: number.region }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error ?? "No se pudo comprar el número.");
        return;
      }

      setPurchasedNumbers((prev) => new Set(prev).add(number.phoneNumber));
      router.refresh();
    } catch {
      setError("No se pudo comprar el número.");
    } finally {
      setPurchasingNumber(null);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="query" className="block text-sm font-medium text-gray-700">
            Código de área o ciudad
          </label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="214 o Dallas"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
        </div>
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700 disabled:opacity-60"
        >
          {searching ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {results && results.length > 0 && (
        <div className="divide-y divide-gray-100 rounded-md border border-gray-200 bg-surface">
          {results.map((number) => {
            const purchased = purchasedNumbers.has(number.phoneNumber);
            return (
              <div
                key={number.phoneNumber}
                className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{number.phoneNumber}</p>
                  <p className="mt-0.5 truncate text-sm text-gray-500">
                    {[number.locality, number.region].filter(Boolean).join(", ") || "—"}
                    {priceInfo?.monthlyPrice != null &&
                      ` · $${priceInfo.monthlyPrice.toFixed(2)} ${(priceInfo.priceUnit ?? "").toUpperCase()}/mes`}
                  </p>
                </div>
                {purchased ? (
                  <span className="flex-shrink-0 text-sm font-medium text-green-700">
                    Comprado
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePurchase(number)}
                    disabled={purchasingNumber === number.phoneNumber}
                    className="flex-shrink-0 rounded-md bg-accent-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-700 disabled:opacity-60"
                  >
                    {purchasingNumber === number.phoneNumber ? "Comprando..." : "Comprar"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
