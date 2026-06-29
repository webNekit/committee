"use client";

import * as React from "react";
import Link from "next/link";
import { BookMarked, Check, X, type LucideIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

export interface SidebarSection {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface FormSidebarProps {
  title: string;
  subtitle?: string;
  sections: SidebarSection[];
  /** Карта завершённости секций по id (показывает галочку). */
  status?: Record<string, boolean>;
}

/** Боковая навигация по секциям формы со scroll-spy подсветкой активной. */
export function FormSidebar({
  title,
  subtitle,
  sections,
  status,
}: FormSidebarProps) {
  const [active, setActive] = React.useState(sections[0]?.id);
  // Секции, которые пользователь пролистал (попадали в область видимости).
  const [visited, setVisited] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length) {
          setVisited((prev) => {
            const next = new Set(prev);
            intersecting.forEach((e) => next.add(e.target.id));
            return next;
          });
        }
        const visible = intersecting.sort(
          (a, b) => b.intersectionRatio - a.intersectionRatio,
        );
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActive(id);
  };

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24 space-y-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="px-2 pb-3">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <nav className="space-y-1">
            {sections.map(({ id, label, icon: Icon }) => {
              const isActive = active === id;
              const done = status?.[id];
              // Крестик — если секцию пролистали, но она не заполнена.
              const incomplete = !done && visited.has(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollTo(id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{label}</span>
                  {done && (
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-green-600 text-white",
                      )}
                      title="Секция заполнена"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                  {incomplete && (
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-destructive text-destructive-foreground",
                      )}
                      title="Секция не заполнена"
                    >
                      <X className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="my-3 border-t" />

          <Link
            href="/reference"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <BookMarked className="h-4 w-4 shrink-0" />
            Справочная
          </Link>
        </div>
      </div>
    </aside>
  );
}
