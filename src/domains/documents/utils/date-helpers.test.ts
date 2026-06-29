import { describe, expect, it } from "vitest";

import { formatDate, formatDateLong, today } from "./date-helpers";

describe("formatDate", () => {
  it("форматирует ISO-дату в ДД.ММ.ГГГГ", () => {
    expect(formatDate("2026-06-29")).toBe("29.06.2026");
  });

  it("дополняет нулями день и месяц", () => {
    expect(formatDate("2026-01-05")).toBe("05.01.2026");
  });

  it("пустое значение → плейсхолдер", () => {
    expect(formatDate("")).toBe("__.__.____");
    expect(formatDate(null)).toBe("__.__.____");
    expect(formatDate(undefined)).toBe("__.__.____");
  });

  it("некорректная дата → плейсхолдер", () => {
    expect(formatDate("не дата")).toBe("__.__.____");
  });
});

describe("formatDateLong", () => {
  it("форматирует дату прописью с месяцем", () => {
    expect(formatDateLong("2026-06-29")).toBe("29 июня 2026 г.");
  });

  it("пустое значение → плейсхолдер", () => {
    expect(formatDateLong("")).toBe("«___» __________ ____ г.");
  });
});

describe("today", () => {
  it("возвращает строку в формате ДД.ММ.ГГГГ", () => {
    expect(today()).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
  });
});
