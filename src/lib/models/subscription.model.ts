import mongoose, { Schema, model, models } from 'mongoose';
import { ISubscription } from '@lib/interfaces';


const SubscriptionSchema = new mongoose.Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      stripeCustomerId: { type: String, required: true, index: true },
      stripeInvoiceId: { type: String, required: true, unique: true },
      stripeSubscriptionId: { type: String, required: true, unique: true },
      stripePriceId: { type: String, required: true },
      status: {
        type: String,
        enum: ['active', 'incomplete', 'canceled', 'past_due', 'trialing'],
        required: true,
      },
      currentPeriodStart: { type: Date, required: true },
      currentPeriodEnd: { type: Date, required: true },
      cancelAtPeriodEnd: { type: Date }, 
      trialEnd: { type: Date }, 
      latestInvoice: { type: String, required: true },
    },
    { timestamps: true } 
  );
export default models.Subscription || model<ISubscription>('Subscription', SubscriptionSchema);
