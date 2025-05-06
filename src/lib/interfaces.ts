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

export interface Plan {
  product_Id: string;
  id: string;
  name: string;
  description: string;
  price: number;
  price_id: string;
  interval: string;
  coupon: Coupon;
};

export interface Coupon {
  id: string;
  name: string | null;
  duration: "forever" | "once" | "repeating";
  metadata: Record<string, string>;
  valid: boolean;
  percent_off: number | null;
  amount_off: number | null;
  currency: string | null;
}

export interface IPromoCode {
  id: string,
  code: string,
  active: boolean
  // coupon: Coupon,
  metadata: Record<string, string>
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
  cancelAtPeriodEnd?: Date; 
  trialEnd?: Date; 
  latestInvoice: string;
}
