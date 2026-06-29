import { describe, expect, it } from "vitest";
import { Paragraph, TextRun } from "docx";

import {
  boldText,
  centeredParagraph,
  educationFormLabel,
  fieldRow,
  fullName,
  genderLabel,
  normalText,
} from "./docx-helpers";
import type { ApplicantData } from "@/domains/applicant/types";

describe("docx-helpers — генерация элементов", () => {
  it("boldText создаёт TextRun", () => {
    expect(boldText("Привет")).toBeInstanceOf(TextRun);
  });

  it("normalText создаёт TextRun", () => {
    expect(normalText("Текст")).toBeInstanceOf(TextRun);
  });

  it("fieldRow создаёт Paragraph", () => {
    expect(fieldRow("Метка", "значение")).toBeInstanceOf(Paragraph);
  });

  it("centeredParagraph создаёт Paragraph", () => {
    expect(centeredParagraph([normalText("x")])).toBeInstanceOf(Paragraph);
  });
});

describe("docx-helpers — лейблы и ФИО", () => {
  it("educationFormLabel переводит формы обучения", () => {
    expect(educationFormLabel("full-time")).toBe("очная");
    expect(educationFormLabel("part-time")).toBe("заочная");
    expect(educationFormLabel("evening")).toBe("вечерняя");
  });

  it("genderLabel переводит пол", () => {
    expect(genderLabel("male")).toBe("мужской");
    expect(genderLabel("female")).toBe("женский");
  });

  it("fullName собирает ФИО", () => {
    const data = {
      personal: {
        lastName: "Иванов",
        firstName: "Иван",
        middleName: "Иванович",
      },
    } as ApplicantData;
    expect(fullName(data)).toBe("Иванов Иван Иванович");
  });
});
