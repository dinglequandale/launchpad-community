import React from "react"
import { Navigate, useNavigate } from "react-router-dom"
import "./landingpage.css"
import { useAuth } from "../../contexts/auth/AuthContext";

export default function LandingPage() {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleJoin = () => {
    if(!userLoggedIn){navigate("/Signup");}
    else{navigate("/Home");}
  }

  return (
    <>
    {userLoggedIn && (<Navigate to="/Home" replace={true}/>)}
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
          <button className="btnJoin" onClick={handleJoin}> Join us now </button>
        </div>
      </div>
    </div>
    </>
  );
}