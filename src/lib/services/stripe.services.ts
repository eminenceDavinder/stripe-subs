import { authenticateToken } from "@/lib/helpers/authentication.helpers";
import { dbConnection } from "@/lib/dbConnection";
import { NextResponse } from "next/server";
import {
  stripe,
  Stripe,
} from "@/lib/helpers/stripe.herpers";
import { getUserById } from "@/lib/services/user.service";
import {
  asyncHandlerForOperations,
  generateResponseObject,
} from "@/lib/helpers/common.helpers";
import { ResponseData } from "@/lib/types";
import { StatusCodes } from "http-status-codes";
import logger from "../logger";
dbConnection();

const getSubscriptionsByStripeCustomerId = async (
  customerId: string,
  limit: number,
  status: 'active',
) => {
  return await stripe.subscriptions.list({
    customer: customerId,
    status: status,
    limit: limit,
  });
};

export const cancelStripeSubsctiption = async (token: string) => {
  const userId = (await authenticateToken(token)) as string;
  const user = await getUserById(userId);
  const subscriptions = await getSubscriptionsByStripeCustomerId(
    user.stripe_customer_id,
    1,
    "active"
  );
  const subscription = subscriptions.data[0];
  if (!subscription)
    return NextResponse.json({
      succes: false,
      error: "No active subscription found.",
    });

  const result = await asyncHandlerForOperations(
    async (): Promise<ResponseData | unknown> => {
      await stripe.subscriptions.cancel(subscription.id);
      return { success: true, message: "Subscription canceled." };
    },
    "Failed to cancel subscription.",
    StatusCodes.BAD_REQUEST
  );

  return generateResponseObject(result as ResponseData);
};

export const stripeCheckOutSession = async (
  token: string,
  sessionId: string
) => {
  const user = await authenticateToken(token);

  const result = await asyncHandlerForOperations(
    async (): Promise<ResponseData | unknown> => {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        const userId = session.client_reference_id || (user as string);

        if (userId) {
          return { message: 'payment done successfully', data: null };
        } else {
          logger.warn("No client_reference_id found in session");
          return {
            error: "Missing client_reference_id in session",
            status_code: StatusCodes.BAD_REQUEST,
          };
        }
      } else {
        logger.error("Payment status is not paid");
        return {
          error: "Payment not completed",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }
    },
    "Invalid Session Id",
    StatusCodes.BAD_REQUEST
  );
  return generateResponseObject(result as ResponseData);
};

export const stripeCreateCheckOutSession = async (
  email: string,
  promocodeId: string,
  priceId: string,
  coupon: string,
  orignal_url: string
) => {
  const result = await asyncHandlerForOperations(
    async (): Promise<ResponseData> => {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: email,
        discounts: promocodeId ? [{ promotion_code: promocodeId }] : [{coupon}],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${orignal_url}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${orignal_url}/subscriptions`,
      });
      return {
        data: { sessionId: session.id },
        message: "session is created successfully",
      };
    },
    "Error creating checkout session",
    StatusCodes.BAD_GATEWAY
  );
  return generateResponseObject(result as ResponseData);
};

export const stripeSubscriptionPlans = async () => {
  const result = await asyncHandlerForOperations(
    async (): Promise<ResponseData | unknown> => {
      const prices = await stripe.prices.list({
        expand: ["data.product"],
        active: true,
        type: "recurring",
      });

      const plans = prices.data.map((price) => {
        const product = price.product as Stripe.Product;
        return {
          product_Id: product.id,
          id: price.id,
          name: product.name,
          description: product.description,
          price: price.unit_amount ?? 0,
          interval: price.recurring?.interval ?? "month",
          price_id: price.id,
        };
      });
      return { data: { plans: plans }, message: "subscription Plans" };
    },
    "Error fetching subscription plans",
    StatusCodes.INTERNAL_SERVER_ERROR
  );
  return generateResponseObject(result as ResponseData);
};

export const upgradeStripeSubscription = async (
  token: string,
  priceId: string,
  email: string,
  coupon: string,
  orignal_url: string
) => {
  const result = await asyncHandlerForOperations(async (): Promise<ResponseData | unknown> => {
    
  const userId = (await authenticateToken(token)) as string;
  const user = await getUserById(userId);
    const session = await stripe.checkout.sessions.create({
      customer: user.stripe_customer_id,
      mode: "subscription",
      discounts: [{ coupon }],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${orignal_url}/account?status=success`,
      cancel_url: `${orignal_url}/account?status=cancel`,
    });
    return { data: {sessionId: session.url}, message : "Subscription Updated successfully"};

  }, "Something went wrong during checkout.", StatusCodes.INTERNAL_SERVER_ERROR)
  return generateResponseObject(result as ResponseData);
};

