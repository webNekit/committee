# code.md — Техническое состояние проекта

Система «Приёмная комиссия» — ГБПОУ «Волгоградский технический колледж».
Веб-приложение для ввода данных абитуриента и генерации комплекта из 6 документов DOCX
полностью в браузере (без backend).

## Архитектурные решения

### Почему статический экспорт (no SSR на сервере)?

Все операции — форма + генерация DOCX — выполняются в браузере.
Серверный рендеринг не нужен. Это позволяет деплоить на бесплатные хостинги
(Netlify / GitHub Pages / Render). В `next.config.mjs` включены
`output: 'export'` и `trailingSlash: true`.

### Почему DDD?

Три чётко разграниченных домена (`applicant`, `documents`, `suggestions`)
не должны знать друг о друге напрямую. Общение — через `types` и `shared/`.
Слой `features/` собирает домены в пользовательские сценарии (сборка пакета).

### Почему docx, а не pdf?

Секретари должны иметь возможность редактировать документы после генерации.
PDF — финальный формат, DOCX — рабочий.

### shadcn/ui установлен вручную

CLI `shadcn init` требует сетевого доступа к ui.shadcn.com, недоступного в среде
сборки. Поэтому компоненты UI (`button`, `input`, `label`, `select`, `card`,
`badge`, `progress`, `checkbox`, `radio-group`, `accordion`) добавлены вручную
в `src/shared/components/ui/`. `components.json` присутствует — при наличии сети
можно добавлять новые компоненты обычным `npx shadcn@latest add <name>`.

### Selects — собственный Combobox с поиском

Вместо Radix Select все выпадающие списки используют `shared/components/ui/combobox.tsx`
с полем поиска и клавиатурной навигацией. Это единообразно для длинных списков
(специальности) и коротких (роль, язык). `ui/select.tsx` оставлен как примитив,
но в формах не задействован.

### База специальностей: JSON + localStorage (без backend)

База лежит в `data/specialties.json`. Так как backend нет, редактирование из
раздела «Справочная» сохраняется в localStorage (`data/specialties.ts`,
`useSyncExternalStore`). Для постоянного хранения пользователь экспортирует JSON
и заменяет файл в репозитории. Combobox читает список реактивно через
`useSpecialties()`.

### Маски ввода без библиотек

СНИЛС, телефон, серия/номер паспорта, код подразделения форматируются
простыми чистыми функциями в `src/shared/lib/masks.ts` и применяются через
`onChange`. Сторонние библиотеки масок не используются (правило промта №6).

## Структура

```
src/
├── app/                  # routing + layout (Next.js App Router)
├── domains/
│   ├── applicant/        # типы, zod-схема, хук формы, секции, данные (специальности)
│   ├── documents/        # генераторы DOCX, шаблоны, utils
│   └── suggestions/      # обёртка Dadata + хуки
├── shared/
│   ├── components/ui/    # shadcn/ui
│   ├── components/       # SuggestInput, AddressInput, FioInput, FormSection
│   ├── hooks/            # useDebounce
│   └── lib/              # utils (cn), masks
└── features/
    └── document-pack/    # сборка ZIP и кнопка скачивания
```

## Текущие зависимости

Runtime: next 14, react, react-dom, docx, jszip, react-hook-form, zod,
@hookform/resolvers, lucide-react, class-variance-authority, clsx,
tailwind-merge, tailwindcss-animate, @radix-ui/react-{slot,label,select,
progress,checkbox,radio-group,accordion}.

Dev: typescript, tailwindcss, eslint, prettier, vitest, @vitejs/plugin-react,
@testing-library/react, @testing-library/jest-dom, jsdom.

## Известный технический долг

- [ ] Шаблоны документов — заглушки, требуют замены реальными формами колледжа
- [ ] Список специальностей — заглушка, требует уточнения у администрации
- [ ] Dadata token — нужно получить и добавить в .env.local
- [ ] husky/lint-staged — pre-commit хуки (этап 9)

## Переменные окружения

- `NEXT_PUBLIC_DADATA_TOKEN` — токен Dadata для подсказок адресов и ФИО.
  Получить: https://dadata.ru/ → Регистрация → API → Токен.
  Если не задан — подсказки не работают, форма остаётся доступной.
