import type { ApplicantData } from "@/domains/applicant/types";

/** Идентификатор документа в комплекте. */
export type DocumentId =
  "anketa" | "lichnoe-delo" | "opis" | "raspiska" | "ekzamen-list" | "dogovor";

/** Функция-генератор шаблона документа. */
export type TemplateGenerator = (data: ApplicantData) => Promise<Uint8Array>;

/** Описание шаблона документа. */
export interface DocumentTemplate {
  id: DocumentId;
  /** Человекочитаемое название. */
  title: string;
  /** Часть имени файла (латиница), напр. "анкета". */
  fileSuffix: string;
  generate: TemplateGenerator;
}

/** Сгенерированный документ. */
export interface GeneratedDocument {
  id: DocumentId;
  title: string;
  fileName: string;
  content: Uint8Array;
}
