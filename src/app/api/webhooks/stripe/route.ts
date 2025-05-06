import { NextRequest, NextResponse } from "next/server";
import logger from "@/lib/logger";
import { Stripe, stripe, endpointSecret } from "@/lib/helpers/stripe.herpers";
import { handleCheckOutSubscriptionUpdated, handleInvoiceFailed, handleInvoicePaid, handleSubscriptionDeleted, handleSubscriptionUpdated } from "@/lib/services/stripeWebhook.services";
import { StripeEvent } from "@/lib/types";


export async function POST(request: NextRequest) {
  const body = await request.text(); 
  const sig = request.headers.get("stripe-signature");
  if(!sig) return;
  const event: StripeEvent = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  if(!event) return;

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case "invoice.paid":
    case "invoice.payment_succeeded":
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case "checkout.session.completed":
      await handleCheckOutSubscriptionUpdated(
        event.data.object as Stripe.Checkout.Session
      );
      break;
    case "invoice.payment_failed":
      await handleInvoiceFailed(event.data.object as Stripe.Invoice);
      break;
    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }
  return NextResponse.json({ received: true });
}
