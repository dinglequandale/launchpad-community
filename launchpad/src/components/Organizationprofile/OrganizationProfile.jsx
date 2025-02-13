import "./organizationprofile.css";
import { RiMoneyDollarBoxLine } from "react-icons/ri";
import { RiGraduationCapLine } from "react-icons/ri";
import { GoBriefcase } from "react-icons/go";
import { SlCalender } from "react-icons/sl";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/auth/AuthContext";
import ReadMoreButton from "../ReadMorebutton/ReadMore";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { displayFieldsOfInterest } from "../../services/userProfileServices";

export default function OrganizationProfile({organizationData, location, handleShowProfile, handleReferalClick}){
    const logisticsList = [<RiMoneyDollarBoxLine/>, <RiGraduationCapLine/>, <GoBriefcase/>, <SlCalender/>]
    const [isDisabled, setIsDisabled] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLessText, setIsLessText] = useState(false);

    const { currentUser } = useAuth();

    const descRef = useRef();
    const [userData, setUserData] = useState(null);

    const getName = () => {
        if (organizationData.organizationName)
            return organizationData.organizationName;

        return `${organizationData.applicantPosition} at ${organizationData.organizationHostCompany}`;
    }

    const organizationProfileData = {
        organizationName: getName(),
        organizationType: organizationData.organizationType,
        organizationHost: organizationData.organizationHostCompany ?? organizationData.organizationHostStudent,
        organizationDescription: organizationData.applicantExpectations ?? organizationData.organizationMission,
        organizationLogistics: organizationData.isPaid ? [organizationData.isPaid,organizationData.applicants, organizationData.workLocation, organizationData.timeFrame] : null,
        organizationRelevanceTags: (organizationData.organizationTags && organizationData.organizationTags.length > 0) ? displayFieldsOfInterest(organizationData.organizationTags) : organizationData.applicantFieldOfWork ? (organizationData.applicantFieldOfWork + ", " + organizationData.applicantPosition) : null,
        organizationLogoPreview: organizationData.organizationLogoPreview ?? "/assets/awty-logo.jpg",
        organizationCreatedBy: organizationData.createdBy,
        organizationHostName: organizationData.createdByUserName,
        organizationLearnMoreMethod: organizationData.learnMore.split(": ")[0],
        organizationApplyMethod: organizationData.apply.split(": ")[0],
        organizationApply: organizationData.apply.split(": ")[1] ?? null,
        organizationLearnMore: organizationData.learnMore.split(": ")[1] ?? null,
        organizationDeadline: organizationData.deadline,
        organizationStartDate: organizationData.startDate,
    }

    const getUserData = async (userId) => {
        const userSnap = await getDoc(doc(db, "tenants", localStorage.getItem("schoolId"), "users", userId));
        if (userSnap.exists()) {
            setUserData({id: userSnap.id, ...userSnap.data()});
            } else {
                console.log("No such document!");
            }
    }

    useEffect(()=>{
        getUserData(organizationProfileData.organizationCreatedBy);
    },[])

    useEffect(()=>{
        if(descRef.current.clientHeight <= 16*8){
            setIsLessText(true);
        }
    },[organizationProfileData.organizationDescription])
    
    // check if user can click on the available buttons or not
    useEffect(()=>{
        if(!organizationData.createdBy && (location !== "organizations_page")){
            setIsDisabled(true);
        }
        else if((location !== "organizations_page") && (location !== "user_profile_public") && organizationData.createdBy === currentUser.uid){
            setIsDisabled(true);
            console.log("Disabled!")
        }
    },[])
    const handleOnHostClick = (e) => {
        e.preventDefault();
        if(handleShowProfile){
            handleShowProfile(userData);
            return;
        }
    }

    const connectBtnType = (orgType) => {
        switch(orgType){
            case "Club":
                return "Join";
            case "Shadowing":
            case "Job":
            case "Internship":
            case "Leadership":
                return "Apply";
            case "Nonprofit":
            case "Business":
                return "Contact Us";
            case "Community Service":
                return "Volunteer";
            default:
                return "Contact Us";
        }
    }

    const handleConnect = (e) => {
        e.preventDefault();
        // console.log("Connect data:", userData)
        handleReferalClick("apply", organizationProfileData, userData);
    }

    const handleLearnMore = (e) => {
        e.preventDefault();
        // console.log("Connect data:", userData)
        handleReferalClick("learnMore", organizationProfileData, userData);
    }

    const handleReadMoreClick = (e) => {
        e.preventDefault();
        setIsExpanded(!isExpanded);
    }

    return(
        <>
            <div className={`organizationProfileContainer ${location === "organizations_page" ? "" : (location === "user_profile" || location === "user_profile_public") ? "userProfile" : "opportunityPopup"}`} style={{position: "relative"}}>
                {organizationProfileData.organizationRelevanceTags && <RelevanceBanner organizationType={organizationProfileData.organizationType} relevanceType={organizationProfileData.organizationRelevanceTags}/>}
                <div style={{width: "75%", borderRightStyle: "solid", borderRightColor: "#C0C0C0", borderWidth: "1.5px", overflow: "hidden"}}>
                    <div style={{display: "flex"}}>
                        <div className="organizationPfp">
                            <img src={organizationProfileData.organizationLogoPreview} style={{width: "100px", width: "145px", height: "145px"}}/>
                        </div>
                        <div name="organizationContent" style={{padding: "0px 15px", paddingBottom: "11px", position: 'relative'}}>
                            <div ref={descRef} className={`organizationInfo ${isLessText ? '' : isExpanded ? 'expanded' : 'contracted'}`} style={{position: "relative"}}>
                                <span style={{fontWeight: "bolder", fontSize: "20px", lineHeight: "1.2"}}>{organizationProfileData.organizationName ?? organizationProfileData.organizationHost}</span> <br />
                                <span style={{fontWeight: "bold", color: "var(--secondary)", fontSize: "smaller"}}> {organizationProfileData.organizationType} {["Club", "Initiative", "Business"].includes(organizationProfileData.organizationType) ? "" : "opportunity"} </span>
                                <span style={{fontWeight: "300", fontSize: "smaller", lineHeight: "1"}}>{organizationProfileData.organizationHost ? "run by" : ""}&nbsp;</span>
                                <button className="btnText" onClick={(e) => handleOnHostClick(e)} disabled={isDisabled} style={{paddingBottom: "10px", cursor: `${isDisabled ? "not-allowed" : "pointer"}`}}>{organizationProfileData.organizationHostName}</button>
                                <br />
                                <div style={{lineHeight: "1"}}>
                                    {organizationProfileData.organizationDescription}
                                </div>
                                {(organizationProfileData.organizationDeadline || organizationProfileData.organizationStartDate) && <div style={{marginTop: "15px"}}>
                                    {organizationProfileData.organizationDeadline && <span><span style={{fontWeight: "600"}}>Application Deadline</span>: {(organizationProfileData.organizationDeadline)}<br /></span>}
                                    {organizationProfileData.organizationStartDate && <span><span style={{fontWeight: "600"}}>Start Date</span>: {(organizationProfileData.organizationStartDate)}</span>}
                                </div>}
                            </div>
                            <div style={{
                                position: "absolute", 
                                bottom: organizationProfileData.organizationLogistics ? "-10px" : "-6px", 
                                left: "15px", 
                                width: "calc(100% - 30px)", 
                                textAlign: "center",
                                zIndex: 2
                                }}>
                                <ReadMoreButton handleClick={handleReadMoreClick} isExpanded={isExpanded} isLessText={isLessText}/>
                            </div>
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
                <div style={{display: "flex", justifyContent: "center", alignItems: "center", width: "25%", flexDirection: "column", gap: "20px", marginLeft: "6px"}}>
                    <button className="btnOrganizationLearnMore btnConnect" onClick={e => handleLearnMore(e)} disabled={isDisabled} style={{cursor: `${isDisabled ? "not-allowed" : "pointer"}`}}> Learn More </button>
                    {(organizationData.apply !== "NOAPPLY") && <button className="btnOrganizationConnect btnUnfilled" onClick={e => handleConnect(e)} disabled={isDisabled} style={{cursor: `${isDisabled ? "not-allowed" : "pointer"}`}}> {connectBtnType(organizationData.organizationType)} </button>}
                </div>
            </div>
        </>
    )
}

function RelevanceBanner({relevanceType, organizationType}){
    return(
        <div style={{display: (relevanceType === "ALL") ? "none" : "", borderRadius: "20px", position: "absolute", top: "-16px", left: "10px", width: "fitContent", padding: "2px 8px", background: "rgb(47,162,52)",
            background: "linear-gradient(90deg, rgba(47,162,52,1) 48%, rgba(18,123,22,1) 100%)", zIndex: "1"}}>
            <span style={{color: "white", fontWeight: "600"}}>{["Shadowing", "Job", "Internship"].includes(organizationType) ? "Target fields:" : ""} {relevanceType} </span>
        </div>
    )
}