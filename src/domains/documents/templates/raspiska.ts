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
import { formatDate } from "../utils/date-helpers";
import {
  buildDocx,
  collegeHeader,
  docTitle,
  documentTypeLabel,
  emptyLine,
  fullName,
  normalText,
} from "../utils/docx-helpers";

const FONT = "Times New Roman";

const cell = (text: string, bold = false, width?: number) =>
  new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold, size: 22, font: FONT })],
      }),
    ],
  });

/** Расписка о приёме документов. */
export async function generateRaspiska(
  data: ApplicantData,
): Promise<Uint8Array> {
  const docs = [
    `Документ об образовании (${documentTypeLabel(
      data.previousEducation.documentType,
    )})`,
    "Паспорт (копия)",
    "Фотографии 3×4",
    "Медицинская справка",
    "СНИЛС (копия)",
  ];

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          cell("№", true, 600),
          cell("Наименование документа", true, 6000),
          cell("Кол-во", true, 1500),
        ],
      }),
      ...docs.map(
        (name, i) =>
          new TableRow({
            children: [cell(String(i + 1)), cell(name), cell("")],
          }),
      ),
    ],
  });

  const children: (Paragraph | Table)[] = [
    ...collegeHeader(),
    docTitle("РАСПИСКА"),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 200 },
      children: [
        normalText(
          `Я, ${fullName(data)}, передал(а) в приёмную комиссию ${"ГБПОУ «Волгоградский технический колледж»"} следующие документы:`,
          24,
        ),
      ],
    }),
    table,
    emptyLine(),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [
        normalText(
          "Документы приняты приёмной комиссией для участия в конкурсе на поступление.",
          22,
        ),
      ],
    }),
    emptyLine(),
    emptyLine(),
    new Paragraph({
      children: [
        normalText(`Дата приёма документов: ${formatDate(new Date())}`, 22),
      ],
    }),
    emptyLine(),
    new Paragraph({
      children: [normalText("Подпись абитуриента: _________________", 22)],
    }),
    new Paragraph({
      children: [normalText("Подпись секретаря: _________________", 22)],
    }),
  ];

  return buildDocx(children);
}
