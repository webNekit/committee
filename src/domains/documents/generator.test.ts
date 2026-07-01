import { describe, expect, it } from "vitest";

import {
  buildFileName,
  DOCUMENT_TEMPLATES,
  generateAllDocuments,
} from "./generator";
import type { ApplicantData } from "@/domains/applicant/types";

function sampleApplicant(): ApplicantData {
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
        workplace: "ООО Ромашка",
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

describe("buildFileName", () => {
  it("формирует имя из фамилии, имени и суффикса", () => {
    expect(buildFileName(sampleApplicant(), "анкета")).toBe(
      "Иванов_Иван_анкета.docx",
    );
  });

  it("использует запасное имя при пустой фамилии", () => {
    const data = sampleApplicant();
    data.personal.lastName = "";
    data.personal.firstName = "";
    expect(buildFileName(data, "опись")).toBe("Абитуриент_опись.docx");
  });
});

describe("generateAllDocuments", () => {
  it("генерирует все 6 документов, каждый > 0 байт", async () => {
    const docs = await generateAllDocuments(sampleApplicant());
    expect(docs).toHaveLength(DOCUMENT_TEMPLATES.length);
    expect(docs).toHaveLength(6);
    for (const doc of docs) {
      expect(doc.content.byteLength).toBeGreaterThan(0);
      expect(doc.fileName).toMatch(/\.docx$/);
    }
  }, 30_000);
});
