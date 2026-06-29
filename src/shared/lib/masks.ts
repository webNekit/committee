// Маски ввода без сторонних библиотек (правило промта №6).
// Каждая функция принимает "грязную" строку и возвращает форматированное значение.

/** Оставляет только цифры. */
const digits = (value: string) => value.replace(/\D/g, "");

/** СНИЛС: 123-456-789 00 */
export function maskSnils(value: string): string {
  const d = digits(value).slice(0, 11);
  const parts = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9), d.slice(9, 11)];
  let result = parts[0];
  if (d.length > 3) result += "-" + parts[1];
  if (d.length > 6) result += "-" + parts[2];
  if (d.length > 9) result += " " + parts[3];
  return result;
}

/** Телефон: +7 (999) 123-45-67 */
export function maskPhone(value: string): string {
  let d = digits(value);
  // Нормализуем ведущую 8 или 7 к коду страны.
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);
  const rest = d.slice(1); // без кода страны
  let result = "+7";
  if (rest.length > 0) result += " (" + rest.slice(0, 3);
  if (rest.length >= 3) result += ")";
  if (rest.length > 3) result += " " + rest.slice(3, 6);
  if (rest.length > 6) result += "-" + rest.slice(6, 8);
  if (rest.length > 8) result += "-" + rest.slice(8, 10);
  return result;
}

/** Серия паспорта: 4 цифры. */
export function maskPassportSeries(value: string): string {
  return digits(value).slice(0, 4);
}

/** Номер паспорта: 6 цифр. */
export function maskPassportNumber(value: string): string {
  return digits(value).slice(0, 6);
}

/** Код подразделения: 123-456 */
export function maskDivisionCode(value: string): string {
  const d = digits(value).slice(0, 6);
  if (d.length > 3) return d.slice(0, 3) + "-" + d.slice(3);
  return d;
}

/** Год (4 цифры). */
export function maskYear(value: string): string {
  return digits(value).slice(0, 4);
}
