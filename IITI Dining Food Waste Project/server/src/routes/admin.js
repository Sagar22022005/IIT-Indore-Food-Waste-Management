import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { MESS_OPTIONS } from '../utils/constants.js';

const router = Router();

// List users (admin)
router.get('/users', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).lean();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to list users' });
  }
});

// Update user role (admin)
router.patch('/users/:id/role', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { role, mess } = req.body;
    const update = {};
    if (role) {
      if (!['student', 'staff', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
      update.role = role;
      if (role !== 'staff') {
        update.mess = null;
      }
    }
    if (mess !== undefined) {
      if (mess && !MESS_OPTIONS.includes(mess)) return res.status(400).json({ message: 'Invalid mess option' });
      update.mess = mess || null;
    }
    if (!Object.keys(update).length) return res.status(400).json({ message: 'No updates provided' });
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, projection: { passwordHash: 0 } }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update user' });
  }
});

export default router;






