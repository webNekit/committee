// Доменные типы абитуриента. Единый источник правды для формы и генерации документов.

/** Личные данные абитуриента. */
export interface PersonalData {
  lastName: string; // Фамилия
  firstName: string; // Имя
  middleName: string; // Отчество
  birthDate: string; // Дата рождения (ISO, YYYY-MM-DD)
  birthPlace: string; // Место рождения
  gender: "male" | "female"; // Пол
  citizenship: string; // Гражданство
  settlementType: "city" | "rural"; // Тип населённого пункта (город/село)
  snils: string; // СНИЛС (формат ___-___-___ __)
  phone: string; // Телефон (+7 (___) ___-__-__)
  email?: string; // Email (необязателен)
}

/** Паспортные данные и адреса. */
export interface PassportData {
  series: string; // Серия (4 цифры)
  number: string; // Номер (6 цифр)
  issuedBy: string; // Кем выдан
  issuedDate: string; // Дата выдачи (ISO)
  divisionCode: string; // Код подразделения (___-___)
  registrationAddress: string; // Адрес регистрации
  actualAddress: string; // Фактический адрес
  sameAsRegistration: boolean; // Фактический совпадает с регистрацией
}

/** Сведения о родителе / законном представителе. */
export interface ParentData {
  role: "mother" | "father" | "guardian"; // Мать / отец / опекун
  fullName: string; // ФИО
  phone: string; // Телефон
  workplace?: string; // Место работы
  // Полные данные для договора (Заказчик), нужны для несовершеннолетнего.
  isContractCustomer?: boolean; // Этот представитель — Заказчик по договору
  birthDate?: string; // Дата рождения (ISO)
  birthPlace?: string; // Место рождения
  snils?: string; // СНИЛС
  passportSeries?: string; // Серия паспорта
  passportNumber?: string; // Номер паспорта
  passportIssuedBy?: string; // Кем выдан
  passportIssuedDate?: string; // Дата выдачи (ISO)
  registrationAddress?: string; // Адрес регистрации
  email?: string; // Email
}

/** Сведения о предыдущем образовании. */
export interface PreviousEducation {
  institutionName: string; // Название школы/колледжа
  finishedYear: string; // Год окончания
  documentType: "attestat" | "diplom"; // Аттестат или диплом
  documentSeries: string; // Серия документа
  documentNumber: string; // Номер документа
  documentDate: string; // Дата выдачи документа об образовании (ISO)
}

/** Условия обучения (специальность, форма, базовое образование и т.д.). */
export interface EducationConditions {
  specialty: string; // Специальность
  specialtyCode: string; // Код специальности (напр. 09.02.07)
  educationForm: "full-time" | "part-time" | "evening"; // Очная/Заочная/Вечерняя
  baseEducation: "9" | "11"; // На базе 9 или 11 классов
  foreignLanguage: "english" | "german" | "french"; // Иностранный язык
  fundingBasis: "budget" | "contract"; // Основание: бюджет / договор (платно)
  professionalitet: boolean; // Специальность в рамках ФП «Профессионалитет»
  cipher: string; // Шифр личного дела
  contractNumber?: string; // Номер договора
  applicationDate: string; // Дата подачи заявления (ISO)
  enrollmentYear: number; // Год поступления
}

/** Полный набор данных абитуриента. */
export interface ApplicantData {
  personal: PersonalData;
  passport: PassportData;
  parents: ParentData[];
  previousEducation: PreviousEducation;
  educationConditions: EducationConditions;
}
