"use client";

import * as React from "react";

import { cn } from "@/shared/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** id для якорной навигации из сайдбара. */
  id?: string;
}

/**
 * Секция формы: карточка с градиентной шапкой и иконкой-чипом.
 * Важно: без overflow-hidden — иначе выпадающие списки (Combobox/подсказки)
 * обрезаются краем карточки. Скругление шапки задаётся явно (rounded-t).
 */
export function FormSection({
  title,
  description,
  icon,
  children,
  className,
  id,
}: FormSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 rounded-xl border border-border bg-card shadow-sm transition-colors",
        className,
      )}
    >
      <header className="flex items-center gap-3 border-b border-border bg-secondary/60 px-5 py-4">
        {icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            {icon}
          </span>
        )}
        <div>
          <h2 className="text-base font-semibold leading-tight text-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

/** Обёртка поля: подпись + контент + сообщение об ошибке. */
export function Field({
  label,
  htmlFor,
  error,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
