import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function GET() {
  try {
    const promoCodes = await stripe.promotionCodes.list({
      limit: 100,
    });
    return NextResponse.json(promoCodes.data);
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Error fetching subscription plans" },
      { status: 500 }
    );
  }
}
