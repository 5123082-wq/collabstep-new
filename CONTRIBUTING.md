# Contributing to Collabverse

> **Последнее обновление:** 2025-11-04

## Начало работы

- Прочитайте [руководство по настройке](docs/guides/setup.md), чтобы подготовить окружение и переменные.
- Используйте `pnpm verify` перед пушем: команда запускает линт, typecheck, build, тесты, проверку маршрутов и симуляцию Vercel.
- Требования: Node.js 20, pnpm 9+

## Workflow

1. Создайте feature-ветку от `main`
2. Внесите изменения, следуя существующему стилю кода
3. Запустите `pnpm verify` для проверки всех тестов
4. Создайте Pull Request с описанием изменений

## Release checklist

Полная версия чек-листа: [docs/guides/release-checklist.md](docs/guides/release-checklist.md).

Перед релизом убедитесь, что:
- Выровнены версии Node.js 20 и pnpm 9+
- Структура маршрутов покрыта `page/layout/loading/error/not-found`
- Навигация и доступность проверены e2e-тестами
- Error boundaries реализованы во всех ключевых сегментах
- Конфигурация Vercel обновлена
- Прогон `pnpm verify` проходит успешно

## Документация

- Карта документации: [docs/README.md](docs/README.md)
- Дорожная карта: [docs/PLAN.md](docs/PLAN.md)
- Системный анализ: [docs/system-analysis.md](docs/system-analysis.md)
