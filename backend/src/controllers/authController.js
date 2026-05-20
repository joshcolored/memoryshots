import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { issueToken } from '../middleware/auth.js';

function adminResponse(admin) {
  return { id: admin._id, name: admin.name, email: admin.email };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    const error = new Error('An admin with this email already exists');
    error.status = 409;
    throw error;
  }

  const admin = await Admin.create({
    name,
    email,
    password_hash: await bcrypt.hash(password, 12)
  });

  const token = issueToken({ role: 'admin', admin_id: admin._id, email: admin.email, name: admin.name }, '12h');
  res.status(201).json({ token, admin: adminResponse(admin) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (admin && await bcrypt.compare(password, admin.password_hash)) {
    const token = issueToken({ role: 'admin', admin_id: admin._id, email: admin.email, name: admin.name }, '12h');
    return res.json({ token, admin: adminResponse(admin) });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const passwordMatches = adminPassword?.startsWith('$2')
    ? await bcrypt.compare(password, adminPassword)
    : password === adminPassword;

  if (email !== adminEmail || !passwordMatches) {
    const error = new Error('Invalid admin credentials');
    error.status = 401;
    throw error;
  }

  const token = issueToken({ role: 'admin', email }, '12h');
  res.json({ token, admin: { email } });
});

export const logout = asyncHandler(async (_req, res) => {
  res.json({ message: 'Logged out' });
});
