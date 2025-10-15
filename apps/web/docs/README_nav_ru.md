# Навигация приложения (Stage 2)

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

## Хоткеи и быстрые действия
- `Ctrl/⌘ + K` — открыть командную палитру (маски: `@` проекты/люди, `#` задачи, `$` счета).
- `Esc` — закрыть модальные окна и палитру.
- Кнопка «Создать» в топбаре открывает меню быстрых действий и селектор проекта.

## Пресеты фона
Переключатель в топбаре сохраняет выбранный пресет в `localStorage`:
- `Mesh`
- `Grid`
- `Halo`

## Проверка DoD (Stage 2)
1. Перейти на `/app/dashboard` — убедиться в отсутствии ошибок в консоли, топбар/сайдбар/правая панель видны.
2. Раскрыть/свернуть группы меню — ширина `.content-area` не меняется.
3. Открыть меню «Создать», выбрать проект и действие — появляется toast `TODO: …`.
4. В палитре `Ctrl/⌘ + K` ввести `#12` и `@demo` — отображаются задачи и проекты/люди из моков.
5. Переключить фон на `Halo`, обновить страницу — пресет сохраняется.
6. Навигация по ключевым маршрутам (`/app/marketplace/*`, `/app/docs/*`, `/app/profile/*`, `/app/finance/*`) отвечает 200 и показывает заглушки.
7. Запустить `pnpm -w lint`, `pnpm --filter @collabverse/web typecheck`, `pnpm build`, `pnpm test`, `pnpm test:e2e` — все команды зелёные.
