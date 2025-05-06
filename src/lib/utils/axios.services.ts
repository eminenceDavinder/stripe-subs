import axios from "@lib/helpers/axios.helpers";
import { loadStripe } from "@stripe/stripe-js";
import { IPromoCode } from "@lib/interfaces";
import { AxiosResponse } from "axios";

export const tryCatch = async <T>(
  fn: () => Promise<T>
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    console.error("Axios Request Error:", error);
    return null;
  }
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY!);

export const handleCheckIsSubscribed = async () => {
  return tryCatch(async () => {
    const { data } = await axios.get("/is-subscribed");
    return data?.result?.isSubscribed;
  });
};

export const handleSubscribe = async (
  priceId: string,
  promocodeId: string,
  coupon: string,
  email: string
) => {
  const stripe = await stripePromise;

  return tryCatch(async () => {
    const {
      data: {
        result: { sessionId },
      },
    } = await axios.post("/create-checkout-session", {
      priceId,
      email,
      promocodeId,
      coupon,
    });
    await stripe?.redirectToCheckout({ sessionId });
  });
};

export const handleGetPromoCodes = async (): Promise<IPromoCode[] | null> => {
  return await tryCatch(async (): Promise<IPromoCode[]> => {
    const { data } = await axios.get("/get-promoCodes");
    return data;
  });
};

export const handleGetCoupons = async () => {
  return tryCatch(async () => {
    const { data } = await axios.get("/get-coupons");
    return data;
  });
};

export const handleGetSubscriptionPlans = async () => {
  return tryCatch(async () => {
    const {
      data: {
        result: { plans: plansData },
      },
    } = await axios.get("/subscription-plans");
    return plansData;
  });
};

export const handleGetSubscribedPlan = async () => {
  return tryCatch(async () => {
    const {
      data: {
        result: { plan: subData },
      },
    } = await axios.get("/subscribed-plan");
    return subData;
  });
};

export const handleUpdateSubscription = async (
  priceId: string,
  coupon: string,
  email: string
) => {
  const result = await tryCatch(async (): Promise<AxiosResponse> => {
    return await axios.post(
      "/upgrade-subscription",
      { priceId, email, coupon },
    );
  });

  if(result?.data.success){
    window.location.href = result.data.result.sessionId;
  }
};

export const handleCancelSubscription = async (email: string): Promise<boolean> => {
  const result = await tryCatch(async (): Promise<AxiosResponse> => {
    return await axios.post(
      "/cancel-subscription",
      { email },
    );
  });
  return result?.data.success;
 };


 export const handleFetchSessionStatus =  async (sessionId: string) => {
  const result = await tryCatch(async (): Promise<AxiosResponse> => {
    return await axios.post('/check-session',{ sessionId: sessionId })
  });

  return {success: result?.data?.success, message: result?.data?.message}
};

export const handleUserAuth = async (auth: string, formData: object) => {
  const result = await tryCatch(async (): Promise<AxiosResponse> => {
    return await axios.post(`${auth}`, formData);
  });
  return result?.data;
};