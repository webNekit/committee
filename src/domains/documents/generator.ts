import type { ApplicantData } from "@/domains/applicant/types";
import { generateAnketa } from "./templates/anketa";
import { generateLichnoeDelo } from "./templates/lichnoe-delo";
import { generateOpis } from "./templates/opis";
import { generateRaspiska } from "./templates/raspiska";
import { generateEkzamenList } from "./templates/ekzamen-list";
import { generateContract } from "./templating/contracts";
import type { DocumentId, DocumentTemplate, GeneratedDocument } from "./types";

/** Реестр всех шаблонов комплекта (6 документов). */
export const DOCUMENT_TEMPLATES: readonly DocumentTemplate[] = [
  {
    id: "anketa",
    title: "Анкета абитуриента",
    fileSuffix: "анкета",
    generate: generateAnketa,
  },
  {
    id: "lichnoe-delo",
    title: "Титульный лист личного дела",
    fileSuffix: "личное-дело",
    generate: generateLichnoeDelo,
  },
  {
    id: "opis",
    title: "Опись документов",
    fileSuffix: "опись",
    generate: generateOpis,
  },
  {
    id: "raspiska",
    title: "Расписка",
    fileSuffix: "расписка",
    generate: generateRaspiska,
  },
  {
    id: "ekzamen-list",
    title: "Экзаменационный лист",
    fileSuffix: "экзамен-лист",
    generate: generateEkzamenList,
  },
  {
    id: "dogovor",
    title: "Договор об образовании",
    fileSuffix: "договор",
    generate: generateContract,
  },
] as const;

/** Безопасное имя для файла (оставляем буквы РУ/EN, цифры, дефис, подчёркивание). */
const safe = (s: string) => s.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\-_]+/g, "").trim();

/** Имя файла документа: Фамилия_Имя_суффикс.docx */
export function buildFileName(data: ApplicantData, suffix: string): string {
  const last = safe(data.personal.lastName) || "Абитуриент";
  const first = safe(data.personal.firstName) || "";
  const base = [last, first].filter(Boolean).join("_");
  return `${base}_${suffix}.docx`;
}

export type DocStatus = "generating" | "done";

/** Колбэк прогресса: вызывается при смене статуса каждого документа. */
export type ProgressCallback = (id: DocumentId, status: DocStatus) => void;

/**
 * Генерация всех 6 документов последовательно — чтобы наглядно показывать
 * этап формирования каждого файла через колбэк прогресса.
 */
export async function generateAllDocuments(
  data: ApplicantData,
  onProgress?: ProgressCallback,
): Promise<GeneratedDocument[]> {
  const results: GeneratedDocument[] = [];
  for (const tpl of DOCUMENT_TEMPLATES) {
    onProgress?.(tpl.id, "generating");
    const content = await tpl.generate(data);
    results.push({
      id: tpl.id,
      title: tpl.title,
      fileName: buildFileName(data, tpl.fileSuffix),
      content,
    });
    onProgress?.(tpl.id, "done");
  }
  return results;
}
