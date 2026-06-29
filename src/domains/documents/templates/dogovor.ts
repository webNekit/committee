import { AlignmentType, Paragraph, TextRun } from "docx";

import type { ApplicantData } from "@/domains/applicant/types";
import { formatDate } from "../utils/date-helpers";
import {
  boldText,
  buildDocx,
  COLLEGE_ADDRESS,
  COLLEGE_INN,
  COLLEGE_NAME,
  COLLEGE_NAME_FULL,
  COLLEGE_PHONE,
  docTitle,
  educationFormLabel,
  emptyLine,
  fullName,
  normalText,
} from "../utils/docx-helpers";

const FONT = "Times New Roman";

const para = (text: string) =>
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 22, font: FONT })],
  });

const clauseTitle = (text: string) =>
  new Paragraph({
    spacing: { before: 160, after: 80 },
    children: [boldText(text, 22)],
  });

/** Договор об образовании. */
export async function generateDogovor(
  data: ApplicantData,
): Promise<Uint8Array> {
  const { educationConditions } = data;
  const isPaid = Boolean(educationConditions.contractNumber);

  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [boldText(COLLEGE_NAME_FULL, 22)],
    }),
    emptyLine(),
    docTitle("ДОГОВОР ОБ ОБРАЗОВАНИИ"),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        normalText(
          `№ ${educationConditions.contractNumber || "_________"}`,
          22,
        ),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [normalText(`г. Волгоград, ${formatDate(new Date())}`, 22)],
    }),
    emptyLine(),

    para(
      `${COLLEGE_NAME}, именуемое в дальнейшем «Исполнитель», в лице директора, действующего на основании Устава, с одной стороны, и ${fullName(
        data,
      )}, именуемый(ая) в дальнейшем «Обучающийся», с другой стороны, заключили настоящий договор о нижеследующем.`,
    ),

    clauseTitle("1. Предмет договора"),
    para(
      `1.1. Исполнитель обязуется предоставить образовательную услугу по основной профессиональной образовательной программе среднего профессионального образования по специальности ${educationConditions.specialtyCode} «${educationConditions.specialty}», форма обучения — ${educationFormLabel(
        educationConditions.educationForm,
      )}, на базе ${educationConditions.baseEducation} классов.`,
    ),
    para(
      "1.2. Обучающийся обязуется освоить образовательную программу и выполнять требования Устава и локальных актов Исполнителя.",
    ),

    clauseTitle("2. Права и обязанности сторон"),
    para(
      "2.1. Исполнитель обязан организовать образовательный процесс в соответствии с ФГОС СПО и учебным планом.",
    ),
    para(
      "2.2. Обучающийся обязан добросовестно осваивать программу, соблюдать правила внутреннего распорядка.",
    ),
    para(
      "2.3. Стороны вправе требовать друг от друга исполнения обязательств по настоящему договору.",
    ),

    clauseTitle("3. Срок обучения"),
    para(
      `3.1. Срок освоения образовательной программы устанавливается учебным планом. Год поступления: ${educationConditions.enrollmentYear}.`,
    ),

    clauseTitle("4. Стоимость обучения и порядок оплаты"),
    para(
      isPaid
        ? "4.1. Обучение осуществляется на платной основе. Стоимость и порядок оплаты определяются дополнительным соглашением к настоящему договору."
        : "4.1. Обучение осуществляется за счёт средств бюджета (бюджетная основа). Плата за обучение не взимается.",
    ),

    clauseTitle("5. Реквизиты и подписи сторон"),
    new Paragraph({
      children: [boldText("Исполнитель:", 22)],
    }),
    para(COLLEGE_NAME_FULL),
    para(`Адрес: ${COLLEGE_ADDRESS}`),
    para(`Тел.: ${COLLEGE_PHONE}, ИНН: ${COLLEGE_INN}`),
    para("Подпись: _________________ / директор /"),
    emptyLine(),
    new Paragraph({
      children: [boldText("Обучающийся:", 22)],
    }),
    para(fullName(data)),
    para(`Телефон: ${data.personal.phone}`),
    para(`Адрес регистрации: ${data.passport.registrationAddress}`),
    para("Подпись: _________________"),
  ];

  return buildDocx(children);
}
