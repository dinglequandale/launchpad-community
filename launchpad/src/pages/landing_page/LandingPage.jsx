import React from "react"
import { useNavigate } from "react-router-dom"
import "./landingpage.css"
import { useAuth0 } from "@auth0/auth0-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const {isAuthenticated, loginWithRedirect} = useAuth0();
  return (
    <div className="background">
      <div className="landingPage">
        <span className="title">launchpad.</span>
        <div className="landingCard">
          <span className="txt1">A platform that revolutionizes high schoolers' access to valuable connections and on-site job experience</span>
          <div className="ppl">
            <span className="ppl1">
              Student?
            </span>
            <span className="ppl2">
              Alumni?
            </span>
            <span className="ppl3">
              Professional?
            </span>
          </div>
          <button className="btnJoin" onClick={
            () => {
              !isAuthenticated && loginWithRedirect();
              isAuthenticated && navigate("UserSchool");
            }
            }> Join us now </button>
        </div>
      </div>
    </div>
  );
}