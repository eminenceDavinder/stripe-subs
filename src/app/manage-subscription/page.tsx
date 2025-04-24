"use client";
import { RootState } from "@/store/store";
import axios, { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import "./page.css";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

type Plan = {
  id: string;
  name: string;
  description: string;
  price: number;
  price_id: string;
  interval: string;
};

export default function Account() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plan, setPlan] = useState<Plan>();
  const [loading, setLoading] = useState(false);
  const route = useRouter();
  const {
    userInfo: { access_token, email },
  } = useSelector((store: RootState) => store.user);

  const fetchPlansAndActive = async () => {
    try {
      const { data: plansData } = await axios.get("/api/subscription-plans");
      setPlans(plansData);

      const { data: subData } = await axios.get("/api/subscribed-plan", {
        headers: { authorization: `Bearer ${access_token}` },
      });

      const activePlan = plansData.find((p: Plan) => subData.plan === p.id);
      setPlan(activePlan);
      if (!activePlan || !activePlan?.id) route.push("/subscriptions");
    } catch (err) {
      if (isAxiosError(err)) {
        console.error("Subscription fetch error:", err);
      }
    }
  };

  const handleUpgrade = async (priceId: string) => {
    try {
      const { data } = await axios.post(
        "/api/upgrade-subscription",
        { priceId, email },
        {
          headers: { authorization: `Bearer ${access_token}` },
        }
      );
      window.location.href = data.url;
    } catch (err) {
      console.error("Upgrade error:", err);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      await axios.post(
        "/api/cancel-subscription",
        {email},
        { headers: { authorization: `Bearer ${access_token}` } }
      );
      setLoading(false);
      window.location.href = '/subscriptions';
    } catch (err) {
      setLoading(false);
      console.error("Cancel error:", err);
    }
  };

  useEffect(() => {
    fetchPlansAndActive();
  }, [access_token]);

  return (
    <div className="container">
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
                <p>
                  ${p.price / 100} / {p.interval}
                </p>
                <button
                  className="upgrade"
                  onClick={() => handleUpgrade(p.price_id)}
                >
                  Upgrade
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
