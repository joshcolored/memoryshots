# MemoryShots Backend

Express API for MemoryShots.

## Commands

```bash
npm install
npm run dev
npm start
```

## Notes

- Uses MongoDB GridFS for binary photo storage.
- Uses JWT for admin and guest sessions.
- Admin credentials come from environment variables.
- Guest photos start as `pending`; admins approve them for public gallery visibility.
