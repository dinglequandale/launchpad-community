import "./loginicon.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { displayShortenedName } from "../../services/userProfileServices";
import DefaultIcon from "../DefaultIcon/DefaultIcon";

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
                <div onClick={() => navigate("/profile")}>
                    {basicUserInfo?.userPfpPreview ? <img className="userPfp" src={basicUserInfo?.userPfpPreview}/> : 
                    <DefaultIcon length={"44px"}/>}
                </div>
                <div style={{display: "flex", flexDirection: "column", lineHeight: "1.2", justifyContent: "left"}}>
                    <span className="iconUsername"> {displayShortenedName(basicUserInfo?.userName)} </span>
                    <button className="btnText-diff" onClick={()=>navigate("/profile", { state: {pathName : window.location.pathname }})} style={{width: "fit-content", fontSize: "18px"}}>My Profile</button>
                </div>
            </article>
        </>
    )
}