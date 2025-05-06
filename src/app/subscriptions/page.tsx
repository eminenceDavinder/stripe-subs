"use client";
import styles from "@/app/subscriptions/page.module.css";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { IPromoCode, Plan } from "@/lib/interfaces";
import { PriceContainer, PromoCodeContainer } from "@/small-components/subscription";
import { handleGetCoupons, handleGetPromoCodes, handleGetSubscribedPlan, handleGetSubscriptionPlans, handleSubscribe } from "@/lib/utils/axios.services";
import { getActivatedPlan, mapCouponsToProducts } from "@/lib/utils/helpers";

export default function Subscriptions() {
  const router = useRouter();
  const {
    userInfo: { access_token, email },
  } = useSelector((store: RootState) => store.user);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [promocodeId, setPromocodeId] = useState<string>("");
  const [promoCodes, setPromoCodes] = useState<IPromoCode[]>([]);

  const subscribe = async (priceId: string, promocodeId: string, coupon: string) => {
    await handleSubscribe(priceId, promocodeId, coupon, email);
    router.push('/manage-subscription');
  }

  const getPromoCodes = async () => {
    const data = await handleGetPromoCodes();
    setPromoCodes(data as IPromoCode[]);
  }

  const fetchPlansAndActive = useCallback(async () => {
      setLoading(true);
      const coupons = await handleGetCoupons();
      const plansData = await handleGetSubscriptionPlans();
      const newPlans = mapCouponsToProducts(plansData, coupons);
      newPlans.reverse();
      setPlans(newPlans as Plan[]);
      const subData = await handleGetSubscribedPlan();
      if(subData){
        const activePlan = getActivatedPlan(plansData, subData);
        if (activePlan && activePlan?.id) router.push("/manage-subscription");
      }
      setLoading(false);
  }, [router]);

  useEffect(() => {
    if (!access_token) {
      router.push("/");
    }
    fetchPlansAndActive();
    getPromoCodes();
  }, [access_token, router, fetchPlansAndActive]);

  if (loading) return <p>Loading plans...</p>;
  return (
    <div className={styles["m-container"]}>
      <h1>Choose a Subscription Plan</h1>
      <div className={styles["subs-container"]}>
        {plans.map((plan, index) => (
          <div key={plan.id} className={styles["sub-container"]}>
            <h2>{plan.name}</h2>
            <p>{plan.description}</p>
            <PriceContainer
              price={plan.price}
              interval={plan.interval}
              discount_price={plan?.coupon?.amount_off}
            />
            <PromoCodeContainer
              plan={plan}
              index={index}
              promoCodes={promoCodes}
              setPromocodeId={setPromocodeId}
            />
            <button
              className={styles["sub-btn"]}
              onClick={() =>
                subscribe(plan.price_id, promocodeId, plan?.coupon?.id)
              }
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
