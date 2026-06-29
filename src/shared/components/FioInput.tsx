"use client";

import * as React from "react";

import { useFioSuggestions } from "@/domains/suggestions/hooks/useFioSuggestions";
import type { FioPart, FioSuggestion } from "@/domains/suggestions/types";
import { SuggestInput, type SuggestOption } from "./SuggestInput";
import type { InputProps } from "@/shared/components/ui/input";

interface FioInputProps extends Omit<
  InputProps,
  "value" | "onChange" | "onSelect"
> {
  value: string;
  onChange: (value: string) => void;
  /** Какую часть ФИО подсказывать. */
  parts?: FioPart[];
  /** Колбэк определения пола по подсказке (для фамилии/имени). */
  onGenderDetected?: (gender: "male" | "female") => void;
}

/** Поле ФИО с подсказками Dadata и автоопределением пола. */
export function FioInput({
  value,
  onChange,
  parts,
  onGenderDetected,
  ...rest
}: FioInputProps) {
  const { suggestions, loading } = useFioSuggestions(value, parts);

  const options: SuggestOption<FioSuggestion>[] = React.useMemo(
    () =>
      suggestions.map((s) => ({
        value: s.value,
        label: s.value,
        payload: s,
      })),
    [suggestions],
  );

  return (
    <SuggestInput<FioSuggestion>
      {...rest}
      value={value}
      onValueChange={onChange}
      options={options}
      loading={loading}
      onSelect={(opt) => {
        const gender = opt.payload?.data.gender;
        if (gender === "MALE") onGenderDetected?.("male");
        else if (gender === "FEMALE") onGenderDetected?.("female");
      }}
    />
  );
}
