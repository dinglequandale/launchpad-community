import "./loginicon.css";
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function LoginIcon(){
    const {user, isAuthenticated} = useAuth0();

    return (
        isAuthenticated && (
            <article> {JSON.stringify(user)} </article>
        )
    )
}