# Contributing to Collabverse

## Getting started

- Прочитайте [руководство по настройке](docs/guides/setup.md), чтобы подготовить окружение и переменные.
- Используйте `pnpm verify` перед пушем: команда запускает линт, typecheck, build, тесты, проверку маршрутов и симуляцию Vercel.

## Release checklist

- Полная версия чек-листа: [docs/guides/release-checklist.md](docs/guides/release-checklist.md).
- Перед релизом убедитесь, что:
  - выровнены версии Node.js/pnpm и очищены зависимости;
  - структура маршрутов покрыта `page/layout/loading/error/not-found` и health-endpoint доступен;
  - навигация и доступность проверены e2e-тестами (desktop/mobile меню);
  - error boundaries и состояния загрузки реализованы во всех ключевых сегментах;
  - моки валидируются, внешние запросы удалены из сборочных путей;
  - предупреждения гидрации устранены и добавлены e2e-проверки на `console.error`/`console.warn`;
  - конфигурация Vercel обновлена, `vercel build --prod` проходит без ошибок;
  - прогон `pnpm verify` зелёный, QA имеет чек-лист ручного тестирования и превью Vercel.

## Документация

- Карта документации находится в [docs/README.md](docs/README.md).
- ADR по реализованным решениям находятся в `docs/adr/`.
