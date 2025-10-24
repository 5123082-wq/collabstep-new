# Collabverse Stage 0

## Требования
- Node.js 20 (см. `.nvmrc`)
- pnpm 9

## Установка и запуск
1. Установите зависимости: `pnpm install`
2. Подготовьте переменные окружения: `pnpm ensure-env`
3. Режим разработки: `pnpm dev` (откройте `http://localhost:3000/`)
4. Продакшен-сборка: `pnpm build && pnpm start`

> Preflight Stage 4 — пройден.

## Тесты
- Юнит-тесты: `pnpm test`
- E2E: `pnpm test:e2e`

## Переменные окружения
- `NAV_V1` — флаг навигации (off/on)
- `APP_LOCALE` — локаль приложения (по умолчанию ru)
- `FEATURE_PROJECTS_V1` — включает CRM «Проекты v1» (0/1)
- `AUTH_DEV` — включает dev-авторизацию (on/off)
- `DEMO_ADMIN_EMAIL`, `DEMO_ADMIN_PASSWORD` — реквизиты демо-админа
- `DEMO_USER_EMAIL`, `DEMO_USER_PASSWORD` — реквизиты демо-пользователя
- `FIN_EXPENSES_STORAGE` — выбирает драйвер хранилища расходов (`memory` или `db`). Значение по умолчанию в dev — `memory`, в staging/prod (`NODE_ENV` или `VERCEL_ENV`) — `db`. На Vercel задайте `FIN_EXPENSES_STORAGE=db` для окружений `staging` и `production`, а в `preview` оставьте `memory`, если не требуется реальная база.
- `NEXT_PUBLIC_FEATURE_*` — флаги второго поколения для UI. По умолчанию включены `NEXT_PUBLIC_FEATURE_FINANCE_GLOBAL=1` и `NEXT_PUBLIC_FEATURE_PROJECTS_OVERVIEW=1`; остальные (`NEXT_PUBLIC_FEATURE_CREATE_WIZARD`, `NEXT_PUBLIC_FEATURE_PROJECT_DASHBOARD`, `NEXT_PUBLIC_FEATURE_TASKS_WORKSPACE`, `NEXT_PUBLIC_FEATURE_BUDGET_LIMITS`, `NEXT_PUBLIC_FEATURE_FINANCE_AUTOMATIONS`) стартуют в состоянии `0` и включаются по мере готовности.
- (опционально) `SKIP_VERCEL_BUILD=1` — отключает локальную симуляцию `vercel build` при отсутствии токена
- На Vercel установите `NAV_V1=on`, `APP_LOCALE=ru`, `AUTH_DEV=on`, данные демо-аккаунтов и `FIN_EXPENSES_STORAGE` согласно окружению (`memory` для `preview`, `db` для `staging`/`production`).

Пример `.env`:

```
NAV_V1=on
APP_LOCALE=ru
FEATURE_PROJECTS_V1=1
AUTH_DEV=on
FIN_EXPENSES_STORAGE=memory
DEMO_ADMIN_EMAIL=admin.demo@collabverse.test
DEMO_ADMIN_PASSWORD=demo-admin
DEMO_USER_EMAIL=user.demo@collabverse.test
DEMO_USER_PASSWORD=demo-user
```

### Finance Storage

Флаг `FIN_EXPENSES_STORAGE` определяет, использовать ли in-memory или DB-хранилище для расходов. По умолчанию dev-окружение остаётся на `memory`, а staging/prod (в том числе Vercel `VERCEL_ENV=staging|production`) переключаются на `db`. Для QA можно принудительно задать `FIN_EXPENSES_STORAGE=db`, чтобы проверить интеграцию с базой, либо оставить `memory`, чтобы воспроизвести in-memory режим.

При инициализации выводится лог `console.info` вида `[ExpenseStoreFactory] selecting expense store` с выбранным драйвером; если зависимости для `db` недоступны, появляется `console.warn` о возврате к in-memory. Эти сообщения стоит отслеживать в телеметрии/логах окружения.

На Vercel сборки `preview` остаются на `memory`, поэтому для прогонов, требующих БД, задайте `FIN_EXPENSES_STORAGE=db` вручную (например, через переменные окружения проекта или команду).

## Dev-авторизация и демо-аккаунты
- Быстрый вход доступен на `/login` кнопками «Войти демо-пользователем» и «Войти демо-админом» — данные берутся из переменных `DEMO_*`.
- POST `/api/auth/login` проверяет e-mail и пароль демо-аккаунтов, при ошибке возвращает текст «Неверная почта или пароль».
- POST `/api/auth/register` (при `AUTH_DEV=on`) создаёт dev-сессию `role=user` и перенаправляет на `/app/dashboard` с тостом «Регистрация успешна».
- POST `/api/auth/logout` очищает cookie `cv_session` и возвращает на `/login`.
- Защищённые маршруты `/app/*` и `/project/*` требуют cookie `cv_session`. При отсутствии сессии выполняется редирект на `/login` с тостом «Нужно войти в систему».
- Раздел `/app/admin` доступен только администратору; не-админа перенаправляет на `/app/dashboard` с тостом «Недостаточно прав».

