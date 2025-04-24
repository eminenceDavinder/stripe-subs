import User from '@/models/user.model';
import mongoose from 'mongoose';
import { NextRequest } from 'next/server';
import { authenticateToken } from './auth.helpers';


export const findUserIdByCustomer = async (email: string): Promise<mongoose.Types.ObjectId | string> => {
  const user = await User.findOne({ email: email });
  return user?._id;
};

export const getCustomerId = async (req: NextRequest) => {
  const user = authenticateToken(req);
  const {stripe} = await User.findById({_id: user as string});
  return stripe.stripeCustomerId;
}