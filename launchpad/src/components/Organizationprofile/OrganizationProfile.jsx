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

    const organizationProfileData = {
        organizationName: organizationData.organizationName ?? organizationHostCompany,
        organizationType : organizationData.organizationType,
        organizationHost : organizationData.organizationHostCompany ?? organizationData.organizationHostStudent,
        organizationDescription: organizationData.applicantExpectations ?? organizationData.organizationMission,
        organizationLogistics: organizationData.isPaid ? [organizationData.isPaid,organizationData.applicants, organizationData.workLocation, organizationData.timeFrame] : null,
        organizationRelevanceTags: organizationData.organizationTags ?? (organizationData.applicantFieldOfWork + ", " + organizationData.applicantPosition),
        organizationLogoPreview: organizationData.organizationLogoPreview ?? "https://thebuzzmagazines.com/sites/default/files/events/2021/08/awty_logo_sep16.jpg",
    }

    useEffect(() => {
        document.addEventListener("keydown", onKeyPress, true)
      }, [])
    
      const onKeyPress = (e) => {
        if(e.key === "Escape"){
          setShowPfpCard(false);
        }
      }

    const handleOnHostClick = (e) => {
        e.preventDefault();
        if(location === "organizations_page"){
            setShowPfpCard(true)
        }
    }

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
                {organizationProfileData.organizationRelevanceTags && <RelevanceBanner relevanceType={organizationProfileData.organizationRelevanceTags}/>}
                <div style={{width: "75%", borderRightStyle: "solid", borderRightColor: "#C0C0C0", borderWidth: "1.5px", overflow: "hidden"}}>
                    <div style={{display: "flex", position: "relative"}}>
                        <img src={organizationProfileData.organizationLogoPreview} alt="bruh" 
                        className="organizationPfp"/>
                        <div style={{paddingLeft: "15px", lineHeight: "1.2"}}>
                            <span style={{fontWeight: "bolder", fontSize: "20px", lineHeight: "1.5"}}>{organizationProfileData.organizationName ?? organizationProfileData.organizationHost}</span> <br />
                            <div style={{display: "flex"}}>
                                <span style={{fontWeight: "300", fontSize: "smaller", lineHeight: "1"}}>
                                    <span style={{fontWeight: "bold", color: "var(--secondary)"}}> {organizationProfileData.organizationType} {["Club", "Initiative"].includes(organizationProfileData.organizationType) ? "" : "opportunity"} </span> run by&nbsp;
                                </span>
                                <button className="btnText" onClick={(e) => handleOnHostClick(e)}>{organizationProfileData.organizationHost}</button>
                            </div>
                            <br />
                            <span name="organizationDescription">{organizationProfileData.organizationDescription}</span>
                        </div>
                    </div>

                    {organizationProfileData.organizationLogistics && <div className="logisticsDisplay">
                        {logisticsList.map((logistic, index)=>(
                            <div key={index} className="logisticOption">
                                {logistic}
                                <span style={{fontWeight: "300"}}>{organizationProfileData.organizationLogistics[index]}</span>
                            </div>
                        ))}
                    </div>}
                </div>
                <div style={{display: "flex", justifyContent: "center", alignItems: "center", width: "25%", flexDirection: "column", gap: "20px"}}>
                    <button className="btnOrganizationLearnMore" onClick={e => handleLearnMore(e)}> Learn More </button>
                    <button className="btnOrganizationConnect" onClick={e => handleConnect(e)}> {organizationProfileData.organizationType==="Volunteering" ? "Volunteer" : ["Club","Nonprofit"].includes(organizationProfileData.organizationType) ? "Join" : "Connect"} </button>
                </div>
            </div>
        </>
    )
}

function RelevanceBanner({relevanceType}){
    return(
        <div style={{borderRadius: "20px", position: "absolute", top: "-15px", left: "10px", width: "fitContent", padding: "4px 8px", background: "rgb(47,162,52)",
            background: "linear-gradient(90deg, rgba(47,162,52,1) 48%, rgba(18,123,22,1) 100%)", zIndex: "1"}}>
            <span style={{color: "white", fontWeight: "600"}}>For {relevanceType} </span>
        </div>
    )
}