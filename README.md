# Venue Booking App

Minimal Angular prototype for booking meeting rooms. Includes mock data, basic auth flow, state management via Angular Signals, and tests.

Quick start

1. Install dependencies:

```bash
npm install --legacy-peer-deps
```

2. Run development server:

```bash
npm run start
```

3. Run unit tests (Jest):

```bash
npm test
```

4. Run e2e tests (Playwright):

```bash
npx playwright install
npm run e2e
```

Lint & format

```bash
npm run lint
npm run format
```

Notes

- This project uses Taiga UI for styling (basic import added). Install with `npm install` before running.
- Playwright e2e tests assume the dev server is running at `http://localhost:4200`.

Deployment (Vercel)

1. Create a project on Vercel and link it to this repository.
2. Create the following repository secrets in GitHub (Settings → Secrets → Actions):
	- `VERCEL_TOKEN` — your Vercel personal token
	- `VERCEL_ORG_ID` — Vercel organization ID
	- `VERCEL_PROJECT_ID` — Vercel project ID
3. The workflow `.github/workflows/deploy-vercel.yml` will build and deploy on push to `main`/`master`.

After the first deploy, add the public URL returned by Vercel into this README under "Public URL".

# Venue Booking App

Prototype of a meeting room booking app for the Angular semester project.

## Stack direction

- Angular 21
- TypeScript
- Taiga UI 4 visual language
- Signal-based state in a local prototype store

## Screens

- Login
- Home with room list and filters
- Room details
- Booking dialog/page
- My bookings
- Statistics
- Admin room editor

## Design language

The UI uses the pink and yellow palette from the provided mockup:

- pink sidebar and booking dialog
- pale yellow filter strip
- gray room cards
- yellow primary booking button

## Run locally

1. Install dependencies.
2. Run `npm start`.
3. Open the local Angular dev server.

## Notes

This repository currently contains the initial implementation layer based on the simplified prototype. It is ready for wiring to a real mock API, tests, and deployment later.
