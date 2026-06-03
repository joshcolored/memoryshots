import express from 'express';
import { body, param, query } from 'express-validator';
import { handleMulter } from '../middleware/upload.js';
import { requireGuest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createGuestbookMessage,
  getEventBySlug,
  getGuestSession,
  getPhotoImage,
  joinEvent,
  listPublicGallery,
  proxyImage,
  uploadGuestPhoto
} from '../controllers/publicController.js';

const router = express.Router();

router.get('/photos/:id/image', param('id').isMongoId(), validate, getPhotoImage);
router.get('/image-proxy', query('url').isURL({ protocols: ['http', 'https'], require_protocol: true }), validate, proxyImage);
router.get('/events/:slug', param('slug').isSlug(), validate, getEventBySlug);
router.post('/events/:slug/join', param('slug').isSlug(), body('name').trim().isLength({ min: 1, max: 80 }), validate, joinEvent);
router.get('/events/:slug/session', param('slug').isSlug(), validate, requireGuest, getGuestSession);
router.post('/events/:slug/photos', param('slug').isSlug(), validate, requireGuest, handleMulter, uploadGuestPhoto);
router.get(
  '/events/:slug/gallery',
  param('slug').isSlug(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validate,
  listPublicGallery
);
router.post('/events/:slug/guestbook', param('slug').isSlug(), body('message').trim().isLength({ min: 1, max: 500 }), validate, requireGuest, createGuestbookMessage);

export default router;
