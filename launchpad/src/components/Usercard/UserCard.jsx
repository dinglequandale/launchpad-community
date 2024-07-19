import "./usercard.css";
import { VscAccount } from "react-icons/vsc";
import ConnectionBanner from "../Connectionbanner/ConnectionBanner";
import { useState } from "react";
import { FaLink } from "react-icons/fa6";

export default function UserCard({userData, onProfileClick}) {
    const [bannerVisibility, setBannerVisibility] = useState(false);

    // TODO: currently localStorage, transition to database
    const userType = "Professional";
    const userName = "Shuja Gupta";
    
    const descType = () => {
        switch(userType){
            case "High Schooler":
                return "Dream Colleges";
            case "Alumni":
                return "Attending College";
            case "Professional":
                return "Current Position";
            default:
                return "poo";
        }
    }
    console.log(userData)
    const [basicInfoData, setBasicInfoData] = useState({});
    // const [basicInfoModalVisibility, setBasicInfoModalVisibility] = useState(null);
    // useEffect(() => {
    //     const storedBasicInfoData = localStorage.getItem("userBasicInfo");
    //     if (storedBasicInfoData !== null) {
    //       setBasicInfoData(JSON.parse(storedBasicInfoData));
    //     }
    //     else{
    //     }
    //   }, [basicInfoModalVisibility,]);

    const basicInfoContent = {userPreface: userType === "Professional" ? `${basicInfoData.yearsOfExperience} years of experience in ${basicInfoData.industryOfExperience}`
    : userType === "Alumni" ? `Graduated with Class of [...]`
    : `[...], Class of [...]`,
    userFirstDesc: `Fields of ${userType !== "Professional" ? "Interest" : "Expertise"}: ${basicInfoData.areasOfInterest ?? basicInfoData.fieldsOfExpertise}`,
    userSecondDesc: `${descType()}: ${userType === "Professional" ? basicInfoData.industryPosition : userType === "Alumni" ? basicInfoData.attendingCollege : basicInfoData.dreamColleges}`,
    acceptedColleges: `Accepted Colleges: ${basicInfoData.acceptedColleges}`,
}

    return(
        <>
        <div className='networkProfileCard'>
            {bannerVisibility && <ConnectionBanner/>}
            <button style={{position: "absolute", right: "3%"}} className="btnText" onClick={onProfileClick}>
                See Profile
            </button>
            <div className='basicInfo'>
                <div>
                    <VscAccount size = {60} className='cardPfp'/>
                </div>
                <div className='cardNameDescription'>
                    <span className='cardName'>{userData.userName}</span>
                    <span className='cardDescription'>{basicInfoContent.userPreface}</span>
                </div>
                </div>
                <div style={{display: "flex"}}>
                <div className='userInfo' style={{fontSize: "16px"}}>
                    <span>{basicInfoContent.userFirstDesc}</span>
                    <span>{basicInfoContent.userSecondDesc}</span>
                    {basicInfoData.acceptedColleges && <span>{basicInfoContent.acceptedColleges}</span>}
                </div>
            </div>
            <button style={{width: "80%", borderRadius: "5px", margin: "0 auto"}}> 
                <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "6px"}}>
                    <FaLink size={20}/>
                    <span style={{fontWeight: "550"}}>Connect</span>
                </div>
            </button>
        </div>
        </>
    )
}