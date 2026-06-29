# ПРОМТ ДЛЯ CLAUDE CODE

## Система «Приёмная комиссия» — ГБПОУ «Волгоградский технический колледж»

---

## КОНТЕКСТ ЗАДАЧИ

Ты разрабатываешь веб-систему автоматизации документооборота для приёмной комиссии колледжа СПО. Система позволяет секретарю ввести данные абитуриента один раз и автоматически сформировать пакет из 6 документов в формате DOCX.

**Целевое развёртывание:** статический фронтенд (Next.js Export) на Netlify / GitHub Pages / Render (бесплатный тариф). Никакого backend-сервера — все операции в браузере.

---

## ОБЯЗАТЕЛЬНЫЙ ПЕРВЫЙ ШАГ

**Прочитай файл `code.md`** в корне проекта. Он содержит текущее состояние кодовой базы, архитектурные решения и технический долг. Все твои действия должны быть согласованы с тем, что там написано.

После прочтения `code.md` — прочитай `progress.md`. Там хранится журнал выполненных этапов. Каждый раз, когда ты завершаешь этап из плана ниже, **дописывай запись в `progress.md`** в формате:

```markdown
## Этап N — [Название] ✅

**Дата:** YYYY-MM-DD  
**Что сделано:** краткое описание  
**Файлы затронуты:** список файлов  
**Известные проблемы / TODO:** если есть
```

---

## ТЕХНИЧЕСКИЙ СТЕК

| Слой                   | Технология                                          |
| ---------------------- | --------------------------------------------------- |
| Фреймворк              | Next.js 14 (App Router, `output: 'export'`)         |
| Язык                   | TypeScript (strict mode)                            |
| Стили                  | Tailwind CSS v3                                     |
| UI-компоненты          | shadcn/ui                                           |
| Формы                  | react-hook-form + zod                               |
| Генерация DOCX         | docx (npm)                                          |
| Автодополнение адресов | API Dadata (бесплатный тариф, токен в `.env.local`) |
| Автодополнение ФИО     | Dadata suggestions                                  |
| Архивирование          | JSZip                                               |
| Иконки                 | lucide-react                                        |
| Тесты                  | Vitest + Testing Library                            |
| Линтер                 | ESLint + Prettier                                   |

---

## АРХИТЕКТУРА — DOMAIN-DRIVEN DESIGN

```
src/
├── app/                          # Next.js App Router (только routing + layout)
│   ├── layout.tsx
│   ├── page.tsx                  # redirect → /applicant/new
│   └── applicant/
│       └── new/
│           └── page.tsx
│
├── domains/
│   ├── applicant/                # Домен: данные абитуриента
│   │   ├── types.ts              # ApplicantData, PersonalData, EducationConditions
│   │   ├── schema.ts             # Zod-схема валидации
│   │   ├── hooks/
│   │   │   └── useApplicantForm.ts
│   │   └── components/
│   │       ├── PersonalDataSection.tsx
│   │       ├── EducationConditionsSection.tsx
│   │       ├── AddressSection.tsx
│   │       ├── PassportSection.tsx
│   │       ├── ParentsSection.tsx
│   │       └── EducationSection.tsx
│   │
│   ├── documents/                # Домен: генерация документов
│   │   ├── types.ts              # DocumentTemplate, GeneratedDocument
│   │   ├── generator.ts          # Оркестратор генерации
│   │   ├── templates/
│   │   │   ├── anketa.ts         # Анкета абитуриента
│   │   │   ├── lichnoe-delo.ts   # Личное дело
│   │   │   ├── opis.ts           # Опись документов
│   │   │   ├── raspiska.ts       # Расписка
│   │   │   ├── ekzamen-list.ts   # Экзаменационный лист
│   │   │   └── dogovor.ts        # Договор об образовании
│   │   └── utils/
│   │       ├── docx-helpers.ts   # Общие стили для docx
│   │       └── date-helpers.ts   # Форматирование дат
│   │
│   └── suggestions/              # Домен: подсказки (Dadata)
│       ├── types.ts
│       ├── api.ts                # Обёртка над Dadata API
│       └── hooks/
│           ├── useAddressSuggestions.ts
│           └── useFioSuggestions.ts
│
├── shared/
│   ├── components/
│   │   ├── ui/                   # shadcn/ui компоненты
│   │   ├── SuggestInput.tsx      # Input с выпадающими подсказками
│   │   ├── AddressInput.tsx      # Специализированный для адресов
│   │   ├── FioInput.tsx          # Специализированный для ФИО
│   │   └── FormSection.tsx       # Секция формы с заголовком
│   ├── hooks/
│   │   └── useDebounce.ts
│   └── lib/
│       └── utils.ts
│
└── features/
    └── document-pack/            # Feature: сборка и скачивание пакета
        ├── DocumentPackButton.tsx
        └── useDocumentPack.ts
```

