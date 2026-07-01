# progress.md — Журнал разработки

## Статус: ✅ Все этапы завершены

| Этап | Название                      | Статус |
| ---- | ----------------------------- | ------ |
| 1    | Инициализация проекта         | ✅     |
| 2    | Домен applicant: типы и схема | ✅     |
| 3    | Домен suggestions: Dadata     | ✅     |
| 4    | UI: секции формы              | ✅     |
| 5    | Домен documents: шаблоны DOCX | ✅     |
| 6    | Feature: сборка пакета        | ✅     |
| 7    | Главная страница              | ✅     |
| 8    | Список специальностей         | ✅     |
| 9    | Тесты и качество кода         | ✅     |
| 10   | Деплой и документация         | ✅     |

---

## Доработка 10 — Все документы: заявления, согласия, состав пакета ✅

**Дата:** 2026-06-30
**Что сделано:**

- **Заявления** (обычное и «Профессионалитет») сконвертированы `.doc→.docx` и
  размечены плейсхолдерами (ФИО, паспорт, гражданство, адрес, специальность,
  форма, основание, база, образование, язык, дата подачи) →
  `public/templates/applications/`.
- **Согласия** (4 шт.) размечены плейсхолдерами с учётом двух блоков
  (подписант = `customer`, субъект/обучающийся = `student`) →
  `public/templates/consents/`.
- **Состав пакета переведён на реальные бланки** (`planPack`):
  заявление (вариант по профессионалитету) + договор (только при платном
  обучении, по коду специальности) + 4 согласия. Генерация последовательная с
  прогрессом; шаги считаются по плану для конкретных данных.
- **buildTemplateData**: добавлены `student` и `customer` для договоров.
- Строгий regex вставки плейсхолдеров (`<w:t>` только как текст, без табличных
  тегов) — договоры/заявления перегенерированы безопасно.
- Удалены неиспользуемые программные шаблоны (anketa, lichnoe-delo, opis,
  raspiska, ekzamen-list); `dogovor` оставлен как fallback.
- Тест реального договора: рендерится, без остаточных `{{...}}`. Тесты 36/36.

