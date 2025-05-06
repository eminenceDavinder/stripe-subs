import { Stripe } from "@lib/helpers/stripe.herpers";

export type AuthFormData = {
  name?: string;
  email: string;
  password: string;
};

export type ResponseData = {
  error?: string;
  status_code?: number;
  message?: string;
  data?: object;
};

export type sessionData = {
  email: string;
  access_token: string;
};

export type StripeEvent = Stripe.Event;

export type SubscriptionCredentials = {
    item: Stripe.SubscriptionItem,
    stripeCustomerId: string,
    userId: string
}

export type InvoiceCredentials = {
  stripeCustomerId: string,
  userId: string
  subscriptionId: string
}