import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { MenuItem } from '../models/MenuItem.js';

const router = Router();

// Get menu for a date (optional meal filter)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { date, meal } = req.query;
    if (!date) return res.status(400).json({ message: 'Missing date' });
    const q = { date: new Date(date) };
    if (meal) q.meal = meal;
    const items = await MenuItem.find(q).sort({ meal: 1 }).lean();
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch menu' });
  }
});

// Upsert menu for a date+meal (staff/admin)
router.put('/', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const { date, meal, items } = req.body;
    if (!date || !meal || !Array.isArray(items)) return res.status(400).json({ message: 'Missing fields' });
    const doc = await MenuItem.findOneAndUpdate(
      { date: new Date(date), meal },
      { $set: { items } },
      { new: true, upsert: true }
    );
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to save menu' });
  }
});

export default router;










