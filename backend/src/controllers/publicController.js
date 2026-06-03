import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Guest from '../models/Guest.js';
import Photo from '../models/Photo.js';
import GuestbookMessage from '../models/GuestbookMessage.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { issueToken } from '../middleware/auth.js';
import { storePhoto, streamPhotoById } from '../services/storageService.js';

function publicEvent(event) {
  return {
    id: event._id,
    title: event.title,
    slug: event.slug,
    event_type: event.event_type,
    photo_limit: event.photo_limit,
    cover_image: event.cover_image,
    event_date: event.event_date,
    is_active: event.is_active,
    guestbook_enabled: event.guestbook_enabled
  };
}

export const getEventBySlug = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ slug: req.params.slug });
  if (!event) {
    const error = new Error('Event not found');
    error.status = 404;
    throw error;
  }
  res.json({ data: publicEvent(event) });
});

export const joinEvent = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ slug: req.params.slug, is_active: true });
  if (!event) {
    const error = new Error('Event is unavailable');
    error.status = 404;
    throw error;
  }

  const guest = await Guest.create({
    event_id: event._id,
    name: req.body.name,
    session_token: 'pending'
  });
  const token = issueToken({ role: 'guest', event_id: event._id, guest_id: guest._id }, '30d');
  guest.session_token = token;
  await guest.save();

  res.status(201).json({
    token,
    guest: { id: guest._id, name: guest.name, photo_count: guest.photo_count },
    event: publicEvent(event),
    remaining: event.photo_limit - guest.photo_count
  });
});

export const getGuestSession = asyncHandler(async (req, res) => {
  if (req.event.slug !== req.params.slug) {
    const error = new Error('Guest session does not belong to this event');
    error.status = 403;
    throw error;
  }

  res.json({
    guest: { id: req.guest._id, name: req.guest.name, photo_count: req.guest.photo_count },
    event: publicEvent(req.event),
    remaining: Math.max(req.event.photo_limit - req.guest.photo_count, 0)
  });
});

export const uploadGuestPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    const error = new Error('Photo file is required');
    error.status = 422;
    throw error;
  }

  const freshGuest = await Guest.findById(req.guest._id);
  if (freshGuest.photo_count >= req.event.photo_limit) {
    const error = new Error(`You used all ${req.event.photo_limit} shots.`);
    error.status = 403;
    throw error;
  }

  const stored = await storePhoto({ file: req.file, event: req.event, guest: freshGuest });
  const photo = await Photo.create({
    event_id: req.event._id,
    guest_id: freshGuest._id,
    image_url: stored.imageUrl,
    storage_path: stored.storagePath,
    storage_file_id: stored.fileId,
    original_filename: req.file.originalname,
    status: 'pending'
  });

  freshGuest.photo_count += 1;
  await freshGuest.save();

  req.app.get('io').to(`event:${req.event.slug}`).emit('photo:new', { event: req.event.slug });

  res.status(201).json({
    data: photo,
    remaining: req.event.photo_limit - freshGuest.photo_count,
    message: 'Photo uploaded for approval'
  });
});

export const listPublicGallery = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ slug: req.params.slug });
  if (!event) {
    const error = new Error('Event not found');
    error.status = 404;
    throw error;
  }

  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);
  const query = { event_id: event._id, status: 'approved' };
  const [photos, total] = await Promise.all([
    Photo.find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('guest_id', 'name')
      .lean(),
    Photo.countDocuments(query)
  ]);

  res.json({
    data: photos,
    event: publicEvent(event),
    meta: {
      page,
      limit,
      total,
      total_pages: Math.max(Math.ceil(total / limit), 1)
    }
  });
});

export const createGuestbookMessage = asyncHandler(async (req, res) => {
  if (!req.event.guestbook_enabled) {
    const error = new Error('Guestbook is disabled for this event');
    error.status = 403;
    throw error;
  }

  const message = await GuestbookMessage.create({
    event_id: req.event._id,
    guest_id: req.guest._id,
    message: req.body.message
  });

  await message.populate('guest_id', 'name');
  req.app.get('io').to(`event:${req.event.slug}`).emit('guestbook:new', {
    event: req.event.slug,
    message
  });

  res.status(201).json({ data: message, message: 'Message saved for review' });
});

export const getPhotoImage = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    const error = new Error('Invalid image id');
    error.status = 400;
    throw error;
  }

  const photo = await Photo.findOne({ storage_file_id: req.params.id });
  if (!photo) {
    const error = new Error('Image not found');
    error.status = 404;
    throw error;
  }

  await streamPhotoById(req.params.id, res);
});

export const proxyImage = asyncHandler(async (req, res) => {
  const targetUrl = new URL(req.query.url);
  if (!['http:', 'https:'].includes(targetUrl.protocol)) {
    const error = new Error('Unsupported image URL');
    error.status = 400;
    throw error;
  }

  const response = await fetch(targetUrl);
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok || !contentType.startsWith('image/')) {
    const error = new Error('Image could not be loaded');
    error.status = 422;
    throw error;
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > 8 * 1024 * 1024) {
    const error = new Error('Image is too large');
    error.status = 413;
    throw error;
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(bytes);
});