**Файлы затронуты:** public/templates/{applications,consents}/*.docx (новые),
src/domains/documents/generator.ts (planPack), src/domains/documents/types.ts,
src/domains/documents/templating/buildTemplateData.ts,
src/features/document-pack/{useDocumentPack.ts,DocumentPackButton.tsx},
src/domains/documents/generator.test.ts, TEMPLATE_FIELDS.md
**Проверки:** tsc ✓, lint ✓, vitest 36/36 ✓, build ✓ (все шаблоны в out/).
**Осталось:** варианты договоров 11кл / для совершеннолетнего (когда будут
бланки); проверка стыковки чекбоксов (город/село, льготы) в бланках вручную.

---

## Доработка 9 — Реальные договоры: конвертация, плейсхолдеры, подключение ✅

**Дата:** 2026-06-30
**Что сделано:**

- **Конвертация `.doc → .docx`** всех 10 договоров (textutil) и **автоматическая
  расстановка плейсхолдеров** `{{...}}` (№, дата, стороны в преамбуле, реквизиты
  Заказчика и Обучающегося). Результат — `public/templates/contracts/<код>.docx`.
- **Парсер точечных путей** в `renderTemplate` (`{{customer.fullName}}`) +
  `nullGetter` → пустая строка. Проверено рендером с тестовыми данными: значения
  подставляются в правильные места.
- **student / customer в buildTemplateData:** `student` — всегда абитуриент;
  `customer` — сам (если совершеннолетний) или представитель (если нет).
- **Реестр договоров** `templating/contracts.ts` (код специальности → файл) и
  `generateContract` — заполняет реальный бланк, с откатом к программному, если
  файла нет. Подключено в реестр пакета (`dogovor`).
- Аббревиатуры файлов договоров подтверждены (ССА, БД=Банковское дело,
  Ю, Землеустр, ОДЛ, ЭКН, ТО, ПО=Полиграфическое, БАС, ПБ).

**Файлы затронуты:** public/templates/contracts/*.docx (10 новых),
src/domains/documents/templating/{renderTemplate,contracts,buildTemplateData}.ts,
src/domains/documents/generator.ts
**Проверки:** tsc ✓, lint ✓, vitest 33/33 ✓, build ✓ (шаблоны в out/).
**Следующий шаг:** заявления (обычное/профессионалитет) и согласия — разметка
плейсхолдерами (таблично-ячеечная вёрстка, делается аккуратно отдельно);
варианты договоров 11кл и для совершеннолетнего (когда будут бланки).

---

## Доработка 8 — Реальные бланки: поля, логика, специальности ✅

**Дата:** 2026-06-30
**Что сделано:** Изучены бланки колледжа (заявления, договоры по специальностям,
согласия) через textutil. Добавлены поля и логика под реальные документы.

- **Новые поля абитуриента:** гражданство, тип населённого пункта (город/село),
  основание поступления (бюджет/договор), дата подачи заявления, признак
  «профессионалитет» (ставится по выбранной специальности).
- **Данные Заказчика по договору:** у представителя (родителя) — чекбокс
  «Заказчик по договору» и полный блок (дата/место рождения, СНИЛС, паспорт,
  адрес регистрации, email). Карточка представителя вынесена в компонент
  `ParentCard` (условный показ блока через `useWatch`).
- **Логика шаблонов:** в `buildTemplateData` — `isAdult`/`isMinor`
  (совершеннолетие на дату подачи → выбор варианта договора: на представителя
  или на самого обучающегося), `representative.*` (Заказчик), `professionalitet`
  (выбор бланка заявления: обычное или «Профессионалитет»), гражданство, тип н.п.,
  основание, дата подачи.
- **Специальности:** флаг `professionalitet` в модели, каталог колледжа (26
  специальностей из брошюры, звёздочка = профессионалитет), управление флагом в
  «Справочной» (чекбокс + бейдж), ★ в списке выбора специальности.
- Обновлён `TEMPLATE_FIELDS.md`. Тестовые фикстуры дополнены; тесты 33/33.

**Файлы затронуты:** src/domains/applicant/{types,schema}.ts,
src/domains/applicant/hooks/useApplicantForm.ts,
src/domains/applicant/data/{specialties.ts,specialties.json},
src/domains/applicant/components/{PersonalDataSection,EducationConditionsSection,ParentsSection}.tsx,
src/domains/documents/templating/buildTemplateData.ts (+ тест),
src/app/reference/page.tsx, TEMPLATE_FIELDS.md
**Проверки:** tsc ✓, lint ✓, vitest 33/33 ✓, build ✓.
**Следующий шаг / нужно уточнить:**

- Договоры даны в `.doc` (нужна конвертация в `.docx`) и только «9кл ОЧНОЕ» на
  представителя — нужны варианты 11кл, для совершеннолетнего, заочные.
- Сверить коды/звёздочки специальностей (правится в «Справочной»).
- Составить реестр: специальность+база+совершеннолетие → файл договора;
  профессионалитет → вариант заявления.

---

## Доработка 7 — Движок Word-шаблонов (docxtemplater) ✅

**Дата:** 2026-06-30
**Что сделано:** Подготовлен фундамент «простого способа» для реальных бланков
колледжа (плейсхолдеры `{{поле}}` в `.docx`).

- Установлены `docxtemplater` + `pizzip`.
- `buildTemplateData(data)` — превращает данные абитуриента в значения
  плейсхолдеров (даты форматированы, пол/форма обучения/тип документа — словами,
  `fio`, `today`, реквизиты колледжа, родители массивом и по индексу `parent1/2`).
- `renderDocxTemplate(content, data)` и `renderTemplateFromUrl(url, data)` —
  заполнение `.docx` через docxtemplater (разделители `{{ }}`).
- `TEMPLATE_FIELDS.md` — справочник всех доступных плейсхолдеров, примеры циклов
  `{{#parents}}…{{/parents}}` и условий.
- 4 теста на `buildTemplateData` (итого 31 тест).

**Файлы затронуты:** package.json,
src/domains/documents/templating/{buildTemplateData,renderTemplate,buildTemplateData.test}.ts,
TEMPLATE_FIELDS.md
**Проверки:** tsc ✓, lint ✓, vitest 31/31 ✓, build ✓.
**Следующий шаг:** получить бланки колледжа, расставить плейсхолдеры, положить в
`public/templates/`, переключить сборку пакета на реальные шаблоны.

---

## Доработка 6 — Кнопки действий, статусы секций, деплой ✅

**Дата:** 2026-06-30
**Что сделано:**

- **«Очистить поля»** — кнопка в нижней панели (с подтверждением): сброс формы
  `form.reset(emptyApplicant())` + очистка черновика.
- **«Продолжить работу»** — после генерации сбрасывает форму для нового абитуриента.
- **Пошаговый прогресс генерации** + автоскачивание ZIP (ранее) — на месте.
- **Индикатор «Заполнено полей»** перенесён в фиксированную нижнюю панель (над
  кнопками очистки/формирования); верхняя карточка прогресса убрана.
- **Статусы секций в сайдбаре:** зелёная галочка — секция корректно заполнена
  (проверка по zod-схемам через `sectionStatus` в `useApplicantForm`); красный
  крестик — секцию пролистали (IntersectionObserver-«visited»), но не заполнили.
- **Бордеры блоков смягчены:** `border-2` → `border`, цвет границ осветлён
  (`--border`), поля ввода чуть контрастнее; подписи всех полей — сверху (чекбокс
  «Не работает» возвращён под поле).
- **Git/деплой:** проект запушен на GitHub `webNekit/committee`, ветка `frontend`;
  настроен автодеплой Netlify (publish `out`, command `npm run build`, env
  `NEXT_PUBLIC_DADATA_TOKEN`). Исправлен `require()` → `import` в
  `tailwind.config.ts` (правило ESLint в pre-commit).

**Файлы затронуты:** src/app/applicant/new/page.tsx,
src/features/document-pack/{DocumentPackButton,useDocumentPack}.ts(x),
src/domains/documents/generator.ts,
src/domains/applicant/hooks/useApplicantForm.ts,
src/shared/components/FormSidebar.tsx,
src/shared/components/{FormSection,TopBar}.tsx, src/app/globals.css,
src/domains/applicant/components/ParentsSection.tsx, tailwind.config.ts
**Проверки:** tsc ✓, lint ✓, vitest ✓, build ✓.

---

## Доработка 5 — Монохром, тёмная тема, текстура, новые контролы ✅

**Дата:** 2026-06-29
**Что сделано:**

- **Монохромная палитра:** белый фон / чёрный акцент (light) и чёрный фон / белый
  акцент (dark). Все компоненты переведены на семантические CSS-переменные
  (primary/foreground/card/border/accent) вместо синего brand и slate college.
- **Переключение темы:** `ThemeProvider` (light/dark/system, сохранение в
  localStorage, реакция на смену системной темы) + анти-FOUC инлайн-скрипт в
  `body` + сегментированный `ThemeToggle` (солнце/луна/монитор) в верхней панели.
  `darkMode: 'class'` уже был включён; добавлен блок `.dark` переменных.
- **Текстура фона:** утилита `.bg-dots` (радиальные точки цветом `--dots`),
  применена к обёрткам обеих страниц; адаптируется под тему.
- **Бордеры блоков:** карточки секций, прогресса и сайдбара — `border-2`;
  у `FormSection` шапка стала нейтральной (border-b, чип-иконка `bg-primary`).
- **Выбор пола и базовое образование:** новый `SegmentedControl` вместо
  radio-кнопок (активный сегмент — чёрный/белый акцент).
- **Блок родителей переоформлен:** чистые бордерные карточки с шапкой-полоской
  (нумерованный чип + «Представитель» + удалить), поля ниже, чекбокс «Не работает»
  в одну строку с полем; кнопка добавления — пунктирная карточка.

**Файлы затронуты:** src/app/globals.css, src/app/layout.tsx,
src/shared/components/theme/{ThemeProvider,ThemeToggle}.tsx (новые),
src/shared/components/ui/segmented.tsx (новый),
src/shared/components/{TopBar,FormSidebar,FormSection}.tsx,
src/app/applicant/new/page.tsx, src/app/reference/page.tsx,
src/features/document-pack/DocumentPackButton.tsx,
src/domains/applicant/components/{PersonalDataSection,EducationConditionsSection,ParentsSection}.tsx,
tailwind.config.ts
**Проверки:** tsc ✓, lint ✓, vitest 27/27 ✓, build ✓.
**Примечание:** `ui/radio-group.tsx` и `ui/select.tsx` больше не используются
(оставлены как примитивы).

---

## Доработка 4 — Layout с сайдбаром, палитра, фикс клиппинга ✅

**Дата:** 2026-06-29
**Что сделано:**

- **Новый layout (как на референсе):** верхняя панель `TopBar` (бренд + ссылка
  «Справочная»), левый сайдбар `FormSidebar` с навигацией по секциям и scroll-spy
  (IntersectionObserver, активная секция подсвечивается синим), контент и
  `SiteFooter`. Старый `Navbar` удалён, обе страницы переведены на новый каркас.
- **Современная палитра:** тёмная база интерфейса — slate (`college` →
  slate-900/800/700), акцент — синий `brand` (blue-600). `--primary` теперь
  blue-600 (кнопки синие, как на референсе), `--accent` — светло-голубой,
  `--radius` 0.625rem.
- **Фикс обрезки селектов:** убран `overflow-hidden` с `FormSection` (скругление
  шапки через `rounded-t-xl`) и с карточек родителей (акцент через
  `border-l-4`). Выпадающие списки Combobox/подсказок больше не обрезаются краем
  блока.
- **«Продолжить работу»:** после генерации кнопка сбрасывает форму
  (`form.reset(emptyApplicant())`) и черновик, прокручивает вверх — можно сразу
  заполнять нового абитуриента. Рядом — «Скачать ZIP ещё раз».

**Файлы затронуты:** src/shared/components/{TopBar,SiteFooter,FormSidebar}.tsx
(новые), src/shared/components/FormSection.tsx, src/shared/components/Navbar.tsx
(удалён), src/app/applicant/new/page.tsx, src/app/reference/page.tsx,
src/features/document-pack/DocumentPackButton.tsx,
src/domains/applicant/components/ParentsSection.tsx, tailwind.config.ts,
src/app/globals.css
**Проверки:** tsc ✓, lint ✓, vitest 27/27 ✓, build ✓.

---

## Доработка — Редизайн, поиск в селектах, справочная ✅

**Дата:** 2026-06-29
**Что сделано:**

- **Searchable Combobox** (`shared/components/ui/combobox.tsx`): выпадающий список с
  полем поиска и клавиатурной навигацией (↑↓ Enter Escape). Все селекты формы
  переведены на него — специальность (поиск по коду/названию), форма обучения,
  иностранный язык, тип документа, роль родителя.
- **База специальностей в JSON**: данные вынесены в
  `data/specialties.json`; `data/specialties.ts` переписан как реактивное
  хранилище (localStorage + `useSyncExternalStore`) с add/remove/reset и
  импортом/экспортом JSON. Combobox специальностей читает список через
  `useSpecialties()` — добавленные записи появляются сразу.
- **Раздел «Справочная»** (`/reference`): таблица специальностей, добавление,
  удаление, сброс к стандартным, экспорт в `specialties.json` (скачивание) и
  импорт из файла.
- **Навигация**: `shared/components/Navbar.tsx` (sticky, градиент колледжа,
  активная вкладка) на обеих страницах: «Новый абитуриент» / «Справочная».
- **Современный редизайн**: градиентные шапки секций с иконками-чипами
  (`FormSection`), hero-блок на форме, sticky-прогресс под навбаром, мягкие тени,
  скруглённые карточки, аккуратные скроллбары и сглаживание шрифтов в
  `globals.css`.

**Файлы затронуты:** src/shared/components/ui/combobox.tsx,
src/shared/components/Navbar.tsx, src/shared/components/FormSection.tsx,
src/domains/applicant/data/{specialties.json,specialties.ts},
src/domains/applicant/components/{EducationConditionsSection,EducationSection,ParentsSection}.tsx,
src/app/applicant/new/page.tsx, src/app/reference/page.tsx, src/app/globals.css
**Проверки:** tsc ✓, next lint ✓, vitest 27/27 ✓, next build ✓ (маршруты /, /applicant/new, /reference).
**Известные проблемы / TODO:** `ui/select.tsx` больше не используется (оставлен как
shadcn-примитив). Изменения справочной хранятся в localStorage браузера; для
постоянного хранения экспортируйте JSON и замените файл в репозитории.

---

## Доработка 3 — Этапы генерации, автоскачивание, «не работает» ✅

**Дата:** 2026-06-29
**Что сделано:**

- **Пошаговый показ формирования:** `generateAllDocuments` теперь генерирует
  документы последовательно с колбэком прогресса (`onProgress(id, status)`).
  `useDocumentPack` хранит `steps[]` со статусами pending/generating/done,
  `DocumentPackButton` рисует чек-лист из 6 документов с иконками
  (○ → спиннер → ✓) и счётчиком «N / 6».
- **Автоскачивание ZIP:** по завершении архив скачивается автоматически (вызов
  внутри пользовательского клика — без блокировки браузером). Кнопка «Скачать
  ZIP ещё раз» осталась. Раньше архив не скачивался, нужно было нажимать кнопку.
- **Галочка «Не работает»:** в блоке родителя у поля «Место работы» добавлен
  чекбокс; при включении поле блокируется, а в данные пишется «Не работает».
- **/reference и стили:** причина была в зависшем dev-сервере на порту 3000,
  запущенном до появления страницы и стилей. Процесс остановлен; после `npm run
dev` всё открывается. Также чистка повреждённого кэша `.next`.

