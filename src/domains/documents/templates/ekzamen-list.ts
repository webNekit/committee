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
  emptyLine,
  fieldRow,
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

/** Экзаменационный лист / лист собеседования. */
export async function generateEkzamenList(
  data: ApplicantData,
): Promise<Uint8Array> {
  const emptyRow = () =>
    new TableRow({ children: [cell(""), cell(""), cell("")] });

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          cell("Дисциплина", true, 4000),
          cell("Оценка / результат", true, 3000),
          cell("Подпись экзаменатора", true, 3000),
        ],
      }),
      emptyRow(),
      emptyRow(),
      emptyRow(),
    ],
  });

  const children: (Paragraph | Table)[] = [
    ...collegeHeader(),
    docTitle("ЭКЗАМЕНАЦИОННЫЙ ЛИСТ / ЛИСТ СОБЕСЕДОВАНИЯ"),
    fieldRow("Абитуриент", fullName(data)),
    fieldRow(
      "Специальность",
      `${data.educationConditions.specialtyCode} ${data.educationConditions.specialty}`,
    ),
    fieldRow("Дата собеседования", "____________________"),
    emptyLine(),
    table,
    emptyLine(),
    new Paragraph({
      children: [normalText("Итоговая рекомендация: ____________________", 22)],
    }),
    emptyLine(),
    emptyLine(),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: "Председатель приёмной комиссии: _________________ /__________________/",
          size: 22,
          font: FONT,
        }),
      ],
    }),
  ];

  return buildDocx(children);
}
