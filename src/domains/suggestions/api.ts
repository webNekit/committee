// Dadata Suggestions API
// Документация: https://dadata.ru/api/suggest/

import type { AddressSuggestion, FioPart, FioSuggestion } from "./types";

const DADATA_URL = "https://suggestions.dadata.ru/suggestions/api/4_1/rs";
const TOKEN = process.env.NEXT_PUBLIC_DADATA_TOKEN ?? "";

/** Токен задан — подсказки работают. Иначе форма доступна, но без подсказок. */
export const isSuggestionsEnabled = () => TOKEN.length > 0;

async function post<T>(path: string, body: unknown): Promise<T[]> {
  if (!isSuggestionsEnabled()) return [];
  try {
    const res = await fetch(`${DADATA_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Token ${TOKEN}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.suggestions ?? []) as T[];
  } catch {
    // Сеть недоступна / нет токена — тихо отдаём пустой список.
    return [];
  }
}

export function suggestAddress(query: string): Promise<AddressSuggestion[]> {
  if (!query.trim()) return Promise.resolve([]);
  return post<AddressSuggestion>("/suggest/address", {
    query,
    count: 7,
    locations: [{ country: "Россия" }],
  });
}

export function suggestFio(
  query: string,
  parts?: FioPart[],
): Promise<FioSuggestion[]> {
  if (!query.trim()) return Promise.resolve([]);
  return post<FioSuggestion>("/suggest/fio", { query, count: 7, parts });
}
