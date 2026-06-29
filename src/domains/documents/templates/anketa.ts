import type { ApplicantData } from "@/domains/applicant/types";
import { formatDate } from "../utils/date-helpers";
import {
  boldText,
  buildDocx,
  collegeHeader,
  docTitle,
  documentTypeLabel,
  emptyLine,
  fieldRow,
  fullName,
  genderLabel,
  normalText,
  roleLabel,
} from "../utils/docx-helpers";
import { Paragraph, AlignmentType } from "docx";

/** Анкета абитуриента. */
export async function generateAnketa(data: ApplicantData): Promise<Uint8Array> {
  const { personal, passport, previousEducation, parents } = data;

  const children: Paragraph[] = [
    ...collegeHeader(),
    docTitle("АНКЕТА АБИТУРИЕНТА"),
    emptyLine(),

    new Paragraph({ children: [boldText("1. Личные данные", 24)] }),
    fieldRow("Фамилия, имя, отчество", fullName(data)),
    fieldRow("Дата рождения", formatDate(personal.birthDate)),
    fieldRow("Место рождения", personal.birthPlace),
    fieldRow("Пол", genderLabel(personal.gender)),
    fieldRow("СНИЛС", personal.snils),
    fieldRow("Телефон", personal.phone),
    fieldRow("Email", personal.email ?? ""),
    emptyLine(),

    new Paragraph({ children: [boldText("2. Паспортные данные", 24)] }),
    fieldRow("Серия и номер", `${passport.series} ${passport.number}`),
    fieldRow("Кем выдан", passport.issuedBy),
    fieldRow("Дата выдачи", formatDate(passport.issuedDate)),
    fieldRow("Код подразделения", passport.divisionCode),
    fieldRow("Адрес регистрации", passport.registrationAddress),
    fieldRow(
      "Фактический адрес",
      passport.sameAsRegistration
        ? passport.registrationAddress
        : passport.actualAddress,
    ),
    emptyLine(),

    new Paragraph({ children: [boldText("3. Предыдущее образование", 24)] }),
    fieldRow("Учебное заведение", previousEducation.institutionName),
    fieldRow("Год окончания", previousEducation.finishedYear),
    fieldRow("Документ", documentTypeLabel(previousEducation.documentType)),
    fieldRow(
      "Серия и номер документа",
      `${previousEducation.documentSeries} ${previousEducation.documentNumber}`,
    ),
    emptyLine(),

    new Paragraph({
      children: [boldText("4. Сведения о родителях / представителях", 24)],
    }),
    ...parents.flatMap((p) => [
      fieldRow(roleLabel(p.role), p.fullName),
      fieldRow("   Телефон", p.phone),
      fieldRow("   Место работы", p.workplace ?? ""),
    ]),
    emptyLine(),
    emptyLine(),

    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [normalText("Подпись: _________________", 22)],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [normalText(`Дата: ${formatDate(new Date())}`, 22)],
    }),
  ];

  return buildDocx(children);
}
