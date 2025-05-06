
import { upgradeStripeSubscription } from "@lib/services/stripe.services";
import { NextRequest } from "next/server";


export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader && authHeader.split(" ")[1];
  const {priceId, email, coupon} = await req.json();
  return upgradeStripeSubscription(token as string, priceId, email, coupon, `${req.headers.get('origin')}`);
}
