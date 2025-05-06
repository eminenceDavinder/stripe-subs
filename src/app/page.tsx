"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@store/slices/userSlice";
import { RootState } from "@store/store";
import { getLocalStorage } from "@lib/utils/localStorage";
import { handleCheckIsSubscribed } from "@lib/utils/axios.services";

const Subscription = ({ active }: { active: boolean }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(active ? "/manage-subscription" : "/subscriptions");
  };

  return (
    <div className="container">
      <h3>
        {active
          ? "Manage your Subscriptions"
          : "Subscribe please to access the content"}
      </h3>
      <button className={active ? "manage-btn" : "subs"} onClick={handleClick}>
        {active ? "Manage Subscription" : "Subscribe"}
      </button>
    </div>
  );
};

export default function HomePage() {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state: RootState) => state.user);
  const [active, setActive] = useState(false);

  const fetchData = useCallback(async () => {
    const userInfoFromStorage = getLocalStorage("userInfo");

    if (!userInfoFromStorage) return;

    dispatch(setUser({ userInfo: userInfoFromStorage }));

    const isSubscribed = await handleCheckIsSubscribed();
    setActive(isSubscribed);
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <h1>Home Page</h1>
      {userInfo?.access_token ? (
        <Subscription active={active} />
      ) : (
        <p>Authenticate First</p>
      )}
    </>
  );
}
