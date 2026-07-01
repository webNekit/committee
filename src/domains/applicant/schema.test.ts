import { describe, expect, it } from "vitest";

import { emptyApplicant } from "./hooks/useApplicantForm";
import {
  applicantSchema,
  personalDataSchema,
  passportDataSchema,
} from "./schema";
import type { ApplicantData } from "./types";

/** Полностью валидный абитуриент для позитивных проверок. */
function validApplicant(): ApplicantData {
  return {
    personal: {
      lastName: "Иванов",
      firstName: "Иван",
      middleName: "Иванович",
      birthDate: "2008-05-01",
      birthPlace: "г. Волгоград",
      gender: "male",
      citizenship: "Российская Федерация",
      settlementType: "city",
      snils: "123-456-789 00",
      phone: "+7 (999) 123-45-67",
      email: "ivan@mail.ru",
    },
    passport: {
      series: "1234",
      number: "567890",
      issuedBy: "ГУ МВД",
      issuedDate: "2022-06-01",
      divisionCode: "340-001",
      registrationAddress: "г. Волгоград, ул. Мира, 1",
      actualAddress: "",
      sameAsRegistration: true,
    },
    parents: [
      {
        role: "mother",
        fullName: "Иванова Мария Петровна",
        phone: "+7 (999) 000-11-22",
        workplace: "",
      },
    ],
    previousEducation: {
      institutionName: "МОУ СОШ № 1",
      finishedYear: "2024",
      documentType: "attestat",
      documentSeries: "12 АБ",
      documentNumber: "0001234",
    },
    educationConditions: {
      specialty: "Информационные системы и программирование",
      specialtyCode: "09.02.07",
      educationForm: "full-time",
      baseEducation: "9",
      foreignLanguage: "english",
      fundingBasis: "budget",
      professionalitet: false,
      cipher: "ИС-25-001",
      contractNumber: "",
      applicationDate: "2026-06-20",
      enrollmentYear: 2026,
    },
  };
}

describe("applicantSchema", () => {
  it("принимает полностью валидные данные", () => {
    expect(applicantSchema.safeParse(validApplicant()).success).toBe(true);
  });

  it("отклоняет пустого абитуриента (emptyApplicant)", () => {
    expect(applicantSchema.safeParse(emptyApplicant()).success).toBe(false);
  });
});

describe("personalDataSchema — граничные случаи", () => {
  const base = validApplicant().personal;

  it("СНИЛС в неверном формате не проходит", () => {
    const r = personalDataSchema.safeParse({ ...base, snils: "12345678900" });
    expect(r.success).toBe(false);
  });

  it("телефон без +7 не проходит", () => {
    const r = personalDataSchema.safeParse({ ...base, phone: "89991234567" });
    expect(r.success).toBe(false);
  });

  it("латиница в фамилии не проходит", () => {
    const r = personalDataSchema.safeParse({ ...base, lastName: "Ivanov" });
    expect(r.success).toBe(false);
  });

  it("пустой email допустим", () => {
    const r = personalDataSchema.safeParse({ ...base, email: "" });
    expect(r.success).toBe(true);
  });

  it("некорректный email не проходит", () => {
    const r = personalDataSchema.safeParse({ ...base, email: "not-an-email" });
    expect(r.success).toBe(false);
  });
});

describe("passportDataSchema — фактический адрес", () => {
  const base = validApplicant().passport;

  it("при sameAsRegistration=false требует фактический адрес", () => {
    const r = passportDataSchema.safeParse({
      ...base,
      sameAsRegistration: false,
      actualAddress: "",
    });
    expect(r.success).toBe(false);
  });

  it("при sameAsRegistration=false с адресом — валидно", () => {
    const r = passportDataSchema.safeParse({
      ...base,
      sameAsRegistration: false,
      actualAddress: "г. Волжский, ул. Ленина, 2",
    });
    expect(r.success).toBe(true);
  });

  it("серия из 3 цифр не проходит", () => {
    const r = passportDataSchema.safeParse({ ...base, series: "123" });
    expect(r.success).toBe(false);
  });
});
