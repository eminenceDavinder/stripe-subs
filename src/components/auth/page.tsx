"use client";
import { FormEvent, useEffect } from "react";
import "./page.css";
import { usePathname } from "next/navigation";
import { AuthRequestBody } from "@lib/validators";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { setLocalStorage } from "@lib/utils/localStorage";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@store/slices/userSlice";
import { useRouter } from "next/navigation";
import { RootState } from "@store/store";
import { handleFormData } from "@lib/utils/helpers";
import { handleUserAuth } from "@lib/utils/axios.services";

const Auth = () => {
  const auth = usePathname();
  const router = useRouter();
  const {userInfo: {access_token}} = useSelector((store: RootState) => store.user);
  const dispatch = useDispatch();
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = handleFormData(event.currentTarget);
    const result = AuthRequestBody.safeParse(formData);
    if (!result.success) return toast.error(result.error.issues[0].message);
    const data = await handleUserAuth(auth, formData);
    if(data?.success){
      setLocalStorage('userInfo', data?.result);
      dispatch(setUser({userInfo: data?.result}));
      toast.success(data?.message);
      return router.push('/');
    }
    return toast.error(data?.message);
  };

  useEffect(() => {
  if(access_token) router.push('/');
  }, [access_token, router])

  return (
    <>
      <div className="background">
        <div className="shape"></div>
        <div className="shape"></div>
      </div>
      <form onSubmit={handleSubmit}>
        <Toaster />
        <h3>{auth == "/sign-in" ? "Login Here" : "Create Account"}</h3>

        {auth == "/sign-up" ? (
          <>
            <label htmlFor="fullname">Fullname</label>
            <input
              type="text"
              placeholder="Fullname"
              id="fullname"
              name="fullname"
              required
            />
          </>
        ) : null}

        <label htmlFor="email">Email</label>
        <input
          type="email"
          placeholder="Email"
          id="email"
          name="email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          placeholder="Password"
          id="password"
          name="password"
          required
        />

        <button type="submit">
          {auth == "/sign-in" ? "Log In" : "Sign Up"}
        </button>
        <div className="social">
          <div className="go">
            <i className="fab fa-google"></i> Google
          </div>
          <div className="fb">
            <i className="fab fa-facebook"></i> Facebook
          </div>
        </div>
        <Link href={auth == '/sign-in' ? '/sign-up' : '/sign-in'} style={{ float: 'right', marginTop: '10px', textDecoration: 'none'}}>{auth == '/sign-in' ? 'Create new account' : 'login account'}</Link>
      </form>
    </>
  );
};

export default Auth;
