# Приёмная комиссия — ГБПОУ «Волгоградский технический колледж»

Веб-система автоматизации документооборота приёмной комиссии колледжа СПО.
Секретарь вводит данные абитуриента **один раз** и автоматически получает пакет
из **6 документов** в формате DOCX, упакованный в ZIP.

Всё работает **в браузере** — backend-сервер не нужен. Это позволяет
бесплатно разворачивать систему на статических хостингах (Netlify, GitHub Pages,
Render).

---

## Возможности

- Единая форма ввода данных абитуриента с разбивкой на секции.
- Подсказки адресов и ФИО через **Dadata** (с автоопределением пола).
- Маски ввода (СНИЛС, телефон, серия/номер паспорта, код подразделения).
- Автосохранение черновика в `localStorage` каждые 30 секунд.
- Индикатор процента заполнения формы.
- Генерация 6 документов DOCX и скачивание единым ZIP-архивом.
- Адаптивная вёрстка (работает на планшете / iPad).

### Генерируемые документы

1. **Анкета абитуриента** — `*_анкета.docx`
2. **Титульный лист личного дела** — `*_личное-дело.docx`
3. **Опись документов** — `*_опись.docx`
4. **Расписка** — `*_расписка.docx`
5. **Экзаменационный лист / лист собеседования** — `*_экзамен-лист.docx`
6. **Договор об образовании** — `*_договор.docx`

Архив именуется `Комплект_Фамилия_Имя_ГГГГ-ММ-ДД.zip`.

---

## Технологический стек

| Слой            | Технология                                  |
| --------------- | ------------------------------------------- |
| Фреймворк       | Next.js 14 (App Router, `output: 'export'`) |
| Язык            | TypeScript (strict)                         |
| Стили           | Tailwind CSS v3                             |
| UI-компоненты   | shadcn/ui + Radix UI                        |
| Формы           | react-hook-form + zod                       |
| Генерация DOCX  | docx                                        |
| Архивирование   | JSZip                                       |
| Подсказки       | Dadata Suggestions API                      |
| Иконки          | lucide-react                                |
| Тесты           | Vitest + Testing Library                    |
| Линтер / формат | ESLint + Prettier                           |
| Pre-commit      | husky + lint-staged                         |

---

## Быстрый старт (локально)

```bash
# 1. Установить зависимости
npm install

# 2. Скопировать пример переменных окружения
cp .env.local.example .env.local
#    и вписать токен Dadata (см. ниже). Без токена форма работает,
#    но подсказки адресов/ФИО будут отключены.

# 3. Запустить дев-сервер
npm run dev
#    → http://localhost:3000  (редирект на /applicant/new)
```

Полезные команды:

```bash
npm run build        # статический экспорт в каталог out/
npm run test         # запуск тестов (Vitest)
npm run typecheck    # проверка типов
npm run lint         # ESLint
npm run format       # Prettier --write
```

---

## Получение токена Dadata (бесплатно)

Бесплатный тариф Dadata — **до 10 000 запросов в день**, чего достаточно для
работы приёмной комиссии.

1. Зайдите на <https://dadata.ru/> и зарегистрируйтесь.
2. Подтвердите email.
3. Откройте раздел **«API» → «Профиль»** в личном кабинете.
4. Скопируйте значение **«Токен доступа к API»** (стандартный токен для
   Suggestions; именно он используется на фронтенде).
5. Вставьте его в `.env.local`:
   ```
   NEXT_PUBLIC_DADATA_TOKEN=ваш_токен
   ```

> Suggestions API допускает обращение прямо из браузера, поэтому токен —
> публичный (`NEXT_PUBLIC_`). Не используйте здесь «Секретный ключ».

---

## Деплой на Netlify (5 шагов)

1. Запушьте репозиторий на GitHub.
2. На <https://app.netlify.com/> → **Add new site → Import an existing project**,
   выберите репозиторий.
3. Netlify подхватит `netlify.toml` (команда `npm run build`, каталог `out`).
   При необходимости проверьте эти значения вручную.
4. В **Site settings → Environment variables** добавьте
   `NEXT_PUBLIC_DADATA_TOKEN` со значением вашего токена.
5. Нажмите **Deploy**. После сборки сайт будет доступен по адресу
   `*.netlify.app`.

---

## Деплой на GitHub Pages

GitHub Pages раздаёт статику из каталога `out/`.

1. В `next.config.mjs` уже включён `output: 'export'` и `trailingSlash: true`.
   Если сайт публикуется **не** в корне домена (например,
   `https://user.github.io/committee/`), добавьте `basePath` и `assetPrefix`:
   ```js
   const nextConfig = {
     output: "export",
     trailingSlash: true,
     basePath: "/committee",
     assetPrefix: "/committee/",
     images: { unoptimized: true },
   };
   ```
2. Соберите проект: `npm run build` → появится каталог `out/`.
3. Добавьте пустой файл `out/.nojekyll`, чтобы GitHub не игнорировал `_next`:
   ```bash
   touch out/.nojekyll
   ```
4. Опубликуйте `out/` (вручную в ветку `gh-pages` или через GitHub Action).
   Токен Dadata для Pages задаётся как secret и пробрасывается в шаг сборки
   через переменную `NEXT_PUBLIC_DADATA_TOKEN`.

---

## Структура проекта (DDD)

```
src/
├── app/                  # Next.js App Router: routing + layout
│   ├── layout.tsx
│   ├── page.tsx          # redirect → /applicant/new
│   └── applicant/new/    # главная форма
├── domains/
│   ├── applicant/        # данные абитуриента: типы, схема, хук формы, секции, данные
│   ├── documents/        # генерация DOCX: шаблоны, оркестратор, utils
│   └── suggestions/      # подсказки Dadata: api, хуки
├── shared/
│   ├── components/ui/    # shadcn/ui
│   ├── components/       # SuggestInput, AddressInput, FioInput, FormSection
│   ├── hooks/            # useDebounce
│   └── lib/              # utils (cn), masks
└── features/
    └── document-pack/    # сборка ZIP и кнопка скачивания
```

**Правило DDD:** домены не импортируют друг друга напрямую — только через
`shared/` или публичные `types`. Соблюдение проверяется ESLint-правилом
`no-restricted-imports`.

---

## Замена шаблонов документов

Шаблоны в `src/domains/documents/templates/` — **временные заглушки**.
Подробная инструкция по их кастомизации под реальные бланки колледжа — в
[TEMPLATES.md](./TEMPLATES.md).

---

## Сопроводительные документы

- [code.md](./code.md) — архитектурные решения и технический долг.
- [progress.md](./progress.md) — журнал разработки по этапам.
- [TEMPLATES.md](./TEMPLATES.md) — кастомизация DOCX-шаблонов.