**Файлы затронуты:** src/domains/documents/generator.ts,
src/features/document-pack/{useDocumentPack.ts,DocumentPackButton.tsx},
src/domains/applicant/components/ParentsSection.tsx
**Проверки:** tsc ✓, lint ✓, vitest 27/27 ✓, build ✓ (после очистки .next).

---

## Доработка 2 — Фикс автоподсказок и группового блока ✅

**Дата:** 2026-06-29
**Что сделано:**

- **Автоподсказки (Dadata):** в `SuggestInput` выбор фиксируется по `onMouseDown`
  до blur и до возможного обновления списка ответом API — в поле всегда попадает
  именно выбранная подсказка. Подсвечивается первый элемент; добавлен флаг
  `justSelected`, чтобы список не открывался повторно сразу после выбора.
- **Место рождения (cityOnly):** раньше в списке показывался полный адрес, а
  вставлялся только город — ощущение «попало не то». Теперь отображаемое и
  вставляемое значение совпадают (короткое «г Волгоград» из `city_with_type` /
  `settlement_with_type`), список дедуплицируется.
- **Групповые блоки родителей:** записи переведены в адаптивную сетку (2 в ряд),
  оформлены как карточки с нумерованным бейджем и цветным акцентом; кнопка
  добавления — пунктирная карточка-плейсхолдер.

