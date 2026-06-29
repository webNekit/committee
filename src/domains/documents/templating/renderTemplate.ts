import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

import type { ApplicantData } from "@/domains/applicant/types";
import { buildTemplateData } from "./buildTemplateData";

/** Разделители плейсхолдеров: {{ поле }}. */
const DELIMITERS = { start: "{{", end: "}}" };

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
