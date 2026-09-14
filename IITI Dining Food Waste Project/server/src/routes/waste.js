import { Router } from 'express';
import { WasteLog } from '../models/WasteLog.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Create waste log (staff)
router.post('/', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const { date, meal, itemName, quantityPreparedKg, wasteKg, dryWasteKg, wetWasteKg } = req.body;
    if (!date || !meal || !itemName) return res.status(400).json({ message: 'Missing fields' });
    const log = await WasteLog.create({
      date: new Date(date),
      meal,
      itemName,
      quantityPreparedKg,
      wasteKg,
      dryWasteKg: dryWasteKg || 0,
      wetWasteKg: wetWasteKg || 0,
      createdBy: req.user.id
    });
    return res.status(201).json(log);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create waste log' });
  }
});

// List waste logs (staff/admin)
router.get('/', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const { from, to, meal } = req.query;
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
    const logs = await WasteLog.find(query).sort({ date: -1, createdAt: -1 }).lean();
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch waste logs' });
  }
});

// Update a waste log (staff/admin)
router.patch('/:id', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const update = {};
    const { date, meal, itemName, quantityPreparedKg, wasteKg, dryWasteKg, wetWasteKg } = req.body;
    if (date) update.date = new Date(date);
    if (meal) update.meal = meal;
    if (itemName) update.itemName = itemName;
    if (quantityPreparedKg !== undefined) update.quantityPreparedKg = quantityPreparedKg;
    if (wasteKg !== undefined) update.wasteKg = wasteKg;
    if (dryWasteKg !== undefined) update.dryWasteKg = dryWasteKg;
    if (wetWasteKg !== undefined) update.wetWasteKg = wetWasteKg;
    const doc = await WasteLog.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update waste log' });
  }
});

// Delete a waste log (staff/admin)
router.delete('/:id', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const result = await WasteLog.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Not found' });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete waste log' });
  }
});

export default router;



