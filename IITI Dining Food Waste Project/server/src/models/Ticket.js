import mongoose from 'mongoose';
import { MESS_OPTIONS } from '../utils/constants.js';

const ticketSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, enum: ['quality', 'hygiene', 'service', 'other'], required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    mess: { type: String, enum: MESS_OPTIONS, required: true }
  },
  { timestamps: true }
);

export const Ticket = mongoose.model('Ticket', ticketSchema);







