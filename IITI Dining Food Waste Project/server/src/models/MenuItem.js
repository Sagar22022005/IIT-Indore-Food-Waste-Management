import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    meal: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
    items: [{
      name: { type: String, required: true },
      description: { type: String },
      price: { type: Number },
      imageUrl: { type: String }
    }]
  },
  { timestamps: true }
);

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);

