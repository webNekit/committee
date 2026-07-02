"use client";

import { useEffect, useRef } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  applicantSchema,
  educationConditionsSchema,
  parentDataSchema,
  passportDataSchema,
  personalDataSchema,
  previousEducationSchema,
} from "../schema";
import type { ApplicantData } from "../types";

/** Статусы заполнения секций формы (для галочек в сайдбаре). */
export type SectionStatus = Record<
  "conditions" | "personal" | "passport" | "education" | "parents",
  boolean
>;

const STORAGE_KEY = "committee:applicant-draft";
const AUTOSAVE_INTERVAL = 30_000; // 30 секунд

export const emptyApplicant = (): ApplicantData => ({
  personal: {
    lastName: "",
    firstName: "",
    middleName: "",
    birthDate: "",
    birthPlace: "",
    gender: "male",
    citizenship: "Российская Федерация",
    settlementType: "city",
    snils: "",
    phone: "",
    email: "",
  },
  passport: {
    series: "",
    number: "",
    issuedBy: "",
    issuedDate: "",
    divisionCode: "",
    registrationAddress: "",
    actualAddress: "",
    sameAsRegistration: true,
  },
  parents: [{ role: "mother", fullName: "", phone: "", workplace: "" }],
  previousEducation: {
    institutionName: "",
    finishedYear: "",
    documentType: "attestat",
    documentSeries: "",
    documentNumber: "",
    documentDate: "",
  },
  educationConditions: {
    specialty: "",
    specialtyCode: "",
    educationForm: "full-time",
    baseEducation: "9",
    foreignLanguage: "english",
    fundingBasis: "budget",
    professionalitet: false,
    cipher: "",
    contractNumber: "",
    applicationDate: new Date().toISOString().slice(0, 10),
    enrollmentYear: new Date().getFullYear(),
  },
});

/**
 * Тестовые данные для проверки: несовершеннолетний абитуриент, платное обучение,
 * специальность в рамках профессионалитета (с реальным бланком договора),
 * представитель-Заказчик с полными данными. Экземпляр покрывает все документы.
 */
export const sampleApplicant = (): ApplicantData => ({
  personal: {
    lastName: "Иванов",
    firstName: "Иван",
    middleName: "Иванович",
    birthDate: "2009-09-15",
    birthPlace: "г. Волгоград",
    gender: "male",
    citizenship: "Российская Федерация",
    settlementType: "city",
    snils: "123-456-789 00",
    phone: "+7 (999) 123-45-67",
    email: "ivanov@mail.ru",
  },
  passport: {
    series: "1820",
    number: "654321",
    issuedBy: "ГУ МВД России по Волгоградской области",
    issuedDate: "2023-10-01",
    divisionCode: "340-001",
    registrationAddress: "г. Волгоград, ул. Мира, д. 1, кв. 10",
    actualAddress: "",
    sameAsRegistration: true,
  },
  parents: [
    {
      role: "mother",
      fullName: "Иванова Мария Петровна",
      phone: "+7 (999) 111-22-33",
      workplace: "ООО «Ромашка», бухгалтер",
      isContractCustomer: true,
      birthDate: "1985-03-20",
      birthPlace: "г. Волгоград",
      snils: "111-222-333 44",
      passportSeries: "1805",
      passportNumber: "112233",
      passportIssuedBy: "ОВД Центрального района г. Волгограда",
      passportIssuedDate: "2005-04-15",
      registrationAddress: "г. Волгоград, ул. Мира, д. 1, кв. 10",
      email: "ivanova@mail.ru",
    },
  ],
  previousEducation: {
    institutionName: "МОУ СОШ № 1 г. Волгограда",
    finishedYear: "2026",
    documentType: "attestat",
    documentSeries: "34 АБ",
    documentNumber: "0001234",
    documentDate: "2026-06-25",
  },
  educationConditions: {
    specialty:
      "Техническое обслуживание и ремонт двигателей, систем и агрегатов автомобилей",
    specialtyCode: "23.02.07",
    educationForm: "full-time",
    baseEducation: "9",
    foreignLanguage: "english",
    fundingBasis: "contract",
    professionalitet: true,
    cipher: "ТО-25-001",
    contractNumber: "Д-2026/001",
    applicationDate: new Date().toISOString().slice(0, 10),
    enrollmentYear: new Date().getFullYear(),
  },
});

/** Загрузка черновика из localStorage (только в браузере). */
function loadDraft(): ApplicantData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ApplicantData) : null;
  } catch {
    return null;
  }
}

export interface UseApplicantFormResult {
  form: UseFormReturn<ApplicantData>;
  completion: number; // процент заполнения формы (0–100)
  sectionStatus: SectionStatus; // валидность секций (для галочек)
  clearDraft: () => void;
}

/** Подсчёт процента заполненных полей (включая обязательные родителя). */
function calcCompletion(data: ApplicantData): number {
  const values: unknown[] = [
    data.personal.lastName,
    data.personal.firstName,
    data.personal.middleName,
    data.personal.birthDate,
    data.personal.birthPlace,
    data.personal.gender,
    data.personal.snils,
    data.personal.phone,
    data.passport.series,
    data.passport.number,
    data.passport.issuedBy,
    data.passport.issuedDate,
    data.passport.divisionCode,
    data.passport.registrationAddress,
    data.passport.sameAsRegistration ? "ok" : data.passport.actualAddress,
    data.previousEducation.institutionName,
    data.previousEducation.finishedYear,
    data.previousEducation.documentType,
    data.previousEducation.documentSeries,
    data.previousEducation.documentNumber,
    data.educationConditions.specialty,
    data.educationConditions.specialtyCode,
    data.educationConditions.educationForm,
    data.educationConditions.baseEducation,
    data.educationConditions.foreignLanguage,
    data.educationConditions.cipher,
    data.educationConditions.enrollmentYear,
    data.parents[0]?.role,
    data.parents[0]?.fullName,
    data.parents[0]?.phone,
  ];
  const filled = values.filter(
    (v) => v !== undefined && v !== null && String(v).trim() !== "",
  ).length;
  return Math.round((filled / values.length) * 100);
}

/** Валидность каждой секции (для галочек в сайдбаре). */
function calcSectionStatus(data: ApplicantData): SectionStatus {
  return {
    conditions: educationConditionsSchema.safeParse(data.educationConditions)
      .success,
    personal: personalDataSchema.safeParse(data.personal).success,
    passport: passportDataSchema.safeParse(data.passport).success,
    education: previousEducationSchema.safeParse(data.previousEducation)
      .success,
    parents:
      Array.isArray(data.parents) &&
      data.parents.length > 0 &&
      data.parents.every((p) => parentDataSchema.safeParse(p).success),
  };
}

export function useApplicantForm(): UseApplicantFormResult {
  const form = useForm<ApplicantData>({
    resolver: zodResolver(applicantSchema),
    defaultValues: emptyApplicant(),
    mode: "onBlur",
  });

  const loadedRef = useRef(false);

  // Загрузка черновика один раз при монтировании.
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const draft = loadDraft();
    if (draft) form.reset(draft);
  }, [form]);

  // Автосохранение каждые 30 секунд.
  useEffect(() => {
    const id = setInterval(() => {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(form.getValues()),
        );
      } catch {
        // localStorage недоступен — игнорируем.
      }
    }, AUTOSAVE_INTERVAL);
    return () => clearInterval(id);
  }, [form]);

  const watched = form.watch();
  const completion = calcCompletion(watched);
  const sectionStatus = calcSectionStatus(watched);

  const clearDraft = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // игнорируем
    }
  };

  return { form, completion, sectionStatus, clearDraft };
}
