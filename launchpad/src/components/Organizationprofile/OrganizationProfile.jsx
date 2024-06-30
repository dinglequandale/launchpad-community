import "./organizationprofile.css";
import { RiMoneyDollarBoxLine } from "react-icons/ri";
import { RiGraduationCapLine } from "react-icons/ri";
import { GoBriefcase } from "react-icons/go";
import { SlCalender } from "react-icons/sl";
import { useState, useEffect } from "react";
import ProfileCard from "../Profilecard/ProfileCard";

export default function OrganizationProfile({organizationData, location}){
    const logisticsList = [<RiMoneyDollarBoxLine/>, <RiGraduationCapLine/>, <GoBriefcase/>, <SlCalender/>]
    const [showPfpCard, setShowPfpCard] = useState(false);
    let organizationLogistics = [organizationData.isPaid,organizationData.applicants, organizationData.workLocation, organizationData.timeFrame]
    useEffect(() => {
        document.addEventListener("keydown", onKeyPress, true)
      }, [])
    
      const onKeyPress = (e) => {
        if(e.key === "Escape"){
          setShowPfpCard(false);
        }
      }

    const handleOnHostClick = () => (
        setShowPfpCard(true)
    )

    const handleConnect = (e) => {
        e.preventDefault();
        if(location === "organizations_page"){
            // input connect logic here
        }
    }

    const handleLearnMore = (e) => {
        e.preventDefault();
        if(location === "organizations_page"){
            // input learn more logic here
        }
    }

    return(
        <>
            {showPfpCard && <ProfileCard onClose={() => setShowPfpCard(false)}/>}
            <div className={`organizationProfileContainer ${location === "organizations_page" ? "" : location === "user_profile" ? "userProfile" : "opportunityPopup"}`} style={{position: "relative"}}>
                {organizationData.organizationTags && <RelevanceBanner relevanceType={organizationData.organizationTags}/>}
                <div style={{width: "75%", borderRightStyle: "solid", borderRightColor: "#C0C0C0", borderWidth: "1.5px", overflow: "hidden"}}>
                    <div style={{display: "flex", position: "relative", justifyContent: "center", alignItems: "center"}}>
                        <img src={organizationData.organizationLogoPreview ? organizationData.organizationLogoPreview : "https://thebuzzmagazines.com/sites/default/files/events/2021/08/awty_logo_sep16.jpg"} alt="bruh" 
                        style={{borderStyle: "solid", borderColor: "var(--secondary)", width: "145px", height: "145px", objectFit: "cover"}} />
                        <div style={{paddingLeft: "15px", lineHeight: "1.2"}}>
                            <span style={{fontWeight: "bolder", fontSize: "20px", lineHeight: "1.5"}}>{organizationData.host}</span> <br />
                            <span style={{fontWeight: "300", fontSize: "smaller", lineHeight: "1"}}>
                                <span style={{fontWeight: "bolder", color: "var(--secondary)"}}>{organizationData.organizationType}</span>  {["Club", "Initiative"].includes(organizationData.organizationType) ? "" : "opportunity"} run by {organizationData.host}
                            </span> <br /> <br />
                            <span>{["Shadowing", "Internship", "Community Service"].includes(organizationData.organizationType) ? organizationData.internExpectations : ""}</span>
                        </div>
                    </div>
                    {organizationLogistics && <div style={{display: "flex", justifyContent: "space-evenly", paddingTop: "10px"}}>
                        {logisticsList.map((logistic, index)=>(
                            <div key={index} style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "5px"}}>
                                {logistic}
                                <span style={{fontWeight: "300"}}>{organizationLogistics[index]}</span>
                            </div>
                        ))}
                    </div>}
                </div>
                <div style={{display: "flex", justifyContent: "center", alignItems: "center", width: "25%", flexDirection: "column", gap: "20px"}}>
                    <button className="btnOrganizationLearnMore" onClick={e => handleLearnMore(e)}> Learn More </button>
                    <button className="btnOrganizationConnect" onClick={e => handleConnect(e)}> {organizationData.organizationType==="Community Service" ? "Volunteer" : "Connect"} </button>
                </div>
            </div>
        </>
    )
}

function RelevanceBanner({relevanceType}){
    return(
        <div style={{borderRadius: "20px", position: "absolute", top: "-15px", left: "10px", width: "fitContent", padding: "4px 8px", background: "rgb(47,162,52)",
            background: "linear-gradient(90deg, rgba(47,162,52,1) 48%, rgba(18,123,22,1) 100%)", zIndex: "1"}}>
            <span style={{color: "white", fontWeight: "600"}}>For finance, business fields </span>
        </div>
    )
}