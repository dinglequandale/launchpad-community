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
            {showButton && <button onClick={handleClick} className="btnText diff-color" style={{bottom: "4px", fontSize: "14px", fontWeight: "bolder"}}>{isExpanded ? "Show less" : "Show more ..."}</button>}
        </>
    )
}