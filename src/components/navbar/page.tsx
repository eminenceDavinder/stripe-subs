"use client";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@store/store";
import { removeLocalStorage } from "@lib/utils/localStorage";
import { clearUser } from "@store/slices/userSlice";


const Navbar = () => {
  const dispatch = useDispatch();
  const {userInfo: {access_token}} = useSelector((store: RootState) => store.user);
  const handleSignOut = async() => {
    removeLocalStorage('userInfo');
    dispatch(clearUser());
  }

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand" href="/">
          NewsBox
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link href={"/"} className="nav-link active" aria-current="page">
                Home
              </Link>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                News
              </a>
              <ul className="dropdown-menu">
                <li>
                  <a className="dropdown-item" href="#">
                    Action
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Politics
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                  Romance
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Others
                  </a>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <a className="nav-link disabled" aria-disabled="true">
                Trendings
              </a>
            </li>
            {
              !access_token ?
              <>
                <li className="nav-item">
                  <Link href={"/sign-in"} className="nav-link">
                    SignIn
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href={"/sign-up"} className="nav-link">
                    SignUp
                  </Link>
                </li>
              </> : 
                <button style={{ border: "2px solid red", background: "white", fontSize: "17px", fontWeight: "350", marginTop: "5px", borderRadius: "6px"}} onClick={handleSignOut}>Sign Out</button>
            }
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
