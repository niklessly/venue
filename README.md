# Venue — бронирование переговорных комнат

Angular 21 приложение для просмотра переговорных, фильтрации по параметрам, создания и управления бронированиями, администрирования комнат и просмотра статистики загрузки.

## Стек

- Angular 21, TypeScript, standalone components, lazy routes
- Angular Signals как state layer
- Taiga UI 4
- Mock API на `json-server`
- Jest unit tests
- Playwright e2e tests
- ESLint, Prettier, Stylelint
- GitHub Actions CI и Vercel deploy workflow

## Возможности

- Авторизация, logout, хранение токена в `localStorage`
- Защищенные маршруты и admin guard
- Список комнат, детали комнаты, расписание активных бронирований
- Поиск, фильтрация по вместимости/оборудованию/доступности, сортировка
- Создание, редактирование, перенос, отмена и удаление бронирований
- Проверка конфликтов по времени
- Повторяющиеся бронирования: daily/weekly
- CRUD комнат в админке
- Разделение данных по `companyId`
- Статистика и ближайшие уведомления
- Fallback на локальные demo-данные, если mock API не запущен

## Быстрый старт

```bash
npm install --legacy-peer-deps
npm run mock-api
npm run start
```

Приложение: `http://localhost:4200`

Mock API: `http://localhost:3000`

Если `json-server` не запущен, приложение продолжит работать на встроенных demo-данных и покажет предупреждение в интерфейсе.

## Тестовые пользователи

- Сотрудник: `mila@venue.local`
- Администратор: любой email с `admin`, например `admin@venue.local`
- Пользователь другой компании: `partner@venue.local`

Пароль в прототипе любой непустой, например `demo-password`.

## Скрипты

```bash
npm run start      # Angular dev server
npm run mock-api   # json-server на mock-api/db.json
npm run build      # production build
npm test           # Jest unit tests
npm run e2e        # Playwright e2e, dev server стартует автоматически
npm run lint       # ESLint + Stylelint
npm run format     # Prettier
```

## CI/CD

CI workflow: `.github/workflows/ci.yml`

Pipeline выполняет:

- install
- lint
- unit tests
- production build
- Playwright Chromium install
- e2e tests

Deploy workflow: `.github/workflows/deploy-vercel.yml`

Для деплоя в Vercel нужны repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Vercel build настроен в `vercel.json`.

## Public URL

```text
https://venue-rouge.vercel.app/
```
