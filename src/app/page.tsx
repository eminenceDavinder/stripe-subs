"use client";
import { setUser } from "@/store/slices/userSlice";
import { RootState } from "@/store/store";
import { getLocalStorage } from "@/utils/localStorage";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function HomePage({}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { userInfo } = useSelector((store: RootState) => store.user);
  const [active, setActive] = useState(false);

  const handleCheckIsSubscribed = async (token: string) => {
    const { data } = await axios.get("/api/is-subscribed", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setActive(data.isSubscribed);
  };

  useEffect(() => {
    const userInfoFromStorage = getLocalStorage("userInfo");
    if (userInfoFromStorage) {
      dispatch(setUser({ userInfo: userInfoFromStorage }));
      handleCheckIsSubscribed(userInfoFromStorage.access_token);
    }
  }, [dispatch, active]);

  const Subscription = () => {
    return (
      <div className="container">
        <h3>{active ? "Manage your Susbscriptions" : "Subscribe please to access the content"}</h3>
        {
          active ? <button className="manage-btn" onClick={() => {router.push('/manage-subscription')}}>Manage Subscription</button> : 
          <button onClick={() => {router.push('/subscriptions')}} className="subs">Subscribe</button>
        }
      </div>
    );
  };

  

  return <>
    <h1>Home Page</h1>
    {
      userInfo.access_token ?
      <Subscription /> : <p>Authenticate First</p>
    }
  </>
}
