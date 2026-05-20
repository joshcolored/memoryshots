import express from 'express';
import { body, param } from 'express-validator';
import { handleMulter } from '../middleware/upload.js';
import { requireGuest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createGuestbookMessage,
  getEventBySlug,
  getPhotoImage,
  joinEvent,
  listPublicGallery,
  uploadGuestPhoto
} from '../controllers/publicController.js';

const router = express.Router();

router.get('/photos/:id/image', param('id').isMongoId(), validate, getPhotoImage);
router.get('/events/:slug', param('slug').isSlug(), validate, getEventBySlug);
router.post('/events/:slug/join', param('slug').isSlug(), body('name').trim().isLength({ min: 1, max: 80 }), validate, joinEvent);
router.post('/events/:slug/photos', param('slug').isSlug(), validate, requireGuest, handleMulter, uploadGuestPhoto);
router.get('/events/:slug/gallery', param('slug').isSlug(), validate, listPublicGallery);
router.post('/events/:slug/guestbook', param('slug').isSlug(), body('message').trim().isLength({ min: 1, max: 500 }), validate, requireGuest, createGuestbookMessage);

export default router;
