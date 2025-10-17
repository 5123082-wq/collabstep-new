# Навигация приложения (Roadmap 5–15)

## Маршруты /app
- `/app/dashboard`
- `/app/projects`
- `/app/projects/templates`
- `/app/projects/archive`
- `/app/marketplace/projects`
- `/app/marketplace/vacancies`
- `/app/marketplace/specialists`
- `/app/marketplace/contractors`
- `/app/marketplace/packs`
- `/app/ai-hub/generations`
- `/app/ai-hub/history`
- `/app/ai-hub/prompts`
- `/app/ai-hub/agents`
- `/app/community/pitch`
- `/app/community/rooms`
- `/app/community/events`
- `/app/community/rating`
- `/app/finance/wallet`
- `/app/finance/escrow`
- `/app/finance/invoices`
- `/app/finance/plans`
- `/app/finance/disputes`
- `/app/docs/files`
- `/app/docs/contracts`
- `/app/docs/brand-repo`
- `/app/messages`
- `/app/notifications`
- `/app/profile`
- `/app/profile/rating`
- `/app/profile/badges`
- `/app/profile/card`
- `/app/org/team`
- `/app/org/billing`
- `/app/org/process-templates`
- `/app/support/help`
- `/app/support/tickets`
- `/app/support/chat`
- `/app/admin`

## Маршруты /project
- `/project/DEMO/overview` — демо-проект с боковой навигацией.
- Вкладки: обзор, бриф, команда, вакансии, задачи, дизайн, сайт/разработка, маркетинг, подрядчики, AI, финансы, документы, таймлайн, аналитика, настройки.
- Контекст сохраняется в `localStorage` (`cv-ui`, `cv-project:DEMO`), поэтому при возврате открывается последняя посещённая вкладка.

### Быстрые действия внутри проекта
- `+ Создать` в хедере — открывает меню с привязкой к текущему проекту.
- Командная палитра `Ctrl/⌘ + K` показывает данные только текущего проекта (маски: `@` участники/подрядчики, `#` задачи, `$` счета).
- Хедер содержит действия: пригласить, открыть вакансию, запросить смету, открыть эскроу, настройки проекта.

## Пресеты фона
Переключатель в топбаре сохраняет выбранный пресет в `localStorage`:
- `Mesh`
- `Grid`
- `Halo`

## Проверка DoD (Roadmap)
1. Перейти на `/project/DEMO/overview` — сайдбар фиксированной ширины (288px), ошибок в консоли нет.
2. Сменить вкладку (например, «Задачи» → «Дизайн») — ширина контента не меняется, состояния блоков отображаются.
3. Нажать `+ Создать` в хедере — меню открывается без селектора проекта, действия показывают toast `TODO: …`.
4. Открыть палитру `Ctrl/⌘ + K`, ввести `#` — видны задачи только проекта DEMO; `$` — счета DEMO; `@` — участники и подрядчики DEMO.
5. Проверить доступность меню: вкладки «Финансы», «Настройки» доступны только ролям `FOUNDER|PM|ADMIN`, «Подрядчики` — `FOUNDER|PM|CONTRACTOR`.
6. Сбросить вкладку (удалить `cv-project:DEMO`) и обновить `/project/DEMO` — происходит редирект на сохранённую/дефолтную вкладку.
7. Запустить `pnpm -w lint`, `pnpm --filter @collabverse/web typecheck`, `pnpm build`, `pnpm test`, `pnpm test:e2e` — все проверки зелёные.
