import 'dotenv/config';
import http from 'node:http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import { connectDatabase } from './config/db.js';
import { attachGridBucket } from './config/gridfs.js';
import { configureCloudinary } from './config/cloudinary.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();
const server = http.createServer(app);

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const io = new Server(server, {
  cors: { origin: frontendUrl, methods: ['GET', 'POST', 'PATCH', 'DELETE'] }
});

app.set('io', io);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'memoryshots-api' });
});

app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

io.on('connection', (socket) => {
  socket.on('join-event', (slug) => {
    if (slug) socket.join(`event:${slug}`);
  });
});

const port = process.env.PORT || 5000;

configureCloudinary();

connectDatabase()
  .then(() => attachGridBucket())
  .then(() => {
    server.listen(port, () => {
      console.log(`MemoryShots API running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start API', error);
    process.exit(1);
  });
