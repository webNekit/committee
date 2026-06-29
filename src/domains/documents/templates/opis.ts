import {
  AlignmentType,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

import type { ApplicantData } from "@/domains/applicant/types";
import {
  buildDocx,
  collegeHeader,
  docTitle,
  documentTypeLabel,
  emptyLine,
  fieldRow,
  fullName,
} from "../utils/docx-helpers";

const FONT = "Times New Roman";

const cell = (text: string, opts: { bold?: boolean; width?: number } = {}) =>
  new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    children: [
      new Paragraph({
        children: [
          new TextRun({ text, bold: opts.bold, size: 22, font: FONT }),
        ],
      }),
    ],
  });

/** Опись документов личного дела. */
export async function generateOpis(data: ApplicantData): Promise<Uint8Array> {
  const docs = [
    "Заявление о приёме",
    "Паспорт (копия)",
    `Документ об образовании (${documentTypeLabel(
      data.previousEducation.documentType,
    )}) и приложение`,
    "Фотографии 3×4",
    "Медицинская справка (форма 086/у)",
    "СНИЛС (копия)",
    "Прочие документы",
  ];

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      cell("№", { bold: true, width: 600 }),
      cell("Наименование документа", { bold: true, width: 5000 }),
      cell("Кол-во листов", { bold: true, width: 1800 }),
      cell("Примечание", { bold: true, width: 2200 }),
    ],
  });

  const rows = docs.map(
    (name, i) =>
      new TableRow({
        children: [cell(String(i + 1)), cell(name), cell(""), cell("")],
      }),
  );

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...rows],
  });

  const children: (Paragraph | Table)[] = [
    ...collegeHeader(),
    docTitle("ОПИСЬ ДОКУМЕНТОВ ЛИЧНОГО ДЕЛА"),
    fieldRow("Абитуриент", fullName(data)),
    fieldRow("Шифр личного дела", data.educationConditions.cipher),
    emptyLine(),
    table,
    emptyLine(),
    emptyLine(),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: "Документы сдал (абитуриент): _________________ /__________________/",
          size: 22,
          font: FONT,
        }),
      ],
    }),
    emptyLine(),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: "Документы принял (секретарь): _________________ /__________________/",
          size: 22,
          font: FONT,
        }),
      ],
    }),
  ];

  return buildDocx(children);
}
