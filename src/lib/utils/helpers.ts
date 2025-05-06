import { Coupon, IPromoCode, Plan } from "../interfaces";

export const checkPromotionCode = (
  val: string,
  promoCodes: IPromoCode[],
  plan: Plan
): string => {
  if (val.length) {
    for (const code of promoCodes) {
      if (code.code === val && plan.product_Id === code?.metadata?.product_Id)
        return code.id;
    }
  }
  return "";
};

export const mapCouponsToProducts =  (
  plansData: Plan[],
  coupons: Coupon[]
) => {
  const newPlans = plansData.map((plan: Plan) => {
    const coupon = coupons.find(
      (coupon: Coupon) => coupon.metadata?.product_Id === plan.product_Id
    );
    return { ...plan, coupon: coupon };
  });
  return newPlans;
};

export const getActivatedPlan = (plansData: Plan[], subData: string) => {
  const activePlan = plansData.find((plan: Plan) => subData === plan.id);
  return activePlan;
}

export const handleFormData = (data: HTMLFormElement) => {
    const form = new FormData(data);
    const formData: Record<string, unknown> = {};
    for (const [key, value] of form.entries()) {
      formData[key] = value;
    }
    return formData;
  };