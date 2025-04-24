import { authenticateToken } from "@/helpers/auth.helpers";
import { dbConnection } from "@/lib/dbConnection";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  dbConnection();

  const userId = authenticateToken(req) as string; // get Stripe customer ID from DB
  const user = await User.findOne({ _id: userId });
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: "active",
      limit: 1,
    });

    const subscription = subscriptions.data[0];

    if (!subscription) {
      return NextResponse.json({ error: "No active subscription found." });
    }

    await stripe.subscriptions.cancel(subscription.id);
    return NextResponse.json({ message: "Subscription canceled." });
  } catch (err) {
    console.error("Cancel error:", err);
    return NextResponse.json({ error: "Failed to cancel subscription." });
  }
}
