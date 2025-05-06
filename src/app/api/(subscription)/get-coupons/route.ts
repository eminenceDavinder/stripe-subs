import { getCoupons } from "@lib/services/stripe.services";

export async function GET() {
  return getCoupons();
}
