import "./loginicon.css";
import React from "react";
import { VscAccount } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";

export default function LoginIcon(){
    // TODO: integrate firebase auth
    // TODO: add actual user data attained from onboarding
    const userPicture = null;

    const navigate = useNavigate();

    return (
        <>
            <article className="iconContainer">
                {userPicture ? <img className="userPfp" src={user.picture}/> : 
                <VscAccount size={47} style={{background: "var(--neutral)", borderRadius: "50%"}}/>}
                <div style={{display: "flex", flexDirection: "column", lineHeight: "1.2", justifyContent: "left"}}>
                    <span className="iconUsername"> Jose Gallo </span>
                    <button className="btnText diff-color" onClick={()=>navigate("/MyProfile")} style={{width: "fit-content", fontSize: "18px"}}>My Profile</button>
                </div>
            </article>
        </>
    )
}