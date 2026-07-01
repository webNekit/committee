import type { ApplicantData } from "@/domains/applicant/types";
import { generateContract } from "./templating/contracts";
import { renderTemplateFromUrl } from "./templating/renderTemplate";
import type { GeneratedDocument } from "./types";

/** Согласия — заполняются для всех абитуриентов. */
const CONSENTS = [
  {
    id: "consent-pd",
    title: "Согласие на обработку персональных данных",
    fileSuffix: "согласие-обработка-ПД",
    file: "consent-pd.docx",
  },
  {
    id: "consent",
    title: "Согласие на обработку персональных данных (расширенное)",
    fileSuffix: "согласие",
    file: "consent.docx",
  },
  {
    id: "consent-transfer",
    title: "Согласие на передачу персональных данных",
    fileSuffix: "согласие-передача-ПД",
    file: "consent-transfer.docx",
  },
  {
    id: "consent-zp",
    title: "Согласие (зарплатный проект)",
    fileSuffix: "согласие-ЗП",
    file: "consent-zp.docx",
  },
] as const;

/** Один документ комплекта: описание + функция генерации содержимого. */
export interface PackItem {
  id: string;
  title: string;
  fileSuffix: string;
  produce: () => Promise<Uint8Array>;
}

/**
 * План комплекта по данным абитуриента:
 * - заявление (обычное или «Профессионалитет» — по специальности);
 * - договор (только при платном обучении, по коду специальности);
 * - согласия (всегда).
 */
export function planPack(data: ApplicantData): PackItem[] {
  const { professionalitet, fundingBasis } = data.educationConditions;
  const items: PackItem[] = [];

  const applicationFile = professionalitet
    ? "application-prof.docx"
    : "application.docx";
  items.push({
    id: "application",
    title: professionalitet
      ? "Заявление (Профессионалитет)"
      : "Заявление о приёме",
    fileSuffix: "заявление",
    produce: () =>
      renderTemplateFromUrl(`/templates/applications/${applicationFile}`, data),
  });

  if (fundingBasis === "contract") {
    items.push({
      id: "contract",
      title: "Договор об образовании",
      fileSuffix: "договор",
      produce: () => generateContract(data),
    });
  }

  for (const c of CONSENTS) {
    items.push({
      id: c.id,
      title: c.title,
      fileSuffix: c.fileSuffix,
      produce: () =>
        renderTemplateFromUrl(`/templates/consents/${c.file}`, data),
    });
  }

  return items;
}

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
export type ProgressCallback = (id: string, status: DocStatus) => void;

/**
 * Последовательная генерация комплекта — чтобы наглядно показывать
 * этап формирования каждого файла через колбэк прогресса.
 */
export async function generateAllDocuments(
  data: ApplicantData,
  onProgress?: ProgressCallback,
): Promise<GeneratedDocument[]> {
  const plan = planPack(data);
  const results: GeneratedDocument[] = [];
  for (const item of plan) {
    onProgress?.(item.id, "generating");
    const content = await item.produce();
    results.push({
      id: item.id,
      title: item.title,
      fileName: buildFileName(data, item.fileSuffix),
      content,
    });
    onProgress?.(item.id, "done");
  }
  return results;
}
