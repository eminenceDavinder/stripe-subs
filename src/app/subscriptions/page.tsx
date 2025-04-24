"use client";
import styles from "@/app/subscriptions/page.module.css";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import axios, { isAxiosError } from "axios";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY!);

type Plan = {
  id: string;
  name: string;
  description: string;
  price: number;
  price_id: string;
  interval: string;
};

export default function Subscriptions() {
  const router = useRouter();
  const {
    userInfo: { access_token, email },
  } = useSelector((store: RootState) => store.user);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!access_token) {
      router.push("/");
    }
  }, [access_token, router]);

  const fetchPlansAndActive = async () => {
    try {
      setLoading(true);
      const { data: plansData } = await axios.get("/api/subscription-plans");
      setPlans(plansData);

      const { data: subData } = await axios.get("/api/subscribed-plan", {
        headers: { authorization: `Bearer ${access_token}` },
      });

      const activePlan = plansData.find((p: Plan) => subData.plan === p.id);
      setLoading(false);
      if (!activePlan || activePlan?.id) router.push("/manage-subscription");
    } catch (err) {
      setLoading(false);
      if (isAxiosError(err)) {
        const data: { message: string } = err.response?.data;
        setError(data.message);
      }
    }
  };

  useEffect(() => {
    if (access_token) {
      fetchPlansAndActive();
    }
  }, [access_token]);

  const handleSubscribe = async (priceId: string) => {
    const stripe = await stripePromise;
    try {
      const { data } = await axios.post("/api/create-checkout-session", {
        priceId,
        email,
      });
      const sessionId = data?.sessionId;
      router.push('/manage-subscription')
      await stripe?.redirectToCheckout({ sessionId });
    } catch (err) {
      if (isAxiosError(err)) {
        const data: { message: string } = err.response?.data;
        console.log(data.message);
      }
    }
  };

  if (loading) return <p>Loading plans...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles["m-container"]}>
      <h1>Choose a Subscription Plan</h1>
      <div className={styles["subs-container"]}>
        {plans.map((plan) => (
          <div key={plan.id} className={styles["sub-container"]}>
            <h2>{plan.name}</h2>
            <p>{plan.description}</p>
            <p>
              Price:{" "}
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(plan.price / 100)}{" "}
              / {plan.interval}
            </p>
            <button
              className={styles["sub-btn"]}
              onClick={() => handleSubscribe(plan.price_id)}
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
