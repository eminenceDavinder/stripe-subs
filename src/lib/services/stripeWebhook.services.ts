import { Stripe, stripe } from "@lib/helpers/stripe.herpers";
import {
  InvoiceCredentials,
  SubscriptionCredentials,
} from "@lib/types";
import {
  cancelUserSubscription,
  findUserIdByEmail,
  updateUserSubscription,
} from "./user.service";
import {
  cancelSubscription,
  updateSubscriptionAtInvoice,
  upsertSubscription,
  userLatestSubscription,
} from "./subscription.service";


const subscriptionCredentials = async (
  subscription: Stripe.Subscription
): Promise<SubscriptionCredentials> => {
  const item = subscription.items.data[0];
  const stripeCustomerId = subscription.customer.toString();
  const customer = await stripe.customers.retrieve(stripeCustomerId);
  const email = (customer as Stripe.Customer).email;
  const userId = (await findUserIdByEmail(email as string)) as string;
  return { item, stripeCustomerId, userId };
};

const invoiceCredentails = async (
  invoice: Stripe.Invoice
): Promise<InvoiceCredentials> => {
  const stripeCustomerId = invoice?.customer as string;
  const subscriptionId = invoice?.parent?.subscription_details
    ?.subscription as string;
  const customer = await stripe.customers.retrieve(stripeCustomerId as string);
  const email = (customer as Stripe.Customer).email;
  const userId = (await findUserIdByEmail(email as string)) as string;
  return { stripeCustomerId, subscriptionId, userId };
};

const paidAmountProportion = async (
  amount_paid: number,
  stripeSubscriptionId: string
) => {
  const now = Date.now() / 1000;
  const prevSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const item = prevSub.items.data[0];
  const start = item.current_period_start;
  const end = item.current_period_end;

  const used = now - start;
  const total = end - start;
  const usageRatio = used / total;
  const unusedAmount = Math.round((amount_paid as number) * (1 - usageRatio));
  return unusedAmount;
};

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  if (!subscription.items.data.length) return;
  const { item, stripeCustomerId, userId }: SubscriptionCredentials =
    await subscriptionCredentials(subscription);

  await handleRefundPaymentPreviousSubscription(subscription, userId as string);

  const invoices = await stripe.invoices.list({
    subscription: subscription.id,
    limit: 1,
  });
  const stripeInvoiceId = invoices.data[0].id?.toString();
  await upsertSubscription(
    subscription,
    userId,
    stripeCustomerId,
    stripeInvoiceId as string,
    item
  );
  await updateUserSubscription(
    userId,
    stripeCustomerId,
    subscription.default_payment_method as string,
    subscription.status
  );
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const { userId }: SubscriptionCredentials = await subscriptionCredentials(
    subscription
  );
  await handleRefundPaymentPreviousSubscription(subscription, userId as string);
}

export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice?.parent?.subscription_details?.subscription) return;
  const { subscriptionId, stripeCustomerId, userId }: InvoiceCredentials =
    await invoiceCredentails(invoice);
  await updateSubscriptionAtInvoice(
    subscriptionId as string,
    invoice.id as string,
    invoice.status as string
  );
  await updateUserSubscription(
    userId,
    stripeCustomerId as string,
    invoice.default_payment_method as string,
    invoice.status as string
  );
}

export async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  if (!invoice.parent?.subscription_details?.subscription) return;
  const { subscriptionId, stripeCustomerId, userId }: InvoiceCredentials =
    await invoiceCredentails(invoice);
  await updateSubscriptionAtInvoice(
    subscriptionId as string,
    "",
    invoice.status as string
  );
  await updateUserSubscription(
    userId,
    stripeCustomerId as string,
    invoice.default_payment_method as string,
    invoice.status as string
  );
}

export async function handleCheckOutSubscriptionUpdated(
  session: Stripe.Checkout.Session
) {
  const subscriptionId = session.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const { userId }: SubscriptionCredentials = await subscriptionCredentials(
    subscription
  );

  if (subscription.status === "canceled") {
    return await handleRefundPaymentPreviousSubscription(
      subscription,
      userId as string
    );
  }
  return await handleSubscriptionUpdated(subscription);
}

export async function handleRefundPaymentPreviousSubscription(
  subscription: Stripe.Subscription,
  userId: string
) {
  const existing = await userLatestSubscription(userId);
  if (!existing) return;
  const invoices = await stripe.invoicePayments.list({
    invoice: existing.stripeInvoiceId,
    limit: 1,
  });
  const invoice = invoices.data[0];

  if (invoice?.status === "paid" && invoice.payment.payment_intent) {
    const unusedAmount = await paidAmountProportion(
      invoice.amount_paid as number,
      existing.stripeSubscriptionId
    );
    if (unusedAmount > 0 || invoice.amount_paid === 0) {
      await cancelSubscription(
        existing.stripeSubscriptionId,
        subscription.cancel_at as number
      );
      await cancelUserSubscription(userId);
      try {
        await stripe.refunds.create({
          payment_intent: invoice.payment.payment_intent.toString(),
          amount: unusedAmount,
        });
      } catch (err) {
        console.log(err);
      }
    }
  }
}
