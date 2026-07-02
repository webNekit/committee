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

const EMPTY_REPRESENTATIVE = {
  role: "",
  fullName: "",
  phone: "",
  birthDate: "",
  birthPlace: "",
  snils: "",
  passportSeries: "",
  passportNumber: "",
  passportSeriesNumber: "",
  passportIssuedBy: "",
  passportIssuedDate: "",
  registrationAddress: "",
  email: "",
};

const SETTLEMENT_LABEL: Record<string, string> = {
  city: "город",
  rural: "сельский населённый пункт",
};

const FUNDING_LABEL: Record<string, string> = {
  budget: "бюджет",
  contract: "договор",
};

/** Совершеннолетний ли абитуриент на дату подачи заявления. */
function isAdultAt(birthISO: string, atISO: string): boolean {
  const birth = new Date(birthISO);
  const at = new Date(atISO);
  if (Number.isNaN(birth.getTime()) || Number.isNaN(at.getTime())) return false;
  let age = at.getFullYear() - birth.getFullYear();
  const m = at.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && at.getDate() < birth.getDate())) age--;
  return age >= 18;
}

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

  // Заказчик по договору = отмеченный представитель или первый.
  const rep = data.parents.find((p) => p.isContractCustomer) ?? data.parents[0];
  const representative = rep
    ? {
        role: roleLabel(rep.role),
        fullName: rep.fullName,
        phone: rep.phone,
        birthDate: formatDate(rep.birthDate),
        birthPlace: rep.birthPlace || "",
        snils: rep.snils || "",
        passportSeries: rep.passportSeries || "",
        passportNumber: rep.passportNumber || "",
        passportSeriesNumber:
          `${rep.passportSeries || ""} ${rep.passportNumber || ""}`.trim(),
        passportIssuedBy: rep.passportIssuedBy || "",
        passportIssuedDate: formatDate(rep.passportIssuedDate),
        registrationAddress: rep.registrationAddress || "",
        email: rep.email || "",
      }
    : null;

  const adult = isAdultAt(
    personal.birthDate,
    educationConditions.applicationDate,
  );

  // Обучающийся (всегда абитуриент).
  const student = {
    fullName: fullName(data),
    birthDate: formatDate(personal.birthDate),
    birthPlace: personal.birthPlace,
    snils: personal.snils,
    passportSeries: passport.series,
    passportNumber: passport.number,
    passportSeriesNumber: `${passport.series} ${passport.number}`.trim(),
    passportIssuedBy: passport.issuedBy,
    passportIssuedDate: formatDate(passport.issuedDate),
    registrationAddress: passport.registrationAddress,
    phone: personal.phone,
    email: personal.email || "",
  };

  // Заказчик по договору: совершеннолетний — сам; иначе — представитель.
  const customer =
    adult || !representative ? { role: "", ...student } : representative;

  return {
    // Общие
    today: today(),
    fio: fullName(data),
    isAdult: adult,
    isMinor: !adult,
    applicationDate: formatDate(educationConditions.applicationDate),

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
      citizenship: personal.citizenship,
      settlementType: SETTLEMENT_LABEL[personal.settlementType] ?? "",
      cityBox: personal.settlementType === "city" ? "☑" : "☐",
      ruralBox: personal.settlementType === "rural" ? "☑" : "☐",
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
      documentDate: formatDate(previousEducation.documentDate),
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
      fundingBasis: FUNDING_LABEL[educationConditions.fundingBasis] ?? "бюджет",
      professionalitet: educationConditions.professionalitet,
    },

    // Родители: массив (для циклов {#parents}…{/parents}) и по индексу.
    parents,
    parent1: parents[0] ?? EMPTY_PARENT,
    parent2: parents[1] ?? EMPTY_PARENT,

    // Заказчик по договору (для несовершеннолетнего — представитель).
    representative: representative ?? EMPTY_REPRESENTATIVE,

    // Для договора: обучающийся и заказчик (адаптируется под совершеннолетие).
    student,
    customer,
  };
}

export type TemplateData = ReturnType<typeof buildTemplateData>;
