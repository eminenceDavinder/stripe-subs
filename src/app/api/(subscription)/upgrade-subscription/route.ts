import { authenticateToken } from "@/helpers/auth.helpers";
import { dbConnection } from "@/lib/dbConnection";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  dbConnection();

  const userId = authenticateToken(req) as string; // get Stripe customer ID from DB
  const user = await User.findOne({_id: userId});
  const { priceId, email } = await req.json();
  try {
    const session = await stripe.checkout.sessions.create({
      customer: user.stripe_customer_id,
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.get('origin')}/account?status=success`,
      cancel_url: `${req.headers.get('origin')}/account?status=cancel`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Something went wrong during checkout." });
  }
}
