import React from "react"
import { useNavigate } from "react-router-dom"
import "./landingpage.css"
import { useAuth0 } from "@auth0/auth0-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const {isAuthenticated, loginWithRedirect, user} = useAuth0();

  console.log(user)

  return (
    <div className="background">
      <div className="landingPage">
        <span className="title"><span style={{textDecoration: "underline", color: "var(--secondary)"}}>launch</span>pad.</span>
        <div className="landingCard">
          <span className="landingText">A platform that revolutionizes students' access to valuable connections and on-site job experience</span>
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