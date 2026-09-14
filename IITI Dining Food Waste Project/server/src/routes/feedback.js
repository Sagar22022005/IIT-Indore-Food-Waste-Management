import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Feedback } from '../models/Feedback.js';
import { MESS_OPTIONS } from '../utils/constants.js';

const router = Router();

// Submit feedback (student; anonymous supported)
router.post('/', requireAuth, requireRole('student', 'staff', 'admin'), async (req, res) => {
  try {
    const { date, meal, rating, ratings, comments, isAnonymous, mess } = req.body;
    if (!date || !meal || !rating || !mess) return res.status(400).json({ message: 'Missing fields' });
    if (!MESS_OPTIONS.includes(mess)) return res.status(400).json({ message: 'Invalid mess option' });
    const feedback = await Feedback.create({
      student: isAnonymous ? undefined : req.user.id,
      isAnonymous: Boolean(isAnonymous),
      date: new Date(date),
      meal,
      rating,
      ratings,
      comments,
      mess
    });
    return res.status(201).json(feedback);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to submit feedback' });
  }
});

// List feedback (staff/admin)
router.get('/', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const { from, to, meal, mess } = req.query;
    const query = {};
    if (from || to) {
      query.date = {};
      if (from) {
        const f = new Date(from);
        f.setHours(0, 0, 0, 0);
        query.date.$gte = f;
      }
      if (to) {
        const t = new Date(to);
        t.setHours(23, 59, 59, 999);
        query.date.$lte = t;
      }
    }
    if (meal) query.meal = meal;
    if (req.user.role === 'staff') {
      if (!req.user.mess) return res.status(400).json({ message: 'Staff mess assignment missing' });
      query.mess = req.user.mess;
    } else if (mess && MESS_OPTIONS.includes(mess)) {
      query.mess = mess;
    }
    const list = await Feedback.find(query).sort({ createdAt: -1 }).lean();
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch feedback' });
  }
});

// Delete feedback (staff/admin)
router.delete('/:id', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const result = await Feedback.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Not found' });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete feedback' });
  }
});

export default router;



