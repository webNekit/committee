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
  boldText,
  buildDocx,
  collegeHeader,
  docTitle,
  educationFormLabel,
  emptyLine,
  fieldRow,
  fullName,
  normalText,
} from "../utils/docx-helpers";

/** Рамка-плейсхолдер для фотографии. */
function photoBox(): Table {
  return new Table({
    width: { size: 3000, type: WidthType.DXA },
    alignment: AlignmentType.RIGHT,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 3000, type: WidthType.DXA },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 800, after: 800 },
                children: [normalText("место для фото", 20)],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/** Титульный лист личного дела. */
export async function generateLichnoeDelo(
  data: ApplicantData,
): Promise<Uint8Array> {
  const { educationConditions } = data;

  const children: (Paragraph | Table)[] = [
    ...collegeHeader(),
    photoBox(),
    emptyLine(),
    docTitle("ЛИЧНОЕ ДЕЛО"),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [boldText("обучающегося / абитуриента", 22)],
    }),
    emptyLine(),
    fieldRow("Шифр личного дела", educationConditions.cipher),
    fieldRow("Фамилия, имя, отчество", fullName(data)),
    fieldRow(
      "Специальность",
      `${educationConditions.specialtyCode} ${educationConditions.specialty}`,
    ),
    fieldRow(
      "Форма обучения",
      educationFormLabel(educationConditions.educationForm),
    ),
    fieldRow("Год поступления", String(educationConditions.enrollmentYear)),
    emptyLine(),
    emptyLine(),
    new Paragraph({
      children: [
        new TextRun({
          text: "Секретарь приёмной комиссии: _________________ /__________________/",
          size: 22,
          font: "Times New Roman",
        }),
      ],
    }),
  ];

  return buildDocx(children);
}
