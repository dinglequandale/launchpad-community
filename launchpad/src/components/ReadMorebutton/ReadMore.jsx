import { useEffect, useState } from "react";

export default function ReadMoreButton({isExpanded, handleClick, isLessText}){

    const [showButton, setShowButton] = useState(true);
    useEffect(()=>{
        if(isLessText){
            setShowButton(false);
        }
    },[isLessText])

    return(
        <>
            {showButton && <button onClick={handleClick} className="btnText" style={{fontSize: "14px", fontWeight: "bolder"}}>{isExpanded ? "See less" : "See more..."}</button>}
        </>
    )
}