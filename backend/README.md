# MemoryShots Backend

Express API for MemoryShots.

## Commands

```bash
npm install
npm run dev
npm start
```

## Notes

- Uses Cloudinary for binary photo storage.
- Uses MongoDB for metadata.
- Uses JWT for admin and guest sessions.
- Admin credentials come from environment variables.
- Guest photos start as `pending`; admins approve them for public gallery visibility.
- Upload size is controlled by `MAX_PHOTO_SIZE_MB`, default `5`.
