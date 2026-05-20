import jwt from 'jsonwebtoken';
import Event from '../models/Event.js';
import Guest from '../models/Guest.js';

export function issueToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

export function requireAdmin(req, _res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    const error = new Error('Admin token is required');
    error.status = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') throw new Error('Invalid admin token');
    req.admin = decoded;
    next();
  } catch {
    const error = new Error('Invalid or expired admin token');
    error.status = 401;
    next(error);
  }
}

export async function requireGuest(req, _res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.body.session_token;
  if (!token) {
    const error = new Error('Guest session token is required');
    error.status = 401;
    return next(error);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'guest') throw new Error('Invalid guest token');

    const [guest, event] = await Promise.all([
      Guest.findById(decoded.guest_id),
      Event.findById(decoded.event_id)
    ]);

    if (!guest || !event || String(guest.event_id) !== String(event._id)) {
      const error = new Error('Guest session is no longer valid');
      error.status = 401;
      return next(error);
    }

    if (!event.is_active) {
      const error = new Error('This event is not accepting photos right now');
      error.status = 403;
      return next(error);
    }

    req.guest = guest;
    req.event = event;
    next();
  } catch (error) {
    if (!error.status) {
      error = new Error('Invalid or expired guest token');
      error.status = 401;
    }
    next(error);
  }
}
