"use client";

import { useEffect, useState } from "react";

import { useDebounce } from "@/shared/hooks/useDebounce";
import { suggestAddress } from "../api";
import type { AddressSuggestion } from "../types";

/** Подсказки адресов Dadata с дебаунсом 300 мс. */
export function useAddressSuggestions(query: string) {
  const debounced = useDebounce(query, 300);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!debounced.trim()) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    suggestAddress(debounced)
      .then((items) => {
        if (!cancelled) setSuggestions(items);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  return { suggestions, loading };
}
