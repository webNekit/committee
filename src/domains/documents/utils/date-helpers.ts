// Форматирование дат для документов.

const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

/** ISO/Date → "29.06.2026". Пустое/некорректное → "__.__.____". */
export function formatDate(iso: string | Date | undefined | null): string {
  if (!iso) return "__.__.____";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "__.__.____";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

/** ISO/Date → "29 июня 2026 г.". Пустое/некорректное → "«___» __________ ____ г.". */
export function formatDateLong(iso: string | Date | undefined | null): string {
  if (!iso) return "«___» __________ ____ г.";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "«___» __________ ____ г.";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} г.`;
}

/** Текущая дата в формате "29.06.2026". */
export function today(): string {
  return formatDate(new Date());
}
