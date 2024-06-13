import "./signup.css"
import React from "react";
import LoginButton from "../../../components/Loginbutton/LoginButton";
import LogoutButton from "../../../components/Loginbutton/LogoutButton";
import LoginIcon from "../../../components/Loginicon/LoginIcon";
import { useAuth0 } from "@auth0/auth0-react";

export default function Signup() {
  const {isLoading, error} = useAuth0();
  return (
    <div className="tings">
      
      {error && <p> Authentication error </p>}

      {(!error && isLoading) && <p>Loading...</p>}
      
      {!error && !isLoading && 
      <>
      <LoginButton/>
      <LogoutButton/>
      <LoginIcon/>
      </>
      }
      
    </div>
   
  );
}