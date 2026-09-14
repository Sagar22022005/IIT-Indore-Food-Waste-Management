import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { Ticket } from '../models/Ticket.js';
import { Feedback } from '../models/Feedback.js';
import { MESS_OPTIONS } from '../utils/constants.js';
import { sendPasswordResetEmail } from '../utils/mail.js';

const router = Router();

function clientBaseUrl(req) {
  const envUrl = process.env.CLIENT_URL;
  if (envUrl) return String(envUrl).replace(/\/$/, '');

  const origin = req?.headers?.origin;
  if (origin) return String(origin).replace(/\/$/, '');

  const proto = req?.headers?.['x-forwarded-proto'] || req?.protocol || 'http';
  const host = (typeof req?.get === 'function' ? req.get('host') : req?.headers?.host) || '';
  if (host) return `${proto}://${host}`.replace(/\/$/, '');

  return 'http://localhost:5173';
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, mess } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    if (role === 'staff' && (!mess || !MESS_OPTIONS.includes(mess))) {
      return res.status(400).json({ message: 'Staff must select a valid mess' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already in use' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: role || 'student', mess: role === 'staff' ? mess : null });
    return res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, mess: user.mess });
  } catch (err) {
    return res.status(500).json({ message: 'Signup failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.verifyPassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ sub: String(user._id), role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, mess: user.mess } });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed' });
  }
});

// Always respond the same to avoid email enumeration
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email required' });
    }
    const normalized = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalized });
    const generic = { message: 'If an account exists for that email, a reset link has been sent.' };

    if (!user) {
      return res.json(generic);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    user.passwordResetToken = token;
    user.passwordResetExpires = expires;
    await user.save();

    const resetUrl = `${clientBaseUrl(req)}/reset-password?token=${encodeURIComponent(token)}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    return res.json(generic);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('forgot-password', err);
    return res.status(500).json({ message: 'Could not process request' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Valid token and password (min 6 characters) required' });
    }
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }
    user.passwordHash = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return res.json({ message: 'Password updated. You can log in now.' });
  } catch (err) {
    return res.status(500).json({ message: 'Could not reset password' });
  }
});

router.delete('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    await Promise.all([
      Ticket.deleteMany({ student: userId }),
      Feedback.deleteMany({ student: userId }),
    ]);
    await User.findByIdAndDelete(userId);
    return res.json({ message: 'Account deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete account' });
  }
});

export default router;