## Этапы
- **Этап 0** — базовый каркас и инфраструктура
- **Этап 1** — развитие функционала, маркетинговый слой
- **Этап 4** — защита от ошибок и устойчивость

## Pre-5 RC: как пройти предварительную проверку
- Подготовьте окружение: `pnpm install`, `cp .env.example .env`, установите `NAV_V1=on`, `APP_LOCALE=ru` и остальные флаги навигации, требуемые для гостевого слоя.
- Включите гостевой слой и демо-проекты, затем убедитесь, что маркетинговые, дашбордные и проектные маршруты не выводят ошибок или предупреждений в браузерной консоли.
- Запустите полный прогон `pnpm verify`: линтер, проверка типов, сборка, юнит- и e2e-тесты, аудит маршрутов и `vercel build --prod`.
- После `pnpm verify` локально повторите e2e-смоук (основные маркетинговые страницы, дашборд, демо-проект, публичные заглушки) и проверьте меню на десктопе и мобильных точках.
- Сымитируйте 404 и ошибку внутри вкладки проекта, чтобы подтвердить работу границ ошибок и страниц `error`, `not-found`, `loading`.
- Убедитесь, что локальная симуляция Vercel-сборки (путь проекта, версия Node.js 20, пакетный менеджер pnpm 9) проходит без внешних запросов и что все заявленные маршруты отдают `200`.

- **Projects v1 (CRM скелет)**
  - Установите `FEATURE_PROJECTS_V1=1` в `.env` или переменных окружения Vercel.
  - В боковом меню появится пункт «Проекты», ведущий в мастер создания `/project/new`.
  - Создайте проект и перейдите на дашборд `/project/{id}`; из быстрых ссылок доступны задачи.
  - На странице задач `/project/{id}/tasks` можно добавить записи через мок-API.
  - Для e2e-прогонки используйте `pnpm test:e2e` (включает смоук `projects.smoke.spec.ts`).

## Этап 1: страницы и навигация
- Маркетинговый слой включает главную страницу, продуктовые разделы (`/product/*`), аудиторию, каталоги проектов, специалистов и подрядчиков, тарифы, блог и формы входа/регистрации. Для QA доступны зеркальные маршруты с префиксом `/mkt`.
- Двухуровневое меню: мегаменю на десктопе и мобильное меню-аккордеон. Конфигурация расположена в `apps/web/config/MarketingMenu.config.ts`.
- Общий layout маркетинговых страниц подключает шапку и футер, а домашняя страница состоит из секций Hero, Features, Audience и CTA.
- Чтобы включить маркетинговый слой на главной `/`, установите `NAV_V1=on` в `.env`. При `NAV_V1=off` отображается заглушка Stage 0.
- Обновлённые sitemap и robots перечисляют все маркетинговые маршруты. Перед публикацией выполните `pnpm test` и `pnpm test:e2e`.

## Этап 4 — защита от ошибок
- Добавлены единые `error.tsx`, `not-found.tsx` и `loading.tsx` для корневого уровня, маркетинга, приложений и проекта: состояние ошибки сопровождается кнопкой «Повторить попытку», страницы 404 ведут на главную и к списку проектов.
- Моки валидируются в рантайме через `zod`: лоадеры из `apps/web/lib/mock/loaders.ts` возвращают пустой массив и логируют проблему в dev-режиме, если структура JSON не соответствует схеме.
- Команда `pnpm verify` запускает полный пайплайн (линт, typecheck, build, unit, e2e, проверку маршрутов и `vercel build --prod`). GitHub Actions и husky `pre-push` используют этот же скрипт.
- E2E-покрытие усилено: добавлены сценарии для мегаменю, 404 и error-boundary, в тестах фиксируются `console.error`/`console.warn` на ключевых страницах.

## Как устроено мегаменю (A11y)
- Верхнеуровневая кнопка раскрывает панель при фокусе, а также по клавишам `Enter`, `Space` и `ArrowDown`. Состояние отражается через `aria-expanded="true"|"false"` и `aria-controls`.
- Панель мегаменю имеет `role="menu"`, все ссылки объявлены как `role="menuitem"`. Фокус не пропадает при переходе между элементами благодаря хэндлеру `onFocusCapture` и проверке `relatedTarget`.
- Навигация по клавише `Tab` зациклена внутри панели, `Escape` закрывает меню. Тест `menu-desktop.spec.ts` проверяет доступность и переход на «Обзор платформы».
## 🚀 Deploy to Vercel

To deploy:
1. Set environment vars `NAV_V1=on`, `APP_LOCALE=ru`, `FIN_EXPENSES_STORAGE` (`memory` for preview demos, `db` for staging/production)
2. Build command: `pnpm vercel-build`
3. Node 20, pnpm 9
