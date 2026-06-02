# Venue — приложение для бронирования переговорных

Краткая инструкция — ничего лишнего.

Быстрый старт

1) Установить зависимости:

```bash
npm install --legacy-peer-deps
```

2) Опционально: запустить локальный mock-API (json-server):

```bash
npm run mock-api
# http://localhost:3000
```

3) Запустить dev-сервер:

```bash
npm run start
```

4) Unit-тесты (Jest):

```bash
npm test
```

5) E2E (Playwright):

```bash
npx playwright install
npm run e2e
```

Полезные скрипты

- `npm run start` — dev-сервер
- `npm run build` — сборка
- `npm test` — unit-тесты (Jest)
- `npm run e2e` — e2e (Playwright)
- `npm run mock-api` — локальный json-server
- `npm run lint` / `npm run format` — линт и форматирование