---

## ПЛАН РАЗРАБОТКИ ПО ЭТАПАМ

### ЭТАП 1 — Инициализация проекта

- `npx create-next-app@latest` с TypeScript, Tailwind, App Router
- Установить зависимости: `docx jszip react-hook-form zod @hookform/resolvers lucide-react`
- Установить и настроить shadcn/ui: `npx shadcn@latest init`
- Добавить shadcn компоненты: `button input label select card badge progress`
- Настроить `next.config.js`: `output: 'export'`, `trailingSlash: true`
- Создать `.env.local.example` с переменной `NEXT_PUBLIC_DADATA_TOKEN`
- Создать `code.md` и `progress.md` в корне
- Записать в `progress.md`: Этап 1 ✅

### ЭТАП 2 — Домен `applicant`: типы и схема валидации

Создать `src/domains/applicant/types.ts`:

```typescript
export interface PersonalData {
  lastName: string; // Фамилия
  firstName: string; // Имя
  middleName: string; // Отчество
  birthDate: string; // Дата рождения (ISO)
  birthPlace: string; // Место рождения
  gender: "male" | "female";
  snils: string; // СНИЛС
  phone: string;
  email?: string;
}

export interface PassportData {
  series: string;
  number: string;
  issuedBy: string;
  issuedDate: string;
  divisionCode: string;
  registrationAddress: string;
  actualAddress: string;
  sameAsRegistration: boolean;
}

export interface ParentData {
  role: "mother" | "father" | "guardian";
  fullName: string;
  phone: string;
  workplace?: string;
}

export interface PreviousEducation {
  institutionName: string; // Название школы/колледжа
  finishedYear: string; // Год окончания
  documentType: "attestat" | "diplom"; // Аттестат или диплом
  documentSeries: string;
  documentNumber: string;
}

export interface EducationConditions {
  specialty: string; // Специальность
  specialtyCode: string; // Код специальности (напр. 40.02.04)
  educationForm: "full-time" | "part-time" | "evening"; // Очная/Заочная/Вечерняя
  baseEducation: "9" | "11"; // На базе 9 или 11 классов
  foreignLanguage: "english" | "german" | "french";
  cipher: string; // Шифр личного дела
  contractNumber?: string; // Номер договора
  enrollmentYear: number; // Год поступления
}

export interface ApplicantData {
  personal: PersonalData;
  passport: PassportData;
  parents: ParentData[];
  previousEducation: PreviousEducation;
  educationConditions: EducationConditions;
}
```

Создать `src/domains/applicant/schema.ts` — Zod-схему, полностью зеркалящую типы выше, с кириллическими сообщениями об ошибках.

Записать в `progress.md`: Этап 2 ✅

### ЭТАП 3 — Домен `suggestions`: интеграция Dadata

Создать `src/domains/suggestions/api.ts`:

```typescript
// Dadata Suggestions API
// Документация: https://dadata.ru/api/suggest/

const DADATA_URL = "https://suggestions.dadata.ru/suggestions/api/4_1/rs";
const TOKEN = process.env.NEXT_PUBLIC_DADATA_TOKEN ?? "";

export async function suggestAddress(query: string) {
  const res = await fetch(`${DADATA_URL}/suggest/address`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${TOKEN}`,
    },
    body: JSON.stringify({
      query,
      count: 7,
      locations: [{ country: "Россия" }],
    }),
  });
  const data = await res.json();
  return data.suggestions as Array<{
    value: string;
    data: Record<string, string>;
  }>;
}

