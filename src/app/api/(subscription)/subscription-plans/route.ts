import { stripeSubscriptionPlans } from "@/lib/services/stripe.services";

export async function GET() {
  return stripeSubscriptionPlans();
}
