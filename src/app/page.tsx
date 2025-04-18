'use client';
import { setUser } from "@/store/slices/userSlice";
import { getLocalStorage } from "@/utils/localStorage";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function HomePage({}){
  const dispatch = useDispatch();
  console.log('hi');
  useEffect(() => {
    const userInfoFromStorage = getLocalStorage('userInfo');
    console.log(userInfoFromStorage);
    if(userInfoFromStorage){
      dispatch(setUser({userInfo: userInfoFromStorage}))
    }
  }, [dispatch])

  return <>Home page</>
}