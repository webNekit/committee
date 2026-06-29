import {
  AlignmentType,
  convertMillimetersToTwip,
  Document,
  type ISectionOptions,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

import type { ApplicantData } from "@/domains/applicant/types";

// Реквизиты колледжа.
export const COLLEGE_NAME = "ГБПОУ «Волгоградский технический колледж»";
export const COLLEGE_NAME_FULL =
  "Государственное бюджетное профессиональное образовательное учреждение «Волгоградский технический колледж»";
export const COLLEGE_ADDRESS = "400001, г. Волгоград, ул. Козловская, д. 57";
export const COLLEGE_PHONE = "(8442) 97-33-34";
export const COLLEGE_INN = "3445000000";
export const COLLEGE_DIRECTOR = "_______________ / И.О. Фамилия /";

const FONT = "Times New Roman";

export const boldText = (text: string, size = 24) =>
  new TextRun({ text, bold: true, size, font: FONT });

export const normalText = (text: string, size = 24) =>
  new TextRun({ text, size, font: FONT });

export const centeredParagraph = (runs: TextRun[]) =>
  new Paragraph({ children: runs, alignment: AlignmentType.CENTER });

export const emptyLine = () =>
  new Paragraph({ children: [new TextRun({ text: "", font: FONT })] });

/** Строка «Метка: значение» с подчёркиванием для пустого значения. */
export const fieldRow = (label: string, value: string) =>
  new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22, font: FONT }),
      new TextRun({
        text: value || "___________________",
        size: 22,
        font: FONT,
      }),
    ],
    spacing: { after: 100 },
  });

/** Заголовок документа по центру, жирный. */
export const docTitle = (text: string) =>
  new Paragraph({
    children: [new TextRun({ text, bold: true, size: 28, font: FONT })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
  });

/** Шапка с реквизитами колледжа (по центру). */
export const collegeHeader = (): Paragraph[] => [
  centeredParagraph([boldText(COLLEGE_NAME_FULL, 22)]),
  centeredParagraph([normalText(COLLEGE_ADDRESS, 20)]),
  centeredParagraph([normalText(`Тел.: ${COLLEGE_PHONE}`, 20)]),
  emptyLine(),
];

/** Полное ФИО абитуриента. */
export const fullName = (data: ApplicantData): string =>
  [data.personal.lastName, data.personal.firstName, data.personal.middleName]
    .filter(Boolean)
    .join(" ")
    .trim();

const FORM_LABEL: Record<string, string> = {
  "full-time": "очная",
  "part-time": "заочная",
  evening: "вечерняя",
};
export const educationFormLabel = (v: string) => FORM_LABEL[v] ?? v;

const LANG_LABEL: Record<string, string> = {
  english: "английский",
  german: "немецкий",
  french: "французский",
};
export const languageLabel = (v: string) => LANG_LABEL[v] ?? v;

const DOCTYPE_LABEL: Record<string, string> = {
  attestat: "аттестат",
  diplom: "диплом",
};
export const documentTypeLabel = (v: string) => DOCTYPE_LABEL[v] ?? v;

const ROLE_LABEL: Record<string, string> = {
  mother: "Мать",
  father: "Отец",
  guardian: "Опекун",
};
export const roleLabel = (v: string) => ROLE_LABEL[v] ?? v;

export const genderLabel = (v: string) =>
  v === "female" ? "женский" : "мужской";

/** Стандартные поля страницы A4: 20мм со всех сторон, левое 30мм. */
export const pageMargins = {
  top: convertMillimetersToTwip(20),
  right: convertMillimetersToTwip(20),
  bottom: convertMillimetersToTwip(20),
  left: convertMillimetersToTwip(30),
};

/** Сборка готового DOCX из набора параграфов/таблиц в Uint8Array. */
export async function buildDocx(
  children: ISectionOptions["children"],
): Promise<Uint8Array> {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 24 },
        },
      },
    },
    sections: [
      {
        properties: { page: { margin: pageMargins } },
        children,
      },
    ],
  });
  // Packer.toBuffer работает и в браузере (возвращает Uint8Array-совместимый буфер).
  const buffer = await Packer.toBuffer(doc);
  return new Uint8Array(buffer);
}
