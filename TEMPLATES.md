# TEMPLATES.md — Кастомизация DOCX-шаблонов

Шаблоны документов лежат в `src/domains/documents/templates/` и являются
**временными заглушками**. Реальные бланки колледжа будут предоставлены позже.
Этот документ описывает, как заменить содержимое, не ломая остальную систему.

---

## Главный контракт

Каждый шаблон — это асинхронная функция вида:

```ts
export async function generateXxx(data: ApplicantData): Promise<Uint8Array>;
```

- Принимает `ApplicantData` (см. `src/domains/applicant/types.ts`).
- Возвращает `Uint8Array` — бинарное содержимое файла `.docx`.

**Эту сигнатуру менять нельзя.** Оркестратор `generator.ts` и сборщик ZIP
полагаются на неё. Заменяйте только _внутреннее наполнение_ функции.

---

## Реестр документов

Все шаблоны зарегистрированы в `src/domains/documents/generator.ts`
в массиве `DOCUMENT_TEMPLATES`:

```ts
{
  id: "anketa",                 // уникальный идентификатор
  title: "Анкета абитуриента",  // отображается в UI
  fileSuffix: "анкета",         // часть имени файла: Фамилия_Имя_анкета.docx
  generate: generateAnketa,     // функция-генератор
}
```

Чтобы **добавить** новый документ:

1. Создайте файл в `templates/`, экспортируйте `generateNewDoc(data)`.
2. Добавьте запись в `DOCUMENT_TEMPLATES`.
3. (Опционально) добавьте `id` в тип `DocumentId` в `types.ts`.

Чтобы **убрать** документ — удалите его запись из `DOCUMENT_TEMPLATES`.

---

## Общие хелперы (`utils/docx-helpers.ts`)

Используйте готовые помощники — они задают единый стиль (Times New Roman, поля A4
20мм / левое 30мм) и реквизиты колледжа:

| Хелпер                    | Назначение                                        |
| ------------------------- | ------------------------------------------------- |
| `buildDocx(children)`     | Собирает `Document` и возвращает `Uint8Array`     |
| `collegeHeader()`         | Массив параграфов шапки с реквизитами колледжа    |
| `docTitle(text)`          | Заголовок документа по центру, жирный             |
| `fieldRow(label, value)`  | Строка «Метка: значение» с подчёркиванием пустых  |
| `boldText` / `normalText` | `TextRun` жирный / обычный                        |
| `centeredParagraph(runs)` | Параграф по центру                                |
| `emptyLine()`             | Пустая строка                                     |
| `fullName(data)`          | «Фамилия Имя Отчество»                            |
| `*Label(value)`           | Перевод перечислений (форма обучения, пол и т.д.) |

Реквизиты колледжа — константы `COLLEGE_NAME`, `COLLEGE_NAME_FULL`,
`COLLEGE_ADDRESS`, `COLLEGE_PHONE`, `COLLEGE_INN`. **Поменяйте их в одном месте**
(`docx-helpers.ts`), и они обновятся во всех документах.

Форматирование дат — `utils/date-helpers.ts`: `formatDate`, `formatDateLong`,
`today`.

---

## Пример минимального шаблона

```ts
import { Paragraph } from "docx";
import type { ApplicantData } from "@/domains/applicant/types";
import {
  buildDocx,
  collegeHeader,
  docTitle,
  fieldRow,
  fullName,
} from "../utils/docx-helpers";

export async function generateSpravka(
  data: ApplicantData,
): Promise<Uint8Array> {
  const children: Paragraph[] = [
    ...collegeHeader(),
    docTitle("СПРАВКА"),
    fieldRow("Выдана", fullName(data)),
    fieldRow("Специальность", data.educationConditions.specialty),
  ];
  return buildDocx(children);
}
```

---

## Таблицы

Для таблиц используйте `Table`, `TableRow`, `TableCell` из `docx` (см. примеры в
`opis.ts`, `raspiska.ts`, `ekzamen-list.ts`). Внутри ячейки текст оборачивается
в `Paragraph` → `TextRun` с `font: "Times New Roman"`.

---

## Проверка после изменений

```bash
npm run typecheck   # типы не сломаны
npm run test        # integration-тест: все документы генерируются > 0 байт
```

Интеграционный тест `src/domains/documents/generator.test.ts` гарантирует, что
после правок каждый из документов по-прежнему успешно генерируется.

---

## Перенос реального бланка в код

1. Откройте бланк колледжа (например, в Word) и разметьте, какие части —
   статический текст, а какие — подставляемые поля из `ApplicantData`.
2. Воспроизведите структуру параграфами/таблицами `docx`, подставляя данные
   через `data.*` и хелперы.
3. Соблюдайте порядок и формулировки официального бланка.
4. Прогоните `npm run test` и визуально проверьте сгенерированный `.docx`.
