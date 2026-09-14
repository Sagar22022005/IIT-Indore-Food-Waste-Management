import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Ticket } from '../models/Ticket.js';
import { MESS_OPTIONS } from '../utils/constants.js';

const router = Router();

// Create ticket (student)
router.post('/', requireAuth, requireRole('student', 'staff', 'admin'), async (req, res) => {
  try {
    const { category, description, imageUrl, mess } = req.body;
    if (!category || !description || !mess) return res.status(400).json({ message: 'Missing fields' });
    if (!MESS_OPTIONS.includes(mess)) return res.status(400).json({ message: 'Invalid mess option' });
    const ticket = await Ticket.create({ student: req.user.id, category, description, imageUrl, mess });
    return res.status(201).json(ticket);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create ticket' });
  }
});

// My tickets (student)
router.get('/mine', requireAuth, requireRole('student', 'staff', 'admin'), async (req, res) => {
  try {
    const tickets = await Ticket.find({ student: req.user.id }).sort({ createdAt: -1 }).lean();
    return res.json(tickets);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch tickets' });
  }
});

// All tickets (staff/admin)
router.get('/', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'staff') {
      if (!req.user.mess) return res.status(400).json({ message: 'Staff mess assignment missing' });
      query.mess = req.user.mess;
    }
    const tickets = await Ticket.find(query).sort({ createdAt: -1 }).lean();
    return res.json(tickets);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch tickets' });
  }
});

// Update status (staff/admin)
router.patch('/:id/status', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Missing status' });
    const updated = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update status' });
  }
});

export default router;