export async function suggestFio(
  query: string,
  parts?: ("NAME" | "SURNAME" | "PATRONYMIC")[],
) {
  const res = await fetch(`${DADATA_URL}/suggest/fio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${TOKEN}`,
    },
    body: JSON.stringify({ query, count: 7, parts }),
  });
  const data = await res.json();
  return data.suggestions as Array<{ value: string; data: { gender: string } }>;
}
```

Создать хуки `useAddressSuggestions` и `useFioSuggestions` с debounce 300ms.

Создать `src/shared/components/SuggestInput.tsx` — универсальный компонент Input с выпадающим списком подсказок (клавиатурная навигация: ↑↓ Enter Escape).

Создать специализированные `AddressInput.tsx` и `FioInput.tsx` на основе `SuggestInput`.

Записать в `progress.md`: Этап 3 ✅

### ЭТАП 4 — UI: секции формы

Создать все секции в `src/domains/applicant/components/`:

**PersonalDataSection** — поля:

- ФИО (три отдельных поля с `FioInput`, при вводе фамилии автоматически определять пол)
- Дата рождения (date picker)
- Место рождения (`AddressInput`, только город)
- Пол (radio)
- СНИЛС (маска: `___-___-___ __`)
- Телефон (маска: `+7 (___) ___-__-__`)
- Email

**PassportSection** — поля:

- Серия и номер (маска `____ ______`)
- Кем выдан (`AddressInput` для органа выдачи)
- Дата выдачи
- Код подразделения (маска `___-___`)
- Адрес регистрации (`AddressInput`)
- Чекбокс «Фактический адрес совпадает с регистрацией»
- Фактический адрес (скрыт если чекбокс активен)

**ParentsSection** — поля:

- Роль (мать/отец/опекун)
- ФИО (`FioInput`)
- Телефон
- Место работы
- Кнопка «+ Добавить родителя» (до 2 записей)

**EducationSection** — поля:

- Название учебного заведения
- Год окончания
- Тип документа (аттестат/диплом)
- Серия и номер документа

**EducationConditionsSection** — поля:

- Специальность (autocomplete из предустановленного списка специальностей колледжа)
- Код специальности (заполняется автоматически по выбранной специальности)
- Форма обучения (select)
- Базовое образование (radio: 9/11 классов)
- Иностранный язык (select)
- Шифр личного дела (свободный ввод)
- Номер договора (свободный ввод)

Записать в `progress.md`: Этап 4 ✅

### ЭТАП 5 — Домен `documents`: шаблоны DOCX

Создать `src/domains/documents/utils/docx-helpers.ts` — общие стили:

```typescript
import {
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  Paragraph,
  TextRun,
  WidthType,
} from "docx";

export const COLLEGE_NAME = "ГБПОУ «Волгоградский технический колледж»";
export const COLLEGE_ADDRESS = "г. Волгоград, ул. Козловская, д. 57";
export const COLLEGE_PHONE = "(8442) 97-33-34";

export const boldText = (text: string, size = 24) =>
  new TextRun({ text, bold: true, size });

export const normalText = (text: string, size = 24) =>
  new TextRun({ text, size });

export const centeredParagraph = (runs: TextRun[]) =>
  new Paragraph({ children: runs, alignment: AlignmentType.CENTER });

export const emptyLine = () => new Paragraph({ children: [new TextRun("")] });

export const fieldRow = (label: string, value: string) =>
  new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 22 }),
      new TextRun({ text: value || "___________________", size: 22 }),
    ],
    spacing: { after: 100 },
  });
