"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Input, type InputProps } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

export interface SuggestOption<T = unknown> {
  /** Текст, который будет подставлен в поле. */
  value: string;
  /** Текст для отображения в списке (по умолчанию = value). */
  label?: string;
  /** Произвольные данные подсказки (для onSelect). */
  payload?: T;
}

interface SuggestInputProps<T> extends Omit<InputProps, "onSelect" | "value"> {
  value: string;
  onValueChange: (value: string) => void;
  options: SuggestOption<T>[];
  loading?: boolean;
  onSelect?: (option: SuggestOption<T>) => void;
}

/**
 * Input с выпадающим списком подсказок.
 * Клавиатура: ↑/↓ — навигация, Enter — выбор, Escape — закрыть.
 * Выбор фиксируется в момент нажатия (onMouseDown), поэтому в поле всегда
 * попадает именно та подсказка, по которой кликнули, даже если список в этот
 * момент обновляется новым ответом API.
 */
export function SuggestInput<T>({
  value,
  onValueChange,
  options,
  loading = false,
  onSelect,
  className,
  onKeyDown,
  onBlur,
  ...rest
}: SuggestInputProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  // Не открывать список снова сразу после выбора (выбор меняет value → новый fetch).
  const justSelected = React.useRef(false);

  // Закрытие при клике вне компонента.
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // При обновлении списка подсвечиваем первый элемент.
  React.useEffect(() => {
    setHighlight(0);
  }, [options]);

  const choose = (option: SuggestOption<T>) => {
    justSelected.current = true;
    onValueChange(option.value);
    onSelect?.(option);
    setOpen(false);
    setHighlight(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (!open || options.length === 0) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlight((h) => (h + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlight((h) => (h - 1 + options.length) % options.length);
        break;
      case "Enter":
        if (highlight >= 0 && highlight < options.length) {
          e.preventDefault();
          choose(options[highlight]);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  };

  const showList = open && (options.length > 0 || loading);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          {...rest}
          value={value}
          className={cn(className)}
          autoComplete="off"
          onChange={(e) => {
            onValueChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (justSelected.current) {
              justSelected.current = false;
              return;
            }
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>
      {showList && (
        <ul
          className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-popover p-1 text-sm shadow-lg"
          role="listbox"
        >
          {options.length === 0 && loading && (
            <li className="px-3 py-2 text-muted-foreground">Поиск…</li>
          )}
          {options.map((opt, i) => (
            <li
              key={`${opt.value}-${i}`}
              role="option"
              aria-selected={i === highlight}
              className={cn(
                "cursor-pointer rounded-sm px-3 py-2",
                i === highlight
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/60",
              )}
              // onMouseDown (а не onClick): фиксируем выбор до blur и до
              // возможного обновления списка ответом API.
              onMouseDown={(e) => {
                e.preventDefault();
                choose(opt);
              }}
              onMouseEnter={() => setHighlight(i)}
            >
              {opt.label ?? opt.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
