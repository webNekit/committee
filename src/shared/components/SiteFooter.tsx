/** Нижний колонтитул приложения. */
export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
        <div>
          <span className="font-semibold text-foreground">
            Система приёмной комиссии
          </span>{" "}
          · © {new Date().getFullYear()} ГБПОУ «Волгоградский технический
          колледж»
        </div>
        <div className="text-muted-foreground/80">
          Документы формируются локально в браузере
        </div>
      </div>
    </footer>
  );
}
