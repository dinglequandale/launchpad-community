import "./loginicon.css";
import React, { useEffect, useState } from "react";
import { VscAccount } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";
import { displayShortenedName } from "../../services/userProfileServices";

export default function LoginIcon(){
    const [basicUserInfo, setBasicUserInfo] = useState(null);
    useEffect(()=>{
        const storedUserBasicInfo = localStorage.getItem("basicUserInfo");
        setBasicUserInfo(JSON.parse(storedUserBasicInfo));
    },[]);

    const navigate = useNavigate();

    return (
        <>
            <article className="iconContainer">
                {basicUserInfo?.userPfpPreview ? <img className="userPfp" src={basicUserInfo?.userPfpPreview}/> : 
                <VscAccount size={47} style={{background: "var(--neutral)", borderRadius: "50%"}}/>}
                <div style={{display: "flex", flexDirection: "column", lineHeight: "1.2", justifyContent: "left"}}>
                    <span className="iconUsername"> {displayShortenedName(basicUserInfo?.userName)} </span>
                    <button className="btnText diff-color" onClick={()=>navigate("/MyProfile")} style={{width: "fit-content", fontSize: "18px"}}>My Profile</button>
                </div>
            </article>
        </>
    )
}