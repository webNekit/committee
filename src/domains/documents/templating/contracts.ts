import type { ApplicantData } from "@/domains/applicant/types";
import { generateDogovor } from "../templates/dogovor";
import { renderTemplateFromUrl } from "./renderTemplate";

/**
 * Реестр реальных бланков договоров колледжа: код специальности → файл .docx
 * в public/templates/contracts/. Пока только «9 классов, очная».
 */
export const CONTRACT_TEMPLATES: Record<string, string> = {
  "09.02.06": "09.02.06.docx",
  "20.02.04": "20.02.04.docx",
  "21.02.19": "21.02.19.docx",
  "23.02.07": "23.02.07.docx",
  "25.02.08": "25.02.08.docx",
  "29.02.11": "29.02.11.docx",
  "38.02.01": "38.02.01.docx",
  "38.02.03": "38.02.03.docx",
  "38.02.07": "38.02.07.docx",
  "40.02.04": "40.02.04.docx",
};

/**
 * Генерация договора: если для выбранной специальности есть реальный бланк —
 * заполняем его; иначе — программная заглушка (`generateDogovor`).
 */
export async function generateContract(
  data: ApplicantData,
): Promise<Uint8Array> {
  const file = CONTRACT_TEMPLATES[data.educationConditions.specialtyCode];
  if (file) {
    try {
      return await renderTemplateFromUrl(`/templates/contracts/${file}`, data);
    } catch {
      // Не удалось загрузить/заполнить шаблон — используем запасной вариант.
    }
  }
  return generateDogovor(data);
}
