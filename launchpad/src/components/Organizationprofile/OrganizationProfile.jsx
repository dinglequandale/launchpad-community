import "./organizationprofile.css";
import { RiMoneyDollarBoxLine } from "react-icons/ri";
import { RiGraduationCapLine } from "react-icons/ri";
import { GoBriefcase } from "react-icons/go";
import { SlCalender } from "react-icons/sl";
import { useState, useEffect } from "react";
import ProfileModal from "../Profilemodal/ProfileModal";
import { useAuth } from "../../contexts/auth/AuthContext";

export default function OrganizationProfile({organizationData, location}){
    const logisticsList = [<RiMoneyDollarBoxLine/>, <RiGraduationCapLine/>, <GoBriefcase/>, <SlCalender/>]
    const [showPfpCard, setShowPfpCard] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);

    const { currentUser } = useAuth();

    const organizationProfileData = {
        organizationName: organizationData.organizationName ?? organizationData.organizationHostCompany,
        organizationType : organizationData.organizationType,
        organizationHost : organizationData.organizationHostCompany ?? organizationData.organizationHostStudent,
        organizationDescription: organizationData.applicantExpectations ?? organizationData.organizationMission,
        organizationLogistics: organizationData.isPaid ? [organizationData.isPaid,organizationData.applicants, organizationData.workLocation, organizationData.timeFrame] : null,
        organizationRelevanceTags: organizationData.organizationTags ?? (organizationData.applicantFieldOfWork + ", " + organizationData.applicantPosition),
        organizationLogoPreview: organizationData.organizationLogoPreview ?? "/assets/awty-logo.jpg",
    }

    useEffect(() => {
        document.addEventListener("keydown", onKeyPress, true)
      }, [])
    
      const onKeyPress = (e) => {
        if(e.key === "Escape"){
          setShowPfpCard(false);
        }
      }

    
    // check if user can click on the available buttons or not
    useEffect(()=>{
        if(!organizationData.createdBy){
            setIsDisabled(true);
        }
        else if(location !== "organizations_page" && organizationData.createdBy === currentUser.uid){
            setIsDisabled(true);
            console.log("Disabled!")
        }
    },[])
    const handleOnHostClick = (e) => {
        e.preventDefault();
        setShowPfpCard(true)
    }

    const handleConnect = (e) => {
        e.preventDefault();
        // TODO: input connect logic here
    }

    const handleLearnMore = (e) => {
        e.preventDefault();
        // input learn more logic here
    }

    return(
        <>
            {showPfpCard && <ProfileModal onClose={() => setShowPfpCard(false)}/>}
            <div className={`organizationProfileContainer ${location === "organizations_page" ? "" : location === "user_profile" ? "userProfile" : "opportunityPopup"}`} style={{position: "relative"}}>
                {organizationProfileData.organizationRelevanceTags && <RelevanceBanner relevanceType={organizationProfileData.organizationRelevanceTags}/>}
                <div style={{width: "75%", borderRightStyle: "solid", borderRightColor: "#C0C0C0", borderWidth: "1.5px", overflow: "hidden"}}>
                    <div style={{display: "flex", position: "relative"}}>
                        <div className="organizationPfp">
                            <img src={organizationProfileData.organizationLogoPreview} style={{width: "100px", width: "145px", height: "145px"}}/>
                        </div>
                        <div style={{padding: "0px 15px", lineHeight: "1.2"}}>
                            <span style={{fontWeight: "bolder", fontSize: "20px", lineHeight: "1.5"}}>{organizationProfileData.organizationName ?? organizationProfileData.organizationHost}</span> <br />
                            <span style={{fontWeight: "bold", color: "var(--secondary)", fontSize: "smaller"}}> {organizationProfileData.organizationType} {["Club", "Initiative"].includes(organizationProfileData.organizationType) ? "" : "opportunity"} </span>
                            <span style={{fontWeight: "300", fontSize: "smaller", lineHeight: "1"}}>run by&nbsp;</span>
                            <button className="btnText" onClick={(e) => handleOnHostClick(e)} disabled={isDisabled} style={{paddingBottom: "10px"}}>{organizationProfileData.organizationHost}</button>
                            <br />
                            <span name="organizationDescription" style={{fontSize: "14px", lineHeight: "1"}}>{organizationProfileData.organizationDescription}</span>
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
                    <button className="btnOrganizationLearnMore" onClick={e => handleLearnMore(e)} disabled={isDisabled}> Learn More </button>
                    <button className="btnOrganizationConnect" onClick={e => handleConnect(e)} disabled={isDisabled}> {organizationProfileData.organizationType==="Volunteering" ? "Volunteer" : ["Club","Nonprofit"].includes(organizationProfileData.organizationType) ? "Join" : "Connect"} </button>
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