```

Создать шаблоны (каждый — функция `generateXxx(data: ApplicantData): Promise<Uint8Array>`):

#### `anketa.ts` — Анкета абитуриента

Содержит: шапку колледжа, ФИО, дату рождения, место рождения, пол, СНИЛС, паспортные данные, адреса, телефон, email, данные о предыдущем образовании, сведения о родителях, подпись и дату.

#### `lichnoe-delo.ts` — Титульный лист личного дела

Содержит: шапку, шифр личного дела, ФИО, специальность, форму обучения, год поступления, фото-место (рамка), подпись секретаря.

#### `opis.ts` — Опись документов личного дела

Содержит: заголовок, таблицу с колонками [№, Наименование документа, Кол-во листов, Примечание], предустановленный список документов (заявление, паспорт, аттестат/диплом, фотографии, мед. справка, СНИЛС, прочее), место для подписи.

#### `raspiska.ts` — Расписка

Содержит: заголовок «РАСПИСКА», текст вида «Я, [ФИО], получил(а) следующие документы из приёмной комиссии...», таблицу документов, дату, подпись.

#### `ekzamen-list.ts` — Экзаменационный лист / Лист собеседования

Содержит: заголовок, ФИО, специальность, дату собеседования, таблицу результатов [Дисциплина, Оценка, Подпись экзаменатора], итоговую рекомендацию, подпись председателя комиссии.

#### `dogovor.ts` — Договор об образовании

Содержит: полную шапку с реквизитами колледжа, номер договора, дату, стороны договора (колледж + абитуриент/родитель), предмет договора, права и обязанности сторон, срок обучения, стоимость (если платно / «бюджет»), реквизиты и подписи.

**Важно:** все шаблоны используют функции из `docx-helpers.ts`. Страницы A4, поля 20мм со всех сторон (кроме левого — 30мм), шрифт Times New Roman 12pt.

Записать в `progress.md`: Этап 5 ✅

### ЭТАП 6 — Feature: сборка пакета документов

Создать `src/features/document-pack/useDocumentPack.ts`:

```typescript
// Логика:
// 1. Принимает ApplicantData
// 2. Вызывает все 6 генераторов параллельно (Promise.all)
// 3. Упаковывает в ZIP через JSZip
// 4. Именует файлы: `{фамилия}_{имя}_{документ}.docx`
//    Например: Иванов_Иван_анкета.docx
// 5. Возвращает Blob для скачивания
// 6. Хранит состояние: idle | generating | done | error
```

Создать `src/features/document-pack/DocumentPackButton.tsx`:

- Кнопка «Сформировать комплект» (disabled если форма невалидна)
- Прогресс-бар во время генерации
- После успеха — кнопка «Скачать ZIP»
- Показывает список сформированных файлов с иконками

Записать в `progress.md`: Этап 6 ✅

### ЭТАП 7 — Главная страница и навигация

Создать `src/app/applicant/new/page.tsx`:

- Заголовок: «Приёмная комиссия — Новый абитуриент»
- Подзаголовок с названием колледжа
- Форма с секциями (Accordion или просто последовательно):
  1. Условия обучения
  2. Личные данные
  3. Паспортные данные
  4. Адреса
  5. Предыдущее образование
  6. Сведения о родителях
- Sticky-футер с кнопкой «Сформировать комплект»
- Индикатор прогресса заполнения формы (сколько % полей заполнено)

Дизайн: строгий, официальный. Цветовая схема — тёмно-синий (#1a2744) + белый + светло-серый (#f5f5f5). Заголовки секций — тёмный фон с белым текстом (как на скриншоте). Шрифт — системный sans-serif.

Записать в `progress.md`: Этап 7 ✅

### ЭТАП 8 — Список специальностей колледжа

Создать `src/domains/applicant/data/specialties.ts` с предустановленным списком специальностей. Используй реалистичные специальности для технического колледжа:

```typescript
export const SPECIALTIES = [
  { code: "09.02.07", name: "Информационные системы и программирование" },
  { code: "15.02.08", name: "Технология машиностроения" },
  {
    code: "13.02.11",
    name: "Техническая эксплуатация и обслуживание электрического и электромеханического оборудования",
  },
  {
    code: "08.02.09",
    name: "Монтаж, наладка и эксплуатация электрооборудования промышленных и гражданских зданий",
  },
  {
    code: "23.02.07",
    name: "Техническое обслуживание и ремонт двигателей, систем и агрегатов автомобилей",
  },
  { code: "38.02.01", name: "Экономика и бухгалтерский учёт" },
  { code: "40.02.01", name: "Право и организация социального обеспечения" },
  { code: "43.02.15", name: "Поварское и кондитерское дело" },
  { code: "19.02.10", name: "Технология продукции общественного питания" },
  { code: "54.02.01", name: "Дизайн (по отраслям)" },
] as const;
```

При выборе специальности — код подставляется автоматически, поле кода блокируется.

Записать в `progress.md`: Этап 8 ✅

### ЭТАП 9 — Качество кода и тесты

- Написать unit-тесты (Vitest) для:
  - `src/domains/applicant/schema.ts` — валидация граничных случаев
  - `src/domains/documents/utils/date-helpers.ts` — форматирование дат
  - `src/domains/documents/utils/docx-helpers.ts` — генерация параграфов
- Написать integration-тест для `generator.ts` (генерирует файл > 0 байт)
- Настроить `eslint` с правилами для DDD (запрет импортов между доменами через shared)
- Добавить `husky` + `lint-staged` для pre-commit проверок

Записать в `progress.md`: Этап 9 ✅

### ЭТАП 10 — Деплой и документация

- Настроить `next.config.js` для статического экспорта
- Создать `netlify.toml`:
  ```toml
  [build]
    command = "npm run build"
    publish = "out"
  ```
- Создать `README.md` с:
  - Описанием системы
  - Инструкцией по получению токена Dadata (бесплатно, до 10 000 запросов/день)
  - Инструкцией по деплою на Netlify (5 шагов)
  - Инструкцией по деплою на GitHub Pages
  - Описанием структуры проекта
  - Инструкцией по замене шаблонов документов
- Создать `TEMPLATES.md` — инструкция по кастомизации шаблонов DOCX

Записать в `progress.md`: Этап 10 ✅

---

## ФАЙЛ `code.md` — ШАБЛОН (создать в корне проекта)

```markdown
# code.md — Техническое состояние проекта

