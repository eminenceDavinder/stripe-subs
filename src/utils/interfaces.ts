import mongoose from "mongoose";
import { NextApiRequest } from "next";

export interface DecodedUser {
  userId: string;
}

export interface AuthenticatedRequest extends NextApiRequest {
  user?: DecodedUser;
}

interface IStripe extends Document {
  stripeCustomerId: string;
  isActive: boolean;
  paymentMethod: string;
}
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  stripe?: IStripe;
}
export interface ISubscription extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  stripeInvoiceId: string,
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status:
    | "active"
    | "incomplete"
    | "canceled"
    | "past_due"
    | "trialing"
    | string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: Date; // renamed for clarity
  trialEnd?: Date; // fixed typo
  latestInvoice: string;
}
