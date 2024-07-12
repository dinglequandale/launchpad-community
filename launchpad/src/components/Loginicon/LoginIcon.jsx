import "./loginicon.css";
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { VscAccount } from "react-icons/vsc";

export default function LoginIcon(){
    const {user, isAuthenticated, isLoading} = useAuth0();
    // TODO: integrate firebase auth
    // TODO: add actual user data attained from onboarding

    return (
        <>
            <article className="iconContainer">
                {user?.picture && <img className="userPfp" src={user.picture}/>}
                <div style={{display: "flex", flexDirection: "column", lineHeight: "1.2"}}>
                    <span className="iconUsername"> {user?.name} </span>
                    {!isLoading && <a href="/MyProfile" style={{textDecoration: "underline"}}>My Profile</a>}
                </div>
            </article>
        </>
    )
}