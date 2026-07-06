import { z } from "zod";

// Zod-схема валидации абитуриента. Полностью зеркалит types.ts.
// Сообщения об ошибках — на русском языке.

const requiredString = (message: string) =>
  z.string({ required_error: message }).trim().min(1, message);

export const personalDataSchema = z.object({
  lastName: requiredString("Укажите фамилию").regex(
    /^[А-Яа-яЁё\- ]+$/,
    "Фамилия должна содержать только русские буквы",
  ),
  firstName: requiredString("Укажите имя").regex(
    /^[А-Яа-яЁё\- ]+$/,
    "Имя должно содержать только русские буквы",
  ),
  middleName: requiredString("Укажите отчество").regex(
    /^[А-Яа-яЁё\- ]+$/,
    "Отчество должно содержать только русские буквы",
  ),
  birthDate: requiredString("Укажите дату рождения").refine(
    (v) => !Number.isNaN(Date.parse(v)),
    "Некорректная дата рождения",
  ),
  birthPlace: requiredString("Укажите место рождения"),
  citizenship: requiredString("Укажите гражданство"),
  settlementType: z.enum(["city", "rural"], {
    errorMap: () => ({ message: "Выберите тип населённого пункта" }),
  }),
  snils: requiredString("Укажите СНИЛС").regex(
    /^\d{3}-\d{3}-\d{3} \d{2}$/,
    "СНИЛС в формате 123-456-789 00",
  ),
  phone: requiredString("Укажите телефон").regex(
    /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/,
    "Телефон в формате +7 (999) 123-45-67",
  ),
  email: z
    .string()
    .trim()
    .email("Некорректный email")
    .optional()
    .or(z.literal("")),
});

export const passportDataSchema = z.object({
  series: requiredString("Укажите серию паспорта").regex(
    /^\d{4}$/,
    "Серия — 4 цифры",
  ),
  number: requiredString("Укажите номер паспорта").regex(
    /^\d{6}$/,
    "Номер — 6 цифр",
  ),
  issuedBy: requiredString("Укажите, кем выдан паспорт"),
  issuedDate: requiredString("Укажите дату выдачи").refine(
    (v) => !Number.isNaN(Date.parse(v)),
    "Некорректная дата выдачи",
  ),
  registrationAddress: requiredString("Укажите адрес регистрации"),
});

export const parentDataSchema = z.object({
  role: z.enum(["mother", "father", "guardian"], {
    errorMap: () => ({ message: "Выберите роль" }),
  }),
  fullName: requiredString("Укажите ФИО"),
  phone: requiredString("Укажите телефон").regex(
    /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/,
    "Телефон в формате +7 (999) 123-45-67",
  ),
  // Полные данные представителя (Заказчик по договору) — необязательны.
  isContractCustomer: z.boolean().optional(),
  birthDate: z.string().trim().optional().or(z.literal("")),
  birthPlace: z.string().trim().optional().or(z.literal("")),
  snils: z.string().trim().optional().or(z.literal("")),
  passportSeries: z.string().trim().optional().or(z.literal("")),
  passportNumber: z.string().trim().optional().or(z.literal("")),
  passportIssuedBy: z.string().trim().optional().or(z.literal("")),
  passportIssuedDate: z.string().trim().optional().or(z.literal("")),
  registrationAddress: z.string().trim().optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Некорректный email")
    .optional()
    .or(z.literal("")),
});

export const previousEducationSchema = z.object({
  institutionName: requiredString("Укажите название учебного заведения"),
  finishedYear: requiredString("Укажите год окончания").regex(
    /^\d{4}$/,
    "Год окончания — 4 цифры",
  ),
  documentSeries: requiredString("Укажите серию документа"),
  documentNumber: requiredString("Укажите номер документа"),
  documentDate: requiredString("Укажите дату выдачи документа").refine(
    (v) => !Number.isNaN(Date.parse(v)),
    "Некорректная дата",
  ),
});

export const educationConditionsSchema = z.object({
  specialty: requiredString("Выберите специальность"),
  specialtyCode: requiredString("Код специальности обязателен"),
  educationForm: z.enum(["full-time", "part-time", "evening"], {
    errorMap: () => ({ message: "Выберите форму обучения" }),
  }),
  baseEducation: z.enum(["9", "11"], {
    errorMap: () => ({ message: "Выберите базовое образование" }),
  }),
  foreignLanguage: z.enum(["english", "german", "french"], {
    errorMap: () => ({ message: "Выберите иностранный язык" }),
  }),
  fundingBasis: z.enum(["budget", "contract"], {
    errorMap: () => ({ message: "Выберите основание поступления" }),
  }),
  professionalitet: z.boolean(),
  needsDormitory: z.boolean(),
  applicationDate: requiredString("Укажите дату подачи заявления").refine(
    (v) => !Number.isNaN(Date.parse(v)),
    "Некорректная дата",
  ),
});

export const applicantSchema = z.object({
  personal: personalDataSchema,
  passport: passportDataSchema,
  parents: z
    .array(parentDataSchema)
    .min(1, "Добавьте хотя бы одного родителя/представителя")
    .max(2, "Можно добавить не более двух записей"),
  previousEducation: previousEducationSchema,
  educationConditions: educationConditionsSchema,
});

export type ApplicantSchema = z.infer<typeof applicantSchema>;
