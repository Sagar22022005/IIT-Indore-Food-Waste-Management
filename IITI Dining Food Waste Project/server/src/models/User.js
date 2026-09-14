import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MESS_OPTIONS } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'staff', 'admin'], default: 'student' },
    mess: { type: String, enum: [...MESS_OPTIONS, null], default: null },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date }
  },
  { timestamps: true }
);

userSchema.methods.verifyPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);




