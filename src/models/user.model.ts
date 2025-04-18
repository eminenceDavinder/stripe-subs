import mongoose, { Schema, model, models } from 'mongoose';
import { IUser } from '@/utils/interfaces';

const userSchema: Schema<IUser> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export default models.User || model<IUser>('User', userSchema);
