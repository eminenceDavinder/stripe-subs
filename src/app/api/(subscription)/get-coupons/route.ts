import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function GET() {
  try {
    const couponsList = await stripe.coupons.list({});

    const coupons = couponsList.data.map((coupon: Stripe.Coupon) => {
        return {
          id: coupon.id,
          metadata: coupon.metadata,
          name: coupon.name,
          duration: coupon.duration,
          valid: true,
          percent_off: coupon.percent_off,
          amount_off: coupon.amount_off,
          currency: coupon.currency,
        };
    });
   
    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Error fetching subscription plans" },
      { status: 500 }
    );
  }
}
