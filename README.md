# Bible Verse App

A full-stack Bible application with:
- Web reading app
- Mobile app shell
- REST API
- Search capability
- Favorites
- Notes
- Dark mode
- Daily devotionals

## Tech stack
- Web: React + Vite
- Mobile: React Native + Expo
- Server: Express
- Data: local mock data for starter app

## Getting started

1. Install dependencies:

```bash
npm install
npm --workspace apps/server install
npm --workspace apps/web install
npm --workspace apps/mobile install
```

2. Start the API:

```bash
npm run dev:server
```

3. Start the web app:

```bash
npm run dev:web
```

4. Start the mobile app:

```bash
npm run dev:mobile
```

## App features
- Bible reading
- Search by book or keyword
- Save favorites
- Write notes
- Dark mode toggle
- Daily devotionals

## Project structure
- `apps/server` — API layer
- `apps/web` — browser app
- `apps/mobile` — mobile app

## Notes
This is a starter project designed to be extended with real Bible translation data, persistent storage, and authentication.
