import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { WasteLog } from '../models/WasteLog.js';

const router = Router();

// Weekly waste by day (sum of wasteKg)
router.get('/weekly', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const data = await WasteLog.aggregate([
      { $match: { date: { $gte: start, $lte: now } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, totalWasteKg: { $sum: '$wasteKg' } } },
      { $sort: { _id: 1 } }
    ]);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to compute weekly report' });
  }
});

// Monthly totals by itemName
router.get('/monthly-top-wasted', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const data = await WasteLog.aggregate([
      { $match: { date: { $gte: start, $lte: now } } },
      { $group: { _id: '$itemName', totalWasteKg: { $sum: '$wasteKg' } } },
      { $sort: { totalWasteKg: -1 } },
      { $limit: 10 }
    ]);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to compute top wasted items' });
  }
});

export default router;











