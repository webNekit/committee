import type { ApplicantData } from "@/domains/applicant/types";
import { formatDate, formatDateLong, today } from "../utils/date-helpers";
import {
  COLLEGE_ADDRESS,
  COLLEGE_INN,
  COLLEGE_NAME,
  COLLEGE_NAME_FULL,
  COLLEGE_PHONE,
  documentTypeLabel,
  educationFormLabel,
  fullName,
  genderLabel,
  languageLabel,
  roleLabel,
} from "../utils/docx-helpers";

const EMPTY_PARENT = { role: "", fullName: "", phone: "", workplace: "" };

/**
 * Преобразует данные абитуриента в готовый набор значений для плейсхолдеров
 * Word-шаблона (даты отформатированы, перечисления — словами). Ключи —
 * см. справочник TEMPLATE_FIELDS.md.
 */
export function buildTemplateData(data: ApplicantData) {
  const { personal, passport, previousEducation, educationConditions } = data;

  const parents = data.parents.map((p) => ({
    role: roleLabel(p.role),
    fullName: p.fullName,
    phone: p.phone,
    workplace: p.workplace || "",
  }));

  return {
    // Общие
    today: today(),
    fio: fullName(data),

    // Реквизиты колледжа
    college: {
      name: COLLEGE_NAME,
      nameFull: COLLEGE_NAME_FULL,
      address: COLLEGE_ADDRESS,
      phone: COLLEGE_PHONE,
      inn: COLLEGE_INN,
    },

    // Личные данные
    personal: {
      lastName: personal.lastName,
      firstName: personal.firstName,
      middleName: personal.middleName,
      birthDate: formatDate(personal.birthDate),
      birthDateLong: formatDateLong(personal.birthDate),
      birthPlace: personal.birthPlace,
      gender: genderLabel(personal.gender),
      snils: personal.snils,
      phone: personal.phone,
      email: personal.email || "",
    },

    // Паспорт и адреса
    passport: {
      series: passport.series,
      number: passport.number,
      seriesNumber: `${passport.series} ${passport.number}`.trim(),
      issuedBy: passport.issuedBy,
      issuedDate: formatDate(passport.issuedDate),
      divisionCode: passport.divisionCode,
      registrationAddress: passport.registrationAddress,
      actualAddress: passport.sameAsRegistration
        ? passport.registrationAddress
        : passport.actualAddress,
    },

    // Предыдущее образование
    education: {
      institutionName: previousEducation.institutionName,
      finishedYear: previousEducation.finishedYear,
      documentType: documentTypeLabel(previousEducation.documentType),
      documentSeries: previousEducation.documentSeries,
      documentNumber: previousEducation.documentNumber,
    },

    // Условия обучения
    conditions: {
      specialty: educationConditions.specialty,
      specialtyCode: educationConditions.specialtyCode,
      educationForm: educationFormLabel(educationConditions.educationForm),
      baseEducation: educationConditions.baseEducation,
      foreignLanguage: languageLabel(educationConditions.foreignLanguage),
      cipher: educationConditions.cipher,
      contractNumber: educationConditions.contractNumber || "",
      enrollmentYear: String(educationConditions.enrollmentYear),
      fundingBasis: educationConditions.contractNumber ? "платная" : "бюджет",
    },

    // Родители: массив (для циклов {#parents}…{/parents}) и по индексу.
    parents,
    parent1: parents[0] ?? EMPTY_PARENT,
    parent2: parents[1] ?? EMPTY_PARENT,
  };
}

export type TemplateData = ReturnType<typeof buildTemplateData>;
