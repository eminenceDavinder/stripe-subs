"use client";
import { RootState } from "@store/store";
import { useCallback, useEffect, useState } from "react";
import "./page.css";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Plan } from "@lib/interfaces";
import { PriceContainer } from "@small-components/subscription";
import {
  handleCancelSubscription,
  handleGetSubscribedPlan,
  handleGetSubscriptionPlans,
  handleUpdateSubscription,
} from "@lib/utils/axios.services";
import { getActivatedPlan } from "@lib/utils/helpers";
import toast, { Toaster } from "react-hot-toast";

export default function Account() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plan, setPlan] = useState<Plan>();
  const [loading, setLoading] = useState(false);
  const route = useRouter();
  const {
    userInfo: { email },
  } = useSelector((store: RootState) => store.user);

  const fetchPlansAndActive = useCallback(async () => {
    const plansData = await handleGetSubscriptionPlans();
    setPlans(plansData);
    const subData = await handleGetSubscribedPlan();
    if (subData) {
      const activePlan = getActivatedPlan(plansData, subData);
      if (!activePlan) return route.push("/manage-subscription");
      setPlan(activePlan);
    }
  }, [route]);

  
  const handleCancel = async () => {
      setLoading(true);
      const result = await handleCancelSubscription(email);
      setLoading(false);
      if(result){
        toast.success("Subscription cancled Successfully");
        return window.location.href = "/subscriptions";
      }
      return toast.error("Subscription not cancled due to server error, please try again later")
  };

  useEffect(() => {
    fetchPlansAndActive();
  }, [fetchPlansAndActive]);

  return (
    <div className="container">
      <Toaster/>
      <h1>Manage Subscription</h1>

      <div className="card">
        <h2>Current Plan</h2>
        {plan ? (
          <>
            <p>
              <strong>Name:</strong> {plan.name}
            </p>
            <p>
              <strong>Description:</strong> {plan.description}
            </p>
            <p>
              <strong>Price:</strong> ${(plan.price / 100).toFixed(2)} /{" "}
              {plan.interval}
            </p>
            <button
              className="cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                "Cancel Subscription"
              )}
            </button>
          </>
        ) : (
          <p>No active subscription.</p>
        )}
      </div>

      <div className="card">
        <h2>Other Plans</h2>
        <div className="plans">
          {plans
            .filter((p) => p.price_id !== plan?.price_id)
            .map((p) => (
              <div className="plan" key={p.id}>
                <p>
                  <strong>{p.name}</strong>
                </p>
                <p>{p.description}</p>
                <PriceContainer
                  price={p.price}
                  interval={p.interval}
                  discount_price={p?.coupon?.amount_off}
                />
                <button
                  className="upgrade"
                  onClick={() => handleUpdateSubscription(p.price_id, p?.coupon?.id, email)}
                >
                  {(plan?.price as number) > p.price ? "Downgrade" : "Upgrade"}
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
