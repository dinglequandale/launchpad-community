import "./loginicon.css";
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function LoginIcon(){
    const {user, isAuthenticated} = useAuth0();

    return (
        <>
            <article className="iconContainer"> 
                <span className="iconUsername"> {user?.name} </span>
                {user?.picture && <img className="userPfp" src={user.picture} alt = {user?.name} />}
            </article>
        </>
    )
}