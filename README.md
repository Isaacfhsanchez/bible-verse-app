# Bible Verse App

A full-stack Bible application with a richer reading experience and more complete app structure.

## Features
- Book and chapter navigation
- Search by keyword or book name
- Saved favorites
- Notes per verse
- Reading history
- Daily devotional content
- Verse of the day
- Dark mode UI on web
- Mobile-ready app with local persistence

## Run locally

```bash
npm install
npm --workspace apps/server install
npm --workspace apps/web install
npm --workspace apps/mobile install
```

```bash
npm run dev:server
npm run dev:web
npm run dev:mobile
```

## Notes
This is a starter app intended to be extended with a real Bible database, authentication, and audio/media features.
