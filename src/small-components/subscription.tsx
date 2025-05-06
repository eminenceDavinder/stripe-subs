import { IPromoCode, Plan } from "@lib/interfaces";
import { checkPromotionCode } from "@lib/utils/helpers";
import { useState } from "react";
import styles from "@small-components/subscription.module.css";

export const PriceContainer = ({
  price,
  interval,
  discount_price,
}: {
  price: number;
  interval: string;
  discount_price: number | null;
}) => {
  return (
    <p>
      Price:{" "}
      <span
        style={
          discount_price
            ? { textDecoration: "line-through", fontSize: "15px" }
            : {}
        }
      >
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(price / 100)}{" "}
        {discount_price ? null : <> / {interval}</>}
      </span>
      {discount_price ? (
        <span style={{ color: "green", fontWeight: "600", fontSize: "17px" }}>
          {" "}
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(discount_price / 100)}{" "}
          / {interval}
        </span>
      ) : null}
    </p>
  );
};

export const PromoCodeContainer = ({
  plan,
  index,
  promoCodes,
  setPromocodeId,
}: {
  plan: Plan;
  index: number;
  promoCodes: IPromoCode[];
  setPromocodeId: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [value, setValue] = useState("");
  const [valid, setValid] = useState<boolean | null>(null);

  const handlePromotionCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    setValue(val);
    const result = checkPromotionCode(val, promoCodes, plan);
    if (result) {
      setPromocodeId(result);
      return setValid(true);
    }
    setPromocodeId("");
    return setValid(false);
  };
  
  return plan.name.toLowerCase() !== "free" ? (
    <div className={`${styles["promo-con"]}`}>
      <label htmlFor={`coupon-${index}`}>Coupon code:</label>
      <input
        type="text"
        name={`coupon-${index}`}
        id={`coupon-${index}`}
        placeholder="Enter the Promo code"
        value={value}
        style={
          valid === true
            ? { color: "green", border: "3px solid green" }
            : valid === false
            ? { color: "red", border: "2px solid red" }
            : {}
        }
        onChange={handlePromotionCode}
      />
    </div>
  ) : null;
};
