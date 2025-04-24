import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import Subscription from "@/models/subscription.model";
import User from "@/models/user.model";
import { findUserIdByCustomer } from "@/helpers/subscription.helpers";
import logger from "@/logger";
import { dbConnection } from "@/lib/dbConnection";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(request: NextRequest) {
  dbConnection();
  const body = await request.text(); // Must be raw body, not parsed
  const sig = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig) throw new Error("Missing Stripe signature");
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    logger.error("Error verifying webhook signature:", err);
    return NextResponse.json(
      { error: `Webhook Error: ${err}` },
      { status: 400 }
    );
  }

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
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  if (!subscription.items.data.length) return;
  const item = subscription.items.data[0];
  const stripeCustomerId = subscription.customer.toString();
  const customer = await stripe.customers.retrieve(stripeCustomerId);
  const email = (customer as Stripe.Customer).email;
  const userId = await findUserIdByCustomer(email as string);

  await handleRefundPaymentPreviousSubscription(subscription, userId as string);
  
  const invoices = await stripe.invoices.list({
    subscription: subscription.id,
    limit: 1,
  });
  const stripeInvoiceId = invoices.data[0].id;

  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: subscription.id },
    {
      userId,
      stripeCustomerId,
      stripeInvoiceId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      status: subscription.status,
      currentPeriodStart: item.current_period_start,
      currentPeriodEnd: item.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at
        ? new Date((subscription.cancel_at as number) * 1000)
        : undefined,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : undefined,
      latestInvoice: subscription.latest_invoice?.toString() || "",
    },
    { upsert: true, new: true }
  );

  await User.findOneAndUpdate(
    { email },
    {
      $set: {
        "stripe.stripeCustomerId": stripeCustomerId,
        "stripe.paymentMethod": subscription.currency,
        "stripe.isActive":
          subscription.status.toLowerCase() === "active" ? true : false,
      },
    },
    { new: true }
  );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripeCustomerId = subscription.customer.toString();
  const customer = await stripe.customers.retrieve(stripeCustomerId);
  const email = (customer as Stripe.Customer).email;
  const userId = await findUserIdByCustomer(email as string);

  await handleRefundPaymentPreviousSubscription(subscription, userId as string);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice?.parent?.subscription_details?.subscription) return;

  const stripeCustomerId = invoice?.customer?.toString;
  const subscriptionId = invoice?.parent.subscription_details.subscription;

  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: subscriptionId },
    {
      latestInvoice: invoice.id,
      status: "active",
    }
  );

  await User.findOneAndUpdate(
    { "stripe.stripeCustomerId": stripeCustomerId },
    {
      $set: {
        "stripe.isActive": true,
      },
    },
    { new: true }
  );
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  if (!invoice.parent?.subscription_details?.subscription) return;

  const stripeCustomerId = invoice.customer?.toString;
  const subscriptionId = invoice.parent.subscription_details.subscription;

  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: subscriptionId },
    {
      status: "past_due",
    }
  );

  await User.findOneAndUpdate(
    { "stripe.stripeCustomerId": stripeCustomerId },
    {
      $set: {
        "stripe.isActive": false,
      },
    },
    { new: true }
  );
}

async function handleCheckOutSubscriptionUpdated(
  session: Stripe.Checkout.Session
) {
  const subscriptionId = session.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const stripeCustomerId = subscription.customer.toString();
  const customer = await stripe.customers.retrieve(stripeCustomerId);
  const email = (customer as Stripe.Customer).email;
  const userId = await findUserIdByCustomer(email as string);

  if (subscription.status === "canceled") {
    return await handleRefundPaymentPreviousSubscription(subscription, userId as string);
  }
  return await handleSubscriptionUpdated(subscription)
}

async function handleRefundPaymentPreviousSubscription(
  subscription: Stripe.Subscription,
  userId: string
) {
  const existing = await Subscription.findOne({
    userId: userId,
    status: "active",
  }).sort({ currentPeriodEnd: -1 });

  if (existing && existing.stripeSubscriptionId) {
    const invoices = await stripe.invoicePayments.list({
      invoice: existing.stripeInvoiceId,
      limit: 1,
    });

    const invoice = invoices.data[0];

    if (invoice?.status === "paid" && invoice.payment.payment_intent) {
      const now = Date.now() / 1000;
      const prevSub = await stripe.subscriptions.retrieve(
        existing.stripeSubscriptionId
      );
      const item = prevSub.items.data[0];
      const start = item.current_period_start;
      const end = item.current_period_end;

      const used = now - start;
      const total = end - start;
      const usageRatio = used / total;
      const unusedAmount = Math.round(
        (invoice.amount_paid as number) * (1 - usageRatio)
      );
      if (unusedAmount > 0) {
      
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: existing.stripeSubscriptionId },
          {$set:{
            status: "canceled",
            cancelAtPeriodEnd: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000)
              : undefined,
          }}
        );

        await User.findOneAndUpdate(
          { _id:  userId },
          {
            $set: {
              "stripe.isActive": false,
            },
          },
          { new: true }
        );
        try{
          await stripe.refunds.create({
            payment_intent: invoice.payment.payment_intent.toString(),
            amount: unusedAmount,
          });
        }catch(err){
          console.log(err);
        }
      }
    }
  }
}