**Про «слетевшие стили»:** в коде стили целы — свежий `next dev`/`next build`
отдаёт полный CSS (≈34 КБ со всеми утилитами и градиентами). Причина — старый
dev-сервер, запущенный до правок, не подхватил изменения. Решение: остановить и
заново запустить `npm run dev`, сделать hard refresh (Cmd/Ctrl+Shift+R).
Не открывать файлы из `out/` напрямую (file://) — нужен `npm run dev` или
`npx serve out`, иначе абсолютные пути к `/_next/...` не загрузятся.

**Файлы затронуты:** src/shared/components/{SuggestInput,AddressInput}.tsx,
src/domains/applicant/components/ParentsSection.tsx
**Проверки:** tsc ✓, lint ✓, vitest 27/27 ✓, build ✓.

---

## Этап 1 — Инициализация проекта ✅

**Дата:** 2026-06-29
**Что сделано:** Создан проект Next.js 14 (App Router, TypeScript strict, Tailwind v3,
src-dir, alias `@/*`). Установлены зависимости: docx, jszip, react-hook-form, zod,
@hookform/resolvers, lucide-react; dev: vitest, testing-library, jsdom, prettier.
shadcn/ui настроен вручную (CLI требует недоступную сеть): добавлены компоненты
button, input, label, select, card, badge, progress, checkbox, radio-group, accordion;
создан `components.json`, `cn` в `src/shared/lib/utils.ts`. Настроены `next.config.mjs`
(`output: 'export'`, `trailingSlash: true`, `images.unoptimized`), Tailwind с палитрой
колледжа и CSS-переменными, `globals.css`. Заменены `layout.tsx` (ru, метаданные) и
`page.tsx` (redirect → /applicant/new). Создан `.env.local.example`, `code.md`, `progress.md`.
**Файлы затронуты:** package.json, next.config.mjs, tailwind.config.ts, components.json,
.env.local.example, src/app/{layout,page,globals.css}, src/shared/lib/utils.ts,
src/shared/components/ui/*.tsx, code.md, progress.md
**Известные проблемы / TODO:** shadcn-компоненты добавлены вручную; при наличии сети
можно докидывать новые через CLI.

## Этап 2 — Домен applicant: типы и схема ✅

**Дата:** 2026-06-29
**Что сделано:** Созданы доменные типы (`PersonalData`, `PassportData`, `ParentData`,
`PreviousEducation`, `EducationConditions`, `ApplicantData`) и зеркальная Zod-схема
с кириллическими сообщениями об ошибках, масочными regex (СНИЛС, телефон, серия/номер
паспорта, код подразделения) и cross-field-валидацией фактического адреса.
**Файлы затронуты:** src/domains/applicant/types.ts, src/domains/applicant/schema.ts
**Известные проблемы / TODO:** —

## Этап 3 — Домен suggestions: Dadata ✅

**Дата:** 2026-06-29
**Что сделано:** Обёртка над Dadata Suggestions API (`api.ts`) с безопасной деградацией:
если токен не задан или сеть недоступна — возвращается пустой список, форма работает.
Хуки `useAddressSuggestions` / `useFioSuggestions` с дебаунсом 300 мс (общий `useDebounce`).
Универсальный `SuggestInput` с клавиатурной навигацией (↑↓ Enter Escape, клик вне закрывает).
Специализированные `AddressInput` (с режимом cityOnly) и `FioInput` (автоопределение пола).
Маски ввода без библиотек в `shared/lib/masks.ts`. Хелпер `FormSection`/`Field`.
**Файлы затронуты:** src/domains/suggestions/{types,api}.ts,
src/domains/suggestions/hooks/{useAddressSuggestions,useFioSuggestions}.ts,
src/shared/hooks/useDebounce.ts, src/shared/lib/masks.ts,
src/shared/components/{SuggestInput,AddressInput,FioInput,FormSection}.tsx
**Известные проблемы / TODO:** —

## Этап 4 — UI: секции формы ✅

**Дата:** 2026-06-29
**Что сделано:** Хук `useApplicantForm` (react-hook-form + zodResolver, дефолты,
автозагрузка/автосохранение черновика в localStorage каждые 30 с, расчёт % заполнения).
Секции: `PersonalDataSection` (ФИО с автоопределением пола, маски СНИЛС/телефон,
date picker, место рождения через AddressInput), `PassportSection` (маски серия/номер/код,
адреса Dadata, чекбокс совпадения адресов с условным фактическим адресом),
`ParentsSection` (useFieldArray, до 2 записей, роль/ФИО/телефон/работа),
`EducationSection` (предыдущее образование), `EducationConditionsSection`
(специальность из списка с автоподстановкой кода, формы обучения, языки, база 9/11).
Адреса включены в PassportSection (соответствует модели данных) — отдельный
AddressSection не выделялся. Понизили zod до v3 и @hookform/resolvers до v3 ради
совместимости синтаксиса схемы. `npx tsc --noEmit` проходит без ошибок.
**Файлы затронуты:** src/domains/applicant/hooks/useApplicantForm.ts,
src/domains/applicant/components/*.tsx, src/shared/lib/masks.ts (маски),
package.json (zod@3, @hookform/resolvers@3)
**Известные проблемы / TODO:** —

## Этап 8 — Список специальностей ✅

**Дата:** 2026-06-29
**Что сделано:** `src/domains/applicant/data/specialties.ts` с 10 специальностями
(код + название) и хелпером `findSpecialtyByName`. При выборе специальности код
подставляется автоматически, поле кода — readOnly. Сделано вместе с этапом 4,
т.к. требуется секцией условий обучения.
**Файлы затронуты:** src/domains/applicant/data/specialties.ts,
src/domains/applicant/components/EducationConditionsSection.tsx
**Известные проблемы / TODO:** Список — заглушка, требует уточнения у администрации.

## Этап 5 — Домен documents: шаблоны DOCX ✅

**Дата:** 2026-06-29
**Что сделано:** Общие хелперы `docx-helpers.ts` (реквизиты колледжа, Times New Roman 12pt,
поля A4 20мм/левое 30мм, `buildDocx` → Uint8Array, лейблы перечислений) и
`date-helpers.ts` (formatDate/formatDateLong/today). Шесть шаблонов-функций
`generateXxx(data): Promise<Uint8Array>`: anketa, lichnoe-delo (с фото-рамкой),
opis (таблица документов), raspiska (таблица + текст), ekzamen-list (таблица оценок),
dogovor (полный договор с реквизитами, бюджет/платно). Оркестратор `generator.ts`:
реестр `DOCUMENT_TEMPLATES`, `buildFileName` (Фамилия_Имя_суффикс.docx),
`generateAllDocuments` (Promise.all). Установлен `target: ES2020` в tsconfig.
**Файлы затронуты:** src/domains/documents/{types,generator}.ts,
src/domains/documents/utils/{docx-helpers,date-helpers}.ts,
src/domains/documents/templates/*.ts, tsconfig.json
**Известные проблемы / TODO:** Шаблоны — заглушки, требуют замены реальными бланками
колледжа (структура функций фиксирована).

## Этап 6 — Feature: сборка пакета документов ✅

**Дата:** 2026-06-29
**Что сделано:** Хук `useDocumentPack` (состояния idle|generating|done|error,
параллельная генерация 6 документов, упаковка в ZIP через JSZip, имя архива
`Комплект_Фамилия_Имя_ГГГГ-ММ-ДД.zip`, скачивание Blob). Компонент
`DocumentPackButton`: кнопка «Сформировать комплект», прогресс-бар, список
сформированных файлов с иконками и бейджами имён, кнопка «Скачать ZIP».
**Файлы затронуты:** src/features/document-pack/{useDocumentPack.ts,DocumentPackButton.tsx}
**Известные проблемы / TODO:** —

## Этап 7 — Главная страница и навигация ✅

**Дата:** 2026-06-29
**Что сделано:** Страница `/applicant/new` с `FormProvider`, шапкой колледжа,
индикатором % заполнения формы, предупреждением об отключённых подсказках Dadata,
последовательными секциями (условия обучения → личные → паспорт/адреса →
образование → родители) и sticky-футером с кнопкой формирования комплекта.
`/` редиректит на `/applicant/new`. `npm run build` (output: export) собирается,
каталог `out/` с index.html и applicant/new/index.html сформирован.
**Файлы затронуты:** src/app/applicant/new/page.tsx, src/app/page.tsx
**Известные проблемы / TODO:** —

## Этап 9 — Тесты и качество кода ✅

**Дата:** 2026-06-29
**Что сделано:** Настроен Vitest (jsdom, alias @, setup с jest-dom). Тесты:
schema (валидация СНИЛС/телефона/email/фактического адреса/граничные случаи),
date-helpers (форматирование дат), docx-helpers (генерация Paragraph/TextRun, лейблы),
integration generator.test (генерирует все 6 документов > 0 байт, проверка buildFileName).
Итого 27 тестов, все зелёные. ESLint-правила DDD: `no-restricted-imports` через
overrides запрещают междоменные импорты (кроме публичных types), тесты исключены.
Prettier (.prettierrc.json/.prettierignore) + скрипты test/typecheck/format.
husky + lint-staged: pre-commit запускает eslint --fix и prettier для staged-файлов.
Проверки: `tsc --noEmit` ✓, `next lint` ✓, `vitest run` ✓ (27/27).
**Файлы затронуты:** vitest.config.ts, vitest.setup.ts, .eslintrc.json,
.prettierrc.json, .prettierignore, package.json (скрипты, lint-staged), .husky/pre-commit,
src/**/*.test.ts (4 файла тестов)
**Известные проблемы / TODO:** —

## Этап 10 — Деплой и документация ✅

**Дата:** 2026-06-29
**Что сделано:** `netlify.toml` (build = npm run build, publish = out, NODE_VERSION 20).
`README.md` — описание системы, список из 6 документов, стек, быстрый старт, получение
токена Dadata, деплой на Netlify (5 шагов) и GitHub Pages (с basePath/.nojekyll),
структура проекта (DDD), ссылки на сопроводительные документы. `TEMPLATES.md` —
контракт generateXxx, реестр DOCUMENT_TEMPLATES, общие хелперы, пример шаблона,
работа с таблицами, чек-лист проверки и перенос реального бланка.
**Файлы затронуты:** netlify.toml, README.md, TEMPLATES.md
**Известные проблемы / TODO:** Шаблоны и список специальностей — заглушки; токен
Dadata нужно получить и задать в окружении хостинга.
