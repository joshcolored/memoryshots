# MemoryShots

Full-stack QR event photo sharing app for weddings, christenings, birthdays, corporate events, anniversaries, and private celebrations.

## What Is Included

- `backend`: Express REST API with MongoDB, GridFS photo storage, JWT admin auth, JWT guest sessions, upload validation, admin moderation, ZIP download, guestbook messages, and Socket.IO gallery refresh events.
- `frontend`: Next.js App Router with TypeScript, Tailwind CSS, Framer Motion, QR generation, guest camera capture, gallery uploads, public gallery, slideshow mode, and admin dashboard.

The original requirements mention Laravel Sanctum for admin authentication, but this project is intentionally Express-only. The backend uses JWT auth instead, which matches the requested Node/Express API architecture.

## Project Structure

```txt
memoryshots/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
      utils/
  frontend/
    app/
    components/
    lib/
    types/
```

## MongoDB Setup

### Option A: Free MongoDB Atlas

1. Go to `https://www.mongodb.com/atlas/database`.
2. Create a free `M0` cluster.
3. Create a database user and password.
4. Add your IP address in Network Access. For Render, add `0.0.0.0/0` if you need broad hosted access.
5. Copy the connection string.
6. Use a database name like `memoryshots`.

Example:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/memoryshots?retryWrites=true&w=majority
```

Photos are stored in MongoDB GridFS using the `eventPhotos.files` and `eventPhotos.chunks` collections. Metadata lives in `events`, `guests`, `photos`, and `guestbookmessages`.

### Option B: Local MongoDB

1. Install MongoDB Community Server.
2. Start MongoDB locally.
3. Use:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/memoryshots
```

## Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/memoryshots
JWT_SECRET=use-a-long-random-secret
ADMIN_EMAIL=admin@memoryshots.local
ADMIN_PASSWORD=change-this-password
FRONTEND_URL=http://localhost:3000
PUBLIC_API_URL=http://localhost:5000
```

Admin login is controlled by `ADMIN_EMAIL` and `ADMIN_PASSWORD`. For production, use a long password and a long random `JWT_SECRET`.

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Open `http://localhost:3000`.

## Requested Build Order

1. ExpressJS backend setup: `backend/package.json`, `src/server.js`
2. MongoDB setup: `src/config/db.js`
3. MongoDB integration: Mongoose models in `src/models`
4. MongoDB Storage upload: GridFS service in `src/services/storageService.js`
5. ExpressJS API routes: `src/routes/publicRoutes.js`, `src/routes/adminRoutes.js`
6. JWT authentication: `src/middleware/auth.js`
7. Next.js frontend setup: `frontend/app`, Tailwind, TypeScript config
8. Guest pages: `/event/[slug]`
9. Admin dashboard: `/admin/login`, `/admin/dashboard`, `/admin/events`, `/admin/events/create`, `/admin/events/[id]`
10. QR code generation: `components/admin/QRCodePanel.tsx`
11. Camera capture: `components/guest/CameraCapture.tsx`
12. Gallery: `/event/[slug]/gallery`, `components/gallery/GalleryGrid.tsx`
13. Final polishing: responsive styling, toasts, loading states, slideshow, ZIP download

## API Routes

Public:

- `POST /api/events/:slug/join`
- `GET /api/events/:slug`
- `POST /api/events/:slug/photos`
- `GET /api/events/:slug/gallery`
- `POST /api/events/:slug/guestbook`
- `GET /api/photos/:id/image`

Admin:

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/events`
- `POST /api/admin/events`
- `GET /api/admin/events/:id`
- `PUT /api/admin/events/:id`
- `DELETE /api/admin/events/:id`
- `GET /api/admin/events/:id/guests`
- `GET /api/admin/events/:id/photos`
- `GET /api/admin/events/:id/photos.zip`
- `PATCH /api/admin/photos/:id/status`
- `DELETE /api/admin/photos/:id`

## Deployment

### Render Backend

1. Create a new Web Service.
2. Root directory: `backend`.
3. Build command: `npm install`.
4. Start command: `npm start`.
5. Add environment variables from `backend/.env.example`.
6. Set `FRONTEND_URL` to your Vercel domain.
7. Set `PUBLIC_API_URL` to your Render service URL.

### Vercel Frontend

1. Import the repo in Vercel.
2. Root directory: `frontend`.
3. Add:

```env
NEXT_PUBLIC_API_URL=https://your-render-api.onrender.com
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
```

4. Deploy.

## Photo Rules

- Allowed: jpg, jpeg, png, webp.
- Max size: 5MB.
- Guest upload requires a valid JWT session token.
- Backend validates event status, guest ownership, and photo limit.
- Stored path format: `events/{event_slug}/{guest_id}/{filename}`.