## Архитектурные решения

### Почему статический экспорт (no SSR на сервере)?

Все операции — форма + генерация DOCX — выполняются в браузере.
Серверный рендеринг не нужен. Это позволяет деплоить на бесплатные хостинги.

### Почему DDD?

Три чётко разграниченных домена (applicant, documents, suggestions)
не должны знать друг о друге напрямую. Общение — через types и shared.

### Почему docx, а не pdf?

Секретари должны иметь возможность редактировать документы после генерации.
PDF — финальный формат, DOCX — рабочий.

## Текущие зависимости

(обновляется автоматически при изменениях)

## Известный технический долг

- [ ] Шаблоны документов — заглушки, требуют замены реальными формами колледжа
- [ ] Список специальностей — заглушка, требует уточнения у администрации
- [ ] Dadata token — нужно получить и добавить в .env.local

## Переменные окружения

- `NEXT_PUBLIC_DADATA_TOKEN` — токен Dadata для подсказок адресов и ФИО
  Получить: https://dadata.ru/ → Регистрация → API → Токен
```

---

## ФАЙЛ `progress.md` — ШАБЛОН (создать в корне проекта)

```markdown
# progress.md — Журнал разработки

## Статус: 🚧 В разработке

| Этап | Название                      | Статус |
| ---- | ----------------------------- | ------ |
| 1    | Инициализация проекта         | ⏳     |
| 2    | Домен applicant: типы и схема | ⏳     |
| 3    | Домен suggestions: Dadata     | ⏳     |
| 4    | UI: секции формы              | ⏳     |
| 5    | Домен documents: шаблоны DOCX | ⏳     |
| 6    | Feature: сборка пакета        | ⏳     |
| 7    | Главная страница              | ⏳     |
| 8    | Список специальностей         | ⏳     |
| 9    | Тесты и качество кода         | ⏳     |
| 10   | Деплой и документация         | ⏳     |

---

(Записи о завершённых этапах появятся здесь)
```

---

## ВАЖНЫЕ ПРАВИЛА ДЛЯ CLAUDE CODE

1. **Всегда читай `code.md` перед началом работы**
2. **Всегда обновляй `progress.md` после завершения этапа**
3. **Не импортируй между доменами напрямую** — только через `shared/` или `types`
4. **Все строки — на русском языке** (UI, сообщения об ошибках, комментарии к полям)
5. **Docx-шаблоны** — реалистичные, с правильными реквизитами колледжа
6. **Маски ввода** — реализовать через простые onInput-обработчики без сторонних библиотек масок (меньше зависимостей)
7. **Dadata** — если токен не задан, подсказки просто не работают, форма доступна
8. **ZIP** — имя файла: `Комплект_{Фамилия}_{Имя}_{ГГГГ-ММ-ДД}.zip`
9. **Адаптивность** — форма должна работать на планшете (секретарь может вводить с iPad)
10. **Автосохранение** — сохранять черновик в `localStorage` каждые 30 секунд

---

## ПРИМЕЧАНИЕ ПО ШАБЛОНАМ ДОКУМЕНТОВ

Шаблоны в `src/domains/documents/templates/` — **временные заглушки**. Реальные бланки колледжа будут предоставлены позже. Структура функций (`generateAnketa`, `generateLichnoeDelo` и т.д.) должна оставаться неизменной — только внутреннее содержимое будет заменено.

Каждая функция-шаблон принимает `ApplicantData` и возвращает `Promise<Uint8Array>` — буфер DOCX-файла.
