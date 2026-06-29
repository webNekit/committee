"use client";

import * as React from "react";

import { useAddressSuggestions } from "@/domains/suggestions/hooks/useAddressSuggestions";
import type { AddressSuggestion } from "@/domains/suggestions/types";
import { SuggestInput, type SuggestOption } from "./SuggestInput";
import type { InputProps } from "@/shared/components/ui/input";

interface AddressInputProps extends Omit<
  InputProps,
  "value" | "onChange" | "onSelect"
> {
  value: string;
  onChange: (value: string) => void;
  /** Только города/населённые пункты (для места рождения). */
  cityOnly?: boolean;
}

/** Короткое представление города из данных Dadata (с типом: «г Волгоград»). */
function cityLabel(s: AddressSuggestion): string {
  return (
    s.data.city_with_type ||
    s.data.settlement_with_type ||
    s.data.city ||
    s.data.settlement ||
    s.data.region_with_type ||
    s.value
  );
}

/** Поле адреса с подсказками Dadata. */
export function AddressInput({
  value,
  onChange,
  cityOnly = false,
  ...rest
}: AddressInputProps) {
  const { suggestions, loading } = useAddressSuggestions(value);

  const options: SuggestOption<AddressSuggestion>[] = React.useMemo(() => {
    if (!cityOnly) {
      // Полный адрес: что показано — то и вставляется.
      return suggestions.map((s) => ({
        value: s.value,
        label: s.value,
        payload: s,
      }));
    }
    // Режим города: дедупликация и совпадение отображаемого и вставляемого значения.
    const seen = new Set<string>();
    const list: SuggestOption<AddressSuggestion>[] = [];
    for (const s of suggestions) {
      const label = cityLabel(s);
      if (!label || seen.has(label)) continue;
      seen.add(label);
      list.push({ value: label, label, payload: s });
    }
    return list;
  }, [suggestions, cityOnly]);

  return (
    <SuggestInput<AddressSuggestion>
      {...rest}
      value={value}
      onValueChange={onChange}
      options={options}
      loading={loading}
    />
  );
}
