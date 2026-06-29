// Типы домена подсказок (Dadata).

/** Универсальная подсказка Dadata. */
export interface Suggestion<D = Record<string, string>> {
  value: string;
  unrestricted_value?: string;
  data: D;
}

/** Подсказка адреса. */
export type AddressSuggestion = Suggestion<Record<string, string>>;

/** Подсказка ФИО (содержит предполагаемый пол). */
export type FioSuggestion = Suggestion<{
  gender?: string;
  surname?: string | null;
  name?: string | null;
  patronymic?: string | null;
}>;

/** Какие части ФИО запрашивать у Dadata. */
export type FioPart = "NAME" | "SURNAME" | "PATRONYMIC";
