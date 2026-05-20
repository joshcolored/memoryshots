import bcrypt from 'bcryptjs';
import { asyncHandler } from '../utils/asyncHandler.js';
import { issueToken } from '../middleware/auth.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
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
