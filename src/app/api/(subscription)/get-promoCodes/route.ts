import { getPromoCodes } from "@lib/services/stripe.services";

export async function GET() {
  return getPromoCodes();
}
