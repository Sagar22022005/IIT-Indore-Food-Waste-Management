import mongoose from 'mongoose';
import { MESS_OPTIONS } from '../utils/constants.js';

const feedbackSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isAnonymous: { type: Boolean, default: false },
    date: { type: Date, required: true },
    meal: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    ratings: {
      taste: { type: Number, min: 1, max: 5 },
      hygiene: { type: Number, min: 1, max: 5 },
      quantity: { type: Number, min: 1, max: 5 },
      service: { type: Number, min: 1, max: 5 }
    },
    comments: { type: String },
    mess: { type: String, enum: MESS_OPTIONS, required: true }
  },
  { timestamps: true }
);

export const Feedback = mongoose.model('Feedback', feedbackSchema);







