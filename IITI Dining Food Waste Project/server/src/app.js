import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import wasteRoutes from './routes/waste.js';
import ticketRoutes from './routes/tickets.js';
import feedbackRoutes from './routes/feedback.js';
import reportRoutes from './routes/reports.js';
import menuRoutes from './routes/menu.js';
import uploadRoutes from './routes/uploads.js';
import reportExportRoutes from './routes/reportExports.js';
import adminRoutes from './routes/admin.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/reports/export', reportExportRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

export default app;


