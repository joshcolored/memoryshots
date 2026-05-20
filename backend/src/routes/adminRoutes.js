import express from 'express';
import { body, param } from 'express-validator';
import { login, logout, register } from '../controllers/authController.js';
import {
  createEvent,
  deleteEvent,
  deletePhoto,
  downloadEventZip,
  getEvent,
  listEvents,
  listGuests,
  listPhotos,
  updateEvent,
  updatePhotoStatus
} from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const eventValidation = [
  body('title').trim().isLength({ min: 2, max: 120 }),
  body('event_type').isIn(['Wedding', 'Christening', 'Birthday', 'Corporate', 'Anniversary', 'Custom']),
  body('photo_limit').isInt({ min: 1, max: 16 }),
  body('cover_image').optional({ checkFalsy: true }).isURL(),
  body('event_date').isISO8601(),
  body('is_active').isBoolean(),
  body('watermark_enabled').optional().isBoolean(),
  body('guestbook_enabled').optional().isBoolean()
];

router.post(
  '/register',
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  validate,
  register
);
router.post('/login', body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 1 }), validate, login);
router.post('/logout', requireAdmin, logout);

router.use(requireAdmin);

router.get('/events', listEvents);
router.post('/events', eventValidation, validate, createEvent);
router.get('/events/:id', param('id').isMongoId(), validate, getEvent);
router.put('/events/:id', param('id').isMongoId(), eventValidation, validate, updateEvent);
router.delete('/events/:id', param('id').isMongoId(), validate, deleteEvent);
router.get('/events/:id/guests', param('id').isMongoId(), validate, listGuests);
router.get('/events/:id/photos', param('id').isMongoId(), validate, listPhotos);
router.get('/events/:id/photos.zip', param('id').isMongoId(), validate, downloadEventZip);

router.patch('/photos/:id/status', param('id').isMongoId(), body('status').isIn(['pending', 'approved', 'hidden']), validate, updatePhotoStatus);
router.delete('/photos/:id', param('id').isMongoId(), validate, deletePhoto);

export default router;
