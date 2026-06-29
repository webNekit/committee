"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, GraduationCap } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { ThemeToggle } from "@/shared/components/theme/ThemeToggle";

/** Верхняя панель приложения. */
export function TopBar() {
  const pathname = usePathname();
  const onReference = pathname?.startsWith("/reference");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/applicant/new" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-foreground">
              Приёмная комиссия
            </span>
            <span className="block text-[11px] text-muted-foreground">
              Волгоградский технический колледж
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/reference"
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
              onReference
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <BookMarked className="h-4 w-4" />
            <span className="hidden sm:inline">Справочная</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
