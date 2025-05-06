import { authenticateToken } from "@lib/helpers/authentication.helpers";
import { dbConnection } from "@lib/dbConnection";
import Subscription from "@lib/models/subscription.model";
import {
  asyncHandlerForOperations,
  generateResponseObject,
} from "@lib/helpers/common.helpers";
import { ResponseData } from "@lib/types";
import { StatusCodes } from "http-status-codes";
import { Stripe } from "@lib/helpers/stripe.herpers";
dbConnection();

export const findSubscribedPlanByUserId = async (token: string) => {
  const user = await authenticateToken(token) as string;
  const result = await asyncHandlerForOperations(
    async (): Promise<ResponseData | unknown> => {
      const subscription = await Subscription.findOne({
        userId: user,
        status: "active",
      }).sort({ currentPeriodEnd: -1 });
      if (subscription) return { data: { plan: subscription.stripePriceId } };
      return {
        error: "No Subscription found",
        status_code: StatusCodes.OK,
      };
    },
    "Internal server error",
    StatusCodes.INTERNAL_SERVER_ERROR
  );
  return generateResponseObject(result as ResponseData);
};

export const upsertSubscription = async (
  subscription: Stripe.Subscription,
  userId: string,
  stripeCustomerId: string,
  stripeInvoiceId: string,
  item: Stripe.SubscriptionItem
) => {
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
};

export const updateSubscriptionAtInvoice = async (
  subscriptionId: string,
  latestInvoice: string,
  status: string
) => {
  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: subscriptionId },
    {
      latestInvoice,
      status,
    }
  );
};

export const userLatestSubscription = async (userId: string) => {
  return await Subscription.findOne({
    userId: userId,
    status: "active",
  }).sort({ currentPeriodEnd: -1 });
};

export const cancelSubscription = async (
  stripeSubscriptionId: string,
  canceled_at: number
) => {
  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: stripeSubscriptionId },
    {
      $set: {
        status: "canceled",
        cancelAtPeriodEnd: canceled_at
          ? new Date(canceled_at * 1000)
          : undefined,
      },
    }
  );
};
