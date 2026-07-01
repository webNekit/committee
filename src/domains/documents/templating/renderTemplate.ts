import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

import type { ApplicantData } from "@/domains/applicant/types";
import { buildTemplateData } from "./buildTemplateData";

/** Разделители плейсхолдеров: {{ поле }}. */
const DELIMITERS = { start: "{{", end: "}}" };

/** Резолвинг точечных путей ({{customer.fullName}}) и текущего скоупа ({{.}}). */
function resolvePath(scope: unknown, tag: string): unknown {
  if (tag === ".") return scope;
  return tag
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      scope,
    );
}

const dottedParser = (tag: string) => ({
  get: (scope: unknown) => resolvePath(scope, tag),
});

/**
 * Заполняет Word-шаблон (.docx) данными абитуриента и возвращает готовый файл.
 * @param content содержимое шаблона (ArrayBuffer / Uint8Array / binary string)
 */
export function renderDocxTemplate(
  content: ArrayBuffer | Uint8Array | string,
  data: ApplicantData,
): Uint8Array {
  const zip = new PizZip(content as never);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: DELIMITERS,
    parser: dottedParser,
    // Пустые/отсутствующие значения → пустая строка (а не "undefined").
    nullGetter: () => "",
  });
  doc.render(buildTemplateData(data));
  return doc.getZip().generate({ type: "uint8array" });
}

/** Загружает шаблон по URL (например, из /templates/...) и заполняет его. */
export async function renderTemplateFromUrl(
  url: string,
  data: ApplicantData,
): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Не удалось загрузить шаблон: ${url} (${res.status})`);
  }
  const buffer = await res.arrayBuffer();
  return renderDocxTemplate(buffer, data);
}
