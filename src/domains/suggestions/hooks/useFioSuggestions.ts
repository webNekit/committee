"use client";

import { useEffect, useState } from "react";

import { useDebounce } from "@/shared/hooks/useDebounce";
import { suggestFio } from "../api";
import type { FioPart, FioSuggestion } from "../types";

/** Подсказки ФИО Dadata с дебаунсом 300 мс. */
export function useFioSuggestions(query: string, parts?: FioPart[]) {
  const debounced = useDebounce(query, 300);
  const [suggestions, setSuggestions] = useState<FioSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!debounced.trim()) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    suggestFio(debounced, parts)
      .then((items) => {
        if (!cancelled) setSuggestions(items);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // parts передаётся как стабильный литерал из компонентов.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, parts?.join(",")]);

  return { suggestions, loading };
}
