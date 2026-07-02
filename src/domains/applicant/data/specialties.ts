"use client";

// Хранилище специальностей колледжа.
// База — specialties.json. Пользовательские изменения хранятся в localStorage,
// поэтому редактирование работает и на статическом хостинге (без backend).
// Через раздел «Справочная» список можно дополнять, удалять, импортировать и
// экспортировать в JSON (для последующей замены файла specialties.json в репозитории).

import { useSyncExternalStore } from "react";

import baseData from "./specialties.json";

export interface Specialty {
  code: string;
  name: string;
  /** Реализуется в рамках ФП «Профессионалитет» (влияет на бланк заявления). */
  professionalitet?: boolean;
}

export const BASE_SPECIALTIES = baseData as Specialty[];

const STORAGE_KEY = "committee:specialties";
const VERSION_KEY = "committee:specialties:version";
// Версия каталога. Меняется при правке specialties.json — тогда устаревший
// localStorage игнорируется и подгружается актуальный каталог из файла.
const CATALOG_VERSION = "2026-07-02-brochure-27";

let cache: Specialty[] | null = null;
const listeners = new Set<() => void>();

function read(): Specialty[] {
  if (cache) return cache;
  if (typeof window === "undefined") {
    cache = BASE_SPECIALTIES;
    return cache;
  }
  try {
    const ver = window.localStorage.getItem(VERSION_KEY);
    // Устаревшая (или отсутствующая) версия — берём актуальный каталог из файла.
    if (ver !== CATALOG_VERSION) {
      cache = BASE_SPECIALTIES;
      return cache;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Specialty[]) : null;
    cache = Array.isArray(parsed) && parsed.length ? parsed : BASE_SPECIALTIES;
  } catch {
    cache = BASE_SPECIALTIES;
  }
  return cache;
}

function commit(list: Specialty[]) {
  cache = list;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.localStorage.setItem(VERSION_KEY, CATALOG_VERSION);
  } catch {
    // localStorage недоступен — изменения останутся только в памяти.
  }
  listeners.forEach((l) => l());
}

export function subscribeSpecialties(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSpecialties(): Specialty[] {
  return read();
}

/** Поиск специальности по названию. */
export const findSpecialtyByName = (name: string): Specialty | undefined =>
  read().find((s) => s.name === name);

/** Добавить специальность (или обновить, если код уже есть). */
export function addSpecialty(specialty: Specialty): {
  ok: boolean;
  error?: string;
} {
  const code = specialty.code.trim();
  const name = specialty.name.trim();
  if (!code || !name) return { ok: false, error: "Заполните код и название" };
  const list = read();
  if (list.some((s) => s.code === code)) {
    return { ok: false, error: `Специальность с кодом ${code} уже есть` };
  }
  commit([
    ...list,
    { code, name, professionalitet: specialty.professionalitet ?? false },
  ]);
  return { ok: true };
}

/** Удалить специальность по коду. */
export function removeSpecialty(code: string) {
  commit(read().filter((s) => s.code !== code));
}

/** Сбросить список к стандартному (из specialties.json). */
export function resetSpecialties() {
  cache = BASE_SPECIALTIES;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(VERSION_KEY);
  } catch {
    // игнорируем
  }
  listeners.forEach((l) => l());
}

/** Экспорт текущего списка в форматированный JSON. */
export function exportSpecialtiesJson(): string {
  return JSON.stringify(read(), null, 2);
}

/** Импорт списка из JSON-строки. Возвращает результат валидации. */
export function importSpecialtiesJson(json: string): {
  ok: boolean;
  error?: string;
  count?: number;
} {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      return { ok: false, error: "Ожидался массив специальностей" };
    }
    const valid = parsed.every(
      (s) =>
        s &&
        typeof s.code === "string" &&
        typeof s.name === "string" &&
        s.code.trim() &&
        s.name.trim(),
    );
    if (!valid) {
      return {
        ok: false,
        error: "Каждый элемент должен содержать строки code и name",
      };
    }
    const list: Specialty[] = parsed.map((s) => ({
      code: String(s.code).trim(),
      name: String(s.name).trim(),
      professionalitet: Boolean(s.professionalitet),
    }));
    commit(list);
    return { ok: true, count: list.length };
  } catch {
    return { ok: false, error: "Некорректный JSON" };
  }
}

/** Реактивный хук: список специальностей, обновляется при изменениях. */
export function useSpecialties(): Specialty[] {
  return useSyncExternalStore(
    subscribeSpecialties,
    getSpecialties,
    () => BASE_SPECIALTIES,
  );
}
