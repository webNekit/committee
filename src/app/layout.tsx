import type { Metadata } from "next";
import "./globals.css";
import {
  ThemeProvider,
  themeInitScript,
} from "@/shared/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Приёмная комиссия — ГБПОУ «Волгоградский технический колледж»",
  description:
    "Система автоматизации документооборота приёмной комиссии: ввод данных абитуриента и формирование комплекта документов.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="antialiased">
        {/* Установка темы до гидрации — предотвращает мигание. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
