status: active
last_reviewed: 2025-02-15
owner: docs

# Системный обзор Collabverse

## Содержание

- [Текущая клиентская архитектура и навигация](#текущая-клиентская-архитектура-и-навигация)
  - [Маркетинговый слой](#маркетинговый-слой)
  - [Приложение после логина](#приложение-после-логина)
- [Состояние и используемые библиотеки](#состояние-и-используемые-библиотеки)
- [Текущее API (Next.js route handlers)](#текущее-api-nextjs-route-handlers)
  - [Аутентификация](#аутентификация)
  - [Проекты и задачи (флаг feature_projects_v1)](#проекты-и-задачи-флаг-feature_projects_v1)
- [Доменные сущности и связи](#доменные-сущности-и-связи)
  - [Предлагаемая реляционная модель](#предлагаемая-реляционная-модель)
  - [Ключевые связи](#ключевые-связи)
- [API контракты для бэкенда (предложение)](#api-контракты-для-бэкенда-предложение)
- [Авторизация и мультиаккаунт](#авторизация-и-мультиаккаунт)

## Текущая клиентская архитектура и навигация

### Маркетинговый слой

- Layout маркетинговых страниц подключает шапку, футер и тосты только когда флаг `NAV_V1` активен, иначе отдаёт контент без навигации.【F:apps/web/app/(marketing)/layout.tsx†L1-L32】【F:apps/web/lib/feature-flags.ts†L1-L3】
- Мегаменю и мобильное меню строятся на базе конфигурации `marketingMenu` с вложенными элементами и CTA, что определяет маршруты `/product/*`, `/audience`, `/projects`, `/specialists`, `/pricing`, `/blog` и авторизацию.【F:apps/web/config/MarketingMenu.config.ts†L1-L121】

### Приложение после логина

- Сегмент `(app)` проверяет наличие demo-сессии в cookie `cv_session` и редиректит на `/login` при отсутствии токена.【F:apps/web/app/(app)/layout.tsx†L1-L14】【F:apps/web/lib/auth/demo-session.ts†L3-L68】
- Клиентский layout собирает топбар, левое меню, контентную область, правую панель или hover-rail и управляет логаутом через вызов `/api/auth/logout`, используя roles, полученные из demo-сессии.【F:apps/web/components/app/AppLayoutClient.tsx†L29-L126】【F:apps/web/lib/auth/roles.ts†L3-L65】【F:apps/web/app/api/auth/logout/route.ts†L1-L15】
- Левое меню построено на конфигурации `LeftMenu.config` с множеством разделов (проекты, маркетплейс, AI-хаб, документы, финансы и т.д.) и фильтрацией по ролям, а `Sidebar` управляет раскрытием групп через Zustand-хранилище с персистом в `localStorage`.【F:apps/web/components/app/LeftMenu.config.ts†L1-L200】【F:apps/web/lib/nav/menu-builder.ts†L1-L19】【F:apps/web/components/app/Sidebar.tsx†L1-L125】【F:apps/web/lib/state/ui-store.ts†L1-L76】
- Быстрые действия в hover-rail используют моковую конфигурацию с экшенами (новый проект, задача, приглашение) и бейджами, зависящими от состояния UI-store.【F:apps/web/mocks/rail.ts†L1-L53】【F:apps/web/types/quickActions.ts†L1-L15】【F:apps/web/stores/ui.ts†L1-L40】

## Состояние и используемые библиотеки

- Глобальный UI-store (`useUiStore`) хранит пресет фона, раскрытые группы меню и последний проект; данные персистятся через `zustand/middleware` с in-memory fallback на сервере.【F:apps/web/lib/state/ui-store.ts†L1-L76】
- Клиентский `useUI` управляет состояниями правых панелей, диалогов и счётчиков уведомлений/чатов для hover-rail и drawers.【F:apps/web/stores/ui.ts†L1-L40】【F:apps/web/components/right-rail/CommunicationDrawer.tsx†L9-L40】
- Магазин маркетплейса (`useMarketplaceStore`) реализует корзину, избранное и сигнал сброса фильтров, работая на Zustand без персиста.【F:apps/web/lib/marketplace/store.ts†L1-L67】
- Основной стек фронтенда: Next.js 14, React 18, Zustand, Zod, TailwindCSS, Lucide icons, Fuse.js для поиска.【F:apps/web/package.json†L1-L32】

## Текущее API (Next.js route handlers)

API реализовано в `app/api` и работает поверх in-memory мока `projects-memory`.

### Аутентификация

- `POST /api/auth/login` — проверка демо-аккаунтов из ENV и установка cookie `cv_session` (base64 JSON).【F:apps/web/app/api/auth/login/route.ts†L1-L83】【F:apps/web/lib/auth/session-cookie.ts†L1-L34】
- `POST /api/auth/register` — dev-регистрация: валидация payload, установка сессии с ролью `user` и редирект на `/app/dashboard`.【F:apps/web/app/api/auth/register/route.ts†L1-L39】
- `POST /api/auth/logout` — очищение cookie и редирект (JSON/303).【F:apps/web/app/api/auth/logout/route.ts†L1-L15】

### Проекты и задачи (флаг `FEATURE_PROJECTS_V1`)

- `GET/POST /api/projects` — список проектов с агрегацией задач и создание проекта с выбором стадии и дедлайна.【F:apps/web/app/api/projects/route.ts†L1-L90】
- `GET/PATCH/DELETE /api/projects/:id` — чтение, частичное обновление и удаление проекта с каскадным очищением задач/итераций/воркфлоу.【F:apps/web/app/api/projects/[id]/route.ts†L1-L83】
- `POST /api/projects/:id/archive` и `/unarchive` — флип статуса архива с timestamp.【F:apps/web/app/api/projects/[id]/archive/route.ts†L1-L35】【F:apps/web/app/api/projects/[id]/unarchive/route.ts†L1-L35】
- `GET/POST /api/projects/:id/iterations` — список и создание итераций/спринтов.【F:apps/web/app/api/projects/[id]/iterations/route.ts†L1-L47】
- `GET/POST /api/projects/:id/tasks` — фильтрация по статусу/итерации, создание задач с валидацией Zod.【F:apps/web/app/api/projects/[id]/tasks/route.ts†L1-L78】
- `PATCH /api/projects/:id/tasks/:taskId` — частичное обновление задачи с проверкой статусов против workflow.【F:apps/web/app/api/projects/[id]/tasks/[taskId]/route.ts†L1-L89】
- `POST /api/projects/:id/tasks/transition` — смена статуса задачи по workflow.【F:apps/web/app/api/projects/[id]/tasks/transition/route.ts†L1-L40】
- `GET/PUT /api/projects/:id/workflow` — чтение и обновление пользовательских статусов (3-7 уникальных значений).【F:apps/web/app/api/projects/[id]/workflow/route.ts†L1-L42】
- `POST /api/projects/from-template` — создание проекта из шаблона с автогенерацией задач и дефолтного workflow.【F:apps/web/app/api/projects/from-template/route.ts†L1-L71】【F:apps/web/app/api/projects/templates-utils.ts†L1-L158】
- `POST /api/projects/:id/templates/attach` — добавление задач по шаблону к существующему проекту и обновление `updatedAt`.【F:apps/web/app/api/projects/[id]/templates/attach/route.ts†L1-L55】
- `GET /api/templates` — список проектных шаблонов из мока.【F:apps/web/app/api/templates/route.ts†L1-L11】【F:apps/web/mocks/projects-memory.ts†L3-L76】

## Доменные сущности и связи

Текущие типы домена охватывают проекты, задачи, workflow, итерации и участников.【F:apps/web/domain/projects/types.ts†L1-L51】 На основе существующего UI и roadmap предлагается следующая схема.

### Предлагаемая реляционная модель

| Таблица | Ключевые поля | Связи |
| --- | --- | --- |
| `users` | `id`, `email`, `password_hash`, `display_name`, `locale` | 1:N с `sessions`, `user_accounts`, `project_members`, `task_assignments` |
| `organizations` | `id`, `name`, `primary_owner_id` | 1:N с `accounts`, `projects`, `org_members` |
| `org_members` | `organization_id`, `user_id`, `role` | Роли: owner/admin/member/observer; для прав доступа |
| `accounts` | `id`, `organization_id`, `account_type` (`workspace`/`personal`), `label` | Определяет «рабочие пространства» для мультиаккаунта |
| `user_accounts` | `user_id`, `account_id`, `default_role`, `last_active_at` | Пользователь ↔ аккаунты, хранит роль в workspace |
| `projects` | `id`, `account_id`, `owner_id`, `title`, `description`, `stage`, `status`, `deadline`, `archived`, timestamps | FK на `accounts`, `users` |
| `project_members` | `project_id`, `user_id`, `role` (`owner`/`coord`/`member`/`viewer`) | Маппинг людей к проектам |
| `project_templates` | `id`, `title`, `summary`, `kind`, `visibility`, `author_account_id` | Источник для `project_template_tasks` |
| `project_template_tasks` | `id`, `template_id`, `title`, `description`, `default_status`, `default_labels`, `offset_start_days`, `offset_due_days` | Переиспользуемые заготовки задач |
| `project_workflows` | `project_id`, `name`, `is_default` | 1:N с `workflow_statuses` |
| `workflow_statuses` | `id`, `workflow_id`, `position`, `code`, `label`, `is_terminal` | Определяет канбан-колонки |
| `iterations` | `id`, `project_id`, `title`, `start_at`, `end_at` | Привязка спринтов |
| `tasks` | `id`, `project_id`, `iteration_id`, `parent_task_id`, `title`, `description`, `status_code`, `priority`, `start_at`, `due_at`, timestamps | `status_code` FK на `workflow_statuses.code` |
| `task_assignments` | `task_id`, `user_id`, `role` (`assignee`/`reviewer`) | Позволяет несколько исполнителей |
| `task_labels` | `id`, `project_id`, `code`, `label`, `color` | Набор меток |
| `task_label_links` | `task_id`, `label_id` | M:N |
| `documents` | `id`, `project_id`, `title`, `type`, `status`, timestamps | Документы/договоры |
| `document_versions` | `id`, `document_id`, `file_id`, `version`, `created_by`, timestamps | Версионность документов |
| `files` | `id`, `uploader_id`, `filename`, `mime_type`, `size_bytes`, `storage_url`, `sha256`, `uploaded_at` | Бинарные объекты |
| `project_files` | `project_id`, `file_id`, `linked_entity` (`task`/`document`/`comment`), `entity_id` | Связь файлов с доменными сущностями |
| `notifications` | `id`, `user_id`, `type`, `payload`, `read_at` | Для счетчиков в UI |
| `messages` | `id`, `conversation_id`, `author_id`, `body`, timestamps | Чаты (будущая интеграция) |
| `conversations` | `id`, `project_id`, `topic`, `last_message_at` | Источник данных для drawer «Чаты» |

### Ключевые связи

- Пользователь может состоять в нескольких организациях и аккаунтах, поддерживая мультиаккаунтный доступ.
- Проект принадлежит аккаунту (workspace) и может ссылаться на шаблон/workflow.
- Задачи поддерживают иерархию (`parent_task_id`), статусы из workflow и множественные назначения.
- Документы и файлы связаны через универсальную таблицу `project_files`, что покрывает секции «Документы и файлы» в меню.

## API контракты для бэкенда (предложение)

Ниже сводный контракт, расширяющий текущие Next.js endpoints.

| Метод и путь | Описание | Тело запроса | Ответ |
| --- | --- | --- | --- |
| `POST /api/auth/login` | E-mail + пароль, опционально `accountId` для моментального переключения | `{ email, password, accountId? }` | 200 `{ sessionToken, user, accounts }` или 401/403 | 
| `POST /api/auth/register` | Регистрация пользователя + создание личного workspace | `{ name, email, password }` | 201 `{ user, account }` |
| `POST /api/auth/logout` | Завершение сессии | — | 204 |
| `POST /api/auth/switch` | Переключение аккаунта в рамках одной сессии | `{ accountId }` | 200 `{ sessionToken, account }` |
| `GET /api/accounts` | Список доступных аккаунтов пользователя | — | 200 `{ items: AccountSummary[] }` |
| `POST /api/accounts` | Создание нового workspace | `{ name, type }` | 201 `{ account }` |
| `GET /api/projects` | Фильтрация по `accountId`, `archived`, `stage`, `label` | Query | 200 `{ items, pagination }` |
| `POST /api/projects` | Создание проекта | `{ title, description?, stage?, deadline?, templateId?, workflowId? }` | 201 `{ project }` |
| `GET /api/projects/:id` | Подробности, workflow, участники | — | 200 `{ project, members, workflow }` |
| `PATCH /api/projects/:id` | Обновление полей | Partial Project | 200 `{ project }` |
| `POST /api/projects/:id/archive` | Архивирование | — | 200 `{ id, archivedAt }` |
| `POST /api/projects/:id/unarchive` | Разархивирование | — | 200 `{ id }` |
| `GET /api/projects/:id/tasks` | Параметры `status`, `iterationId`, `assigneeId`, `search` | Query | 200 `{ items }` |
| `POST /api/projects/:id/tasks` | Создание задачи | `{ title, description?, status?, assignees?, labels?, dates? }` | 201 `{ task }` |
| `PATCH /api/projects/:id/tasks/:taskId` | Обновление задачи | Partial Task | 200 `{ task }` |
| `POST /api/projects/:id/tasks/:taskId/transition` | Смена статуса | `{ toStatus }` | 200 `{ task }` |
| `GET /api/projects/:id/iterations` | Список спринтов | — | 200 `{ items }` |
| `POST /api/projects/:id/iterations` | Создание спринта | `{ title, startAt?, endAt? }` | 201 `{ iteration }` |
| `GET /api/projects/:id/documents` | Документы проекта | — | 200 `{ items }` |
| `POST /api/projects/:id/documents` | Создание документа | `{ title, type, fileId? }` | 201 `{ document }` |
| `POST /api/documents/:id/files` | Загрузка файла/версии | multipart | 201 `{ documentVersion }` |
| `GET /api/files/:id` | Метаданные файла | — | 200 `{ file }` |
| `GET /api/templates` | Каталог шаблонов | — | 200 `{ items }` |
| `POST /api/templates` | Создание кастомного шаблона | `{ title, summary, kind, tasks[] }` | 201 `{ template }` |

API сохраняет обратную совместимость с текущими фронтенд-хэндлерами и добавляет ресурсы для документов/файлов и мультиаккаунта.

## Авторизация и мультиаккаунт

### Текущее состояние

- Dev-режим использует cookie `cv_session` с base64 JSON `{ email, role, issuedAt }` и выставляет её через `withSessionCookie`, а очистка происходит в `logout` handler’е.【F:apps/web/lib/auth/demo-session.ts†L3-L68】【F:apps/web/lib/auth/session-cookie.ts†L1-L34】【F:apps/web/app/api/auth/login/route.ts†L19-L83】
- Роли восстанавливаются из demo-сессии и кэшируются в `localStorage` для контроля навигации и прав (финансы/админка).【F:apps/web/lib/auth/roles.ts†L12-L65】

### Предлагаемый формат

1. **Сессии и токены**
   - Заменить демо-формат на зашифрованный JWT/паспортный токен, подписанный server-side ключом; cookie `cv_session` оставить для совместимости, но payload расширить до `{ userId, activeAccountId, roles, issuedAt }`.
   - В Redis/БД хранить refresh-токены (`sessions`), что позволит отзыв сессий при выходе и переключении аккаунтов.

2. **Мультиаккаунты**
   - Ввести понятие «аккаунта» (workspace/организация). Пользователь хранит список `user_accounts`; переключение аккаунта обновляет `activeAccountId` в сессии и возвращает новый access-token.
   - Эндпоинт `POST /api/auth/switch` валидирует принадлежность пользователя к `accountId`, записывает событие в `sessions` и обновляет cookie.
   - UI может читать список аккаунтов через `GET /api/accounts` и синхронизировать выбор (например, через `localStorage`/Zustand).

3. **Роли и разрешения**
   - Роль пользователя вычисляется как комбинация `org_members.role` и `project_members.role`, мапится на фронтовые `UserRole` для существующих проверок (`canAccessFinance`, `canAccessAdmin`).【F:apps/web/lib/auth/roles.ts†L50-L65】
   - Дополнительно включить в payload пермишены (например, `scopes: ['projects:write', 'documents:read']`), чтобы Sidebar мог скрывать разделы без обращения к API.

4. **Dev-режим**
   - Сохранить `AUTH_DEV` флаг: при `on` backend генерирует фиктивные учётки и session payload по текущей схеме, чтобы не ломать демо-флоу, но внутренне пользоваться тем же интерфейсом `AuthService`.

Такой формат позволит регистрировать пользователей, создавать несколько рабочих пространств и безопасно переключаться между ними, оставаясь совместимыми с текущим фронтенд-UI.
