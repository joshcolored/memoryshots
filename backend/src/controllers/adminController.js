import archiver from 'archiver';
import Event from '../models/Event.js';
import Guest from '../models/Guest.js';
import Photo from '../models/Photo.js';
import GuestbookMessage from '../models/GuestbookMessage.js';
import { getGridBucket } from '../config/gridfs.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/slugify.js';
import { deleteStoredPhoto } from '../services/storageService.js';

function eventPayload(body) {
  return {
    title: body.title,
    slug: body.slug ? slugify(body.slug) : slugify(body.title),
    event_type: body.event_type,
    photo_limit: Number(body.photo_limit || 24),
    cover_image: body.cover_image || '',
    event_date: body.event_date,
    is_active: Boolean(body.is_active),
    watermark_enabled: Boolean(body.watermark_enabled),
    guestbook_enabled: body.guestbook_enabled !== false
  };
}

function adminEventScope(req) {
  return req.admin.admin_id ? { admin_id: req.admin.admin_id } : {};
}

async function findAdminEvent(req, eventId) {
  const event = await Event.findOne({ _id: eventId, ...adminEventScope(req) });
  if (!event) {
    const error = new Error('Event not found');
    error.status = 404;
    throw error;
  }
  return event;
}

async function findAdminPhoto(req, photoId) {
  const photo = await Photo.findById(photoId);
  if (!photo) {
    const error = new Error('Photo not found');
    error.status = 404;
    throw error;
  }

  await findAdminEvent(req, photo.event_id);
  return photo;
}

export const listEvents = asyncHandler(async (req, res) => {
  const events = await Event.find(adminEventScope(req)).sort({ event_date: -1 }).lean();
  const eventIds = events.map((event) => event._id);
  const [guestCounts, photoCounts] = await Promise.all([
    Guest.aggregate([{ $match: { event_id: { $in: eventIds } } }, { $group: { _id: '$event_id', total: { $sum: 1 } } }]),
    Photo.aggregate([{ $match: { event_id: { $in: eventIds } } }, { $group: { _id: '$event_id', total: { $sum: 1 } } }])
  ]);

  const guestsByEvent = new Map(guestCounts.map((item) => [String(item._id), item.total]));
  const photosByEvent = new Map(photoCounts.map((item) => [String(item._id), item.total]));

  res.json({
    data: events.map((event) => ({
      ...event,
      guest_total: guestsByEvent.get(String(event._id)) || 0,
      photo_total: photosByEvent.get(String(event._id)) || 0
    }))
  });
});

export const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({
    ...eventPayload(req.body),
    admin_id: req.admin.admin_id || null
  });
  res.status(201).json({ data: event });
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await findAdminEvent(req, req.params.id);

  const [guest_total, photo_total, approved_total, pending_total] = await Promise.all([
    Guest.countDocuments({ event_id: event._id }),
    Photo.countDocuments({ event_id: event._id }),
    Photo.countDocuments({ event_id: event._id, status: 'approved' }),
    Photo.countDocuments({ event_id: event._id, status: 'pending' })
  ]);

  res.json({ data: event, stats: { guest_total, photo_total, approved_total, pending_total } });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findOneAndUpdate({ _id: req.params.id, ...adminEventScope(req) }, eventPayload(req.body), {
    new: true,
    runValidators: true
  });
  if (!event) {
    const error = new Error('Event not found');
    error.status = 404;
    throw error;
  }
  res.json({ data: event });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await findAdminEvent(req, req.params.id);

  const photos = await Photo.find({ event_id: event._id });
  await Promise.allSettled(photos.map((photo) => deleteStoredPhoto(photo.storage_file_id)));
  await Promise.all([
    Photo.deleteMany({ event_id: event._id }),
    Guest.deleteMany({ event_id: event._id }),
    GuestbookMessage.deleteMany({ event_id: event._id }),
    event.deleteOne()
  ]);

  res.json({ message: 'Event deleted' });
});

export const listGuests = asyncHandler(async (req, res) => {
  await findAdminEvent(req, req.params.id);
  const guests = await Guest.find({ event_id: req.params.id }).sort({ created_at: -1 });
  res.json({ data: guests });
});

export const listPhotos = asyncHandler(async (req, res) => {
  await findAdminEvent(req, req.params.id);
  const query = { event_id: req.params.id };
  if (req.query.guest_id) query.guest_id = req.query.guest_id;

  const photos = await Photo.find(query)
    .sort({ created_at: -1 })
    .populate('guest_id', 'name photo_count')
    .lean();
  res.json({ data: photos });
});

export const updatePhotoStatus = asyncHandler(async (req, res) => {
  const existingPhoto = await findAdminPhoto(req, req.params.id);
  const event = await Event.findById(existingPhoto.event_id);
  const photo = await Photo.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });

  if (event) {
    req.app.get('io').to(`event:${event.slug}`).emit('photo:updated', {
      event: event.slug,
      photo_id: photo._id,
      status: photo.status
    });
  }

  res.json({ data: photo });
});

export const deletePhoto = asyncHandler(async (req, res) => {
  const photo = await findAdminPhoto(req, req.params.id);
  const event = await Event.findById(photo.event_id);

  await Promise.allSettled([
    deleteStoredPhoto(photo.storage_file_id),
    Guest.findByIdAndUpdate(photo.guest_id, { $inc: { photo_count: -1 } })
  ]);
  await photo.deleteOne();

  if (event) {
    req.app.get('io').to(`event:${event.slug}`).emit('photo:deleted', {
      event: event.slug,
      photo_id: photo._id
    });
  }

  res.json({ message: 'Photo deleted' });
});

export const downloadEventZip = asyncHandler(async (req, res) => {
  const event = await findAdminEvent(req, req.params.id);

  const photos = await Photo.find({ event_id: event._id }).populate('guest_id', 'name');
  const bucket = getGridBucket();
  const archive = archiver('zip', { zlib: { level: 9 } });

  res.attachment(`${event.slug}-photos.zip`);
  archive.pipe(res);

  photos.forEach((photo, index) => {
    const guestName = photo.guest_id?.name?.replace(/[^a-z0-9_-]+/gi, '-') || 'guest';
    const name = `${guestName}/${index + 1}-${photo.original_filename || `${photo._id}.jpg`}`;
    archive.append(bucket.openDownloadStream(photo.storage_file_id), { name });
  });

  await archive.finalize();
});
