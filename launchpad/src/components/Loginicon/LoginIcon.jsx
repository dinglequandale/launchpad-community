import "./loginicon.css";
import React from "react";
import { VscAccount } from "react-icons/vsc";

export default function LoginIcon(){
    // TODO: integrate firebase auth
    // TODO: add actual user data attained from onboarding
    const userPicture = null;
    return (
        <>
            <article className="iconContainer">
                {userPicture ? <img className="userPfp" src={user.picture}/> : 
                <VscAccount size={47} style={{background: "var(--neutral)", borderRadius: "50%"}}/>}
                <div style={{display: "flex", flexDirection: "column", lineHeight: "1.2"}}>
                    <span className="iconUsername"> Jose Gallo </span>
                    {<a href="/MyProfile" style={{textDecoration: "underline"}}>My Profile</a>}
                </div>
            </article>
        </>
    )
}