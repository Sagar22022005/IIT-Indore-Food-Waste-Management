import { Router } from 'express';
import ExcelJS from 'exceljs';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { WasteLog } from '../models/WasteLog.js';
import { Feedback } from '../models/Feedback.js';

const router = Router();

function setCommonWorkbookProps(workbook) {
  workbook.creator = 'Smart Food Waste System';
  workbook.created = new Date();
}

router.get('/waste.xlsx', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const { from, to, meal } = req.query;
    const query = {};
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    if (meal) query.meal = meal;

    const logs = await WasteLog.find(query).sort({ date: 1 }).lean();

    const workbook = new ExcelJS.Workbook();
    setCommonWorkbookProps(workbook);
    const sheet = workbook.addWorksheet('Waste Logs');
    sheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Meal', key: 'meal', width: 12 },
      { header: 'Item Name', key: 'itemName', width: 24 },
      { header: 'Prepared (kg)', key: 'quantityPreparedKg', width: 16 },
      { header: 'Waste (kg)', key: 'wasteKg', width: 12 }
    ];
    logs.forEach((l) => sheet.addRow({
      date: new Date(l.date).toISOString().slice(0, 10),
      meal: l.meal,
      itemName: l.itemName,
      quantityPreparedKg: l.quantityPreparedKg,
      wasteKg: l.wasteKg
    }));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="waste.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    return res.status(500).json({ message: 'Failed to export waste logs' });
  }
});

router.get('/feedback.xlsx', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
  try {
    const { from, to, meal } = req.query;
    const query = {};
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    if (meal) query.meal = meal;
    const list = await Feedback.find(query).sort({ date: 1 }).lean();

    const workbook = new ExcelJS.Workbook();
    setCommonWorkbookProps(workbook);
    const sheet = workbook.addWorksheet('Feedback');
    sheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Meal', key: 'meal', width: 12 },
      { header: 'Rating', key: 'rating', width: 10 },
      { header: 'Taste', key: 'taste', width: 10 },
      { header: 'Hygiene', key: 'hygiene', width: 10 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Service', key: 'service', width: 10 },
      { header: 'Anonymous', key: 'isAnonymous', width: 10 },
      { header: 'Comments', key: 'comments', width: 40 }
    ];
    list.forEach((f) => sheet.addRow({
      date: new Date(f.date).toISOString().slice(0, 10),
      meal: f.meal,
      rating: f.rating,
      taste: f.ratings?.taste ?? '',
      hygiene: f.ratings?.hygiene ?? '',
      quantity: f.ratings?.quantity ?? '',
      service: f.ratings?.service ?? '',
      isAnonymous: f.isAnonymous ? 'Yes' : 'No',
      comments: f.comments || ''
    }));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="feedback.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    return res.status(500).json({ message: 'Failed to export feedback' });
  }
});

export default router;










