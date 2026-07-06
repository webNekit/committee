import { describe, expect, it } from "vitest";

import { buildTemplateData } from "./buildTemplateData";
import type { ApplicantData } from "@/domains/applicant/types";

function sample(): ApplicantData {
  return {
    personal: {
      lastName: "Иванов",
      firstName: "Иван",
      middleName: "Иванович",
      birthDate: "2008-05-01",
      birthPlace: "г. Волгоград",
      citizenship: "Российская Федерация",
      settlementType: "city",
      snils: "123-456-789 00",
      phone: "+7 (999) 123-45-67",
      email: "",
    },
    passport: {
      series: "1234",
      number: "567890",
      issuedBy: "ГУ МВД",
      issuedDate: "2022-06-01",
      registrationAddress: "г. Волгоград, ул. Мира, 1",
    },
    parents: [
      {
        role: "mother",
        fullName: "Иванова Мария Петровна",
        phone: "+7 (999) 000-11-22",
      },
    ],
    previousEducation: {
      institutionName: "МОУ СОШ № 1",
      finishedYear: "2024",
      documentSeries: "12 АБ",
      documentNumber: "0001234",
      documentDate: "2026-06-25",
    },
    educationConditions: {
      specialty: "Информационные системы и программирование",
      specialtyCode: "09.02.07",
      educationForm: "full-time",
      baseEducation: "9",
      foreignLanguage: "english",
      fundingBasis: "budget",
      professionalitet: false,
      needsDormitory: false,
      applicationDate: "2026-06-20",
    },
  };
}

describe("buildTemplateData", () => {
  it("форматирует значения для плейсхолдеров", () => {
    const d = buildTemplateData(sample());
    expect(d.fio).toBe("Иванов Иван Иванович");
    expect(d.personal.birthDate).toBe("01.05.2008");
    expect(d.passport.seriesNumber).toBe("1234 567890");
    expect(d.conditions.educationForm).toBe("очная");
    expect(d.conditions.fundingBasis).toBe("бюджет");
  });

  it("родители: массив и доступ по индексу", () => {
    const d = buildTemplateData(sample());
    expect(d.parents).toHaveLength(1);
    expect(d.parent1.role).toBe("Мать");
    expect(d.parent2.fullName).toBe("");
  });

  it("основание поступления берётся из fundingBasis", () => {
    const data = sample();
    data.educationConditions.fundingBasis = "contract";
    expect(buildTemplateData(data).conditions.fundingBasis).toBe("договор");
  });

  it("совершеннолетие считается на дату подачи", () => {
    const data = sample();
    // 01.05.2008 → на 2026-06-20 уже 18 лет.
    expect(buildTemplateData(data).isAdult).toBe(true);
    data.personal.birthDate = "2010-05-01"; // 16 лет
    expect(buildTemplateData(data).isAdult).toBe(false);
  });

  it("представитель-Заказчик выбирается по флагу", () => {
    const data = sample();
    data.parents = [
      { role: "mother", fullName: "Мать", phone: "" },
      {
        role: "father",
        fullName: "Отец Заказчик",
        phone: "",
        isContractCustomer: true,
        passportSeries: "1111",
        passportNumber: "222222",
      },
    ];
    const d = buildTemplateData(data);
    expect(d.representative.fullName).toBe("Отец Заказчик");
    expect(d.representative.passportSeriesNumber).toBe("1111 222222");
  });
});
