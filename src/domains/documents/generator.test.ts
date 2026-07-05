import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { buildFileName, planPack } from "./generator";
import { renderDocxTemplate } from "./templating/renderTemplate";
import type { ApplicantData } from "@/domains/applicant/types";

function sampleApplicant(): ApplicantData {
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
      email: "ivan@mail.ru",
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
      specialty: "Юриспруденция",
      specialtyCode: "40.02.04",
      educationForm: "full-time",
      baseEducation: "9",
      foreignLanguage: "english",
      fundingBasis: "budget",
      professionalitet: false,
      applicationDate: "2026-06-20",
    },
  };
}

describe("buildFileName", () => {
  it("формирует имя из фамилии, имени и суффикса", () => {
    expect(buildFileName(sampleApplicant(), "заявление")).toBe(
      "Иванов_Иван_заявление.docx",
    );
  });

  it("использует запасное имя при пустой фамилии", () => {
    const data = sampleApplicant();
    data.personal.lastName = "";
    data.personal.firstName = "";
    expect(buildFileName(data, "согласие")).toBe("Абитуриент_согласие.docx");
  });
});

describe("planPack", () => {
  it("бюджет: заявление + 2 согласия (без договора)", () => {
    const data = sampleApplicant();
    data.educationConditions.fundingBasis = "budget";
    const ids = planPack(data).map((p) => p.id);
    expect(ids).toContain("application");
    expect(ids).not.toContain("contract");
    // 2 согласия (передача + обработка) — вариант по возрасту.
    expect(ids.filter((i) => i.startsWith("consent"))).toHaveLength(2);
  });

  it("согласия выбираются по возрасту (совершеннолетний / представитель)", () => {
    const minor = sampleApplicant();
    minor.personal.birthDate = "2012-01-01"; // несовершеннолетний
    const adult = sampleApplicant();
    adult.personal.birthDate = "2000-01-01"; // совершеннолетний
    // Разные наборы файлов согласий не пересекаются по варианту.
    const minorTitles = planPack(minor)
      .filter((p) => p.id.startsWith("consent"))
      .map((p) => p.title);
    const adultTitles = planPack(adult)
      .filter((p) => p.id.startsWith("consent"))
      .map((p) => p.title);
    expect(minorTitles.some((t) => t.includes("представителя"))).toBe(true);
    expect(adultTitles.some((t) => t.includes("представителя"))).toBe(false);
  });

  it("платно: добавляется договор", () => {
    const data = sampleApplicant();
    data.educationConditions.fundingBasis = "contract";
    expect(planPack(data).map((p) => p.id)).toContain("contract");
  });

  it("профессионалитет: вариант заявления «Профессионалитет»", () => {
    const data = sampleApplicant();
    data.educationConditions.professionalitet = true;
    const app = planPack(data).find((p) => p.id === "application");
    expect(app?.title).toContain("Профессионалитет");
  });
});

describe("реальный шаблон договора", () => {
  it("заполняется, весит > 0 байт, без остаточных плейсхолдеров", () => {
    const path = join(
      process.cwd(),
      "public/templates/contracts/40.02.04.docx",
    );
    const buf = readFileSync(path);
    const out = renderDocxTemplate(buf, sampleApplicant());
    expect(out.byteLength).toBeGreaterThan(0);
    // В document.xml не должно остаться незаполненных плейсхолдеров.
    const text = Buffer.from(out).toString("latin1");
    expect(text.includes("{{")).toBe(false);
  });
});
