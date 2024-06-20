import "./organizationprofile.css";
import { RiMoneyDollarBoxLine } from "react-icons/ri";
import { RiGraduationCapLine } from "react-icons/ri";
import { GoBriefcase } from "react-icons/go";
import { SlCalender } from "react-icons/sl";
import { useState, useEffect } from "react";
import ProfileCard from "../Profilecard/ProfileCard";

export default function OrganizationProfile({organizationData}){
    const logisticsList = [<RiMoneyDollarBoxLine/>, <RiGraduationCapLine/>, <GoBriefcase/>, <SlCalender/>]
    const [showPfpCard, setShowPfpCard] = useState(false);

    useEffect(() => {
        document.addEventListener("keydown", onKeyPress, true)
      }, [])
    
      const onKeyPress = (e) => {
        if(e.key === "Escape"){
          setShowPfpCard(false);
        }
      }

    const handleOrganizationDesc = (organizationType, organizationHost) => {
        if(organizationHost && (organizationType==="Club" || organizationType == "Initiative")){
            return <span>{organizationType} led by <span style={{
                textDecoration: "underline",
                color: "rgb(115, 169, 223)",
                cursor:"pointer"}}
            onClick={()=>handleOnHostClick(organizationHost)}
            >{organizationHost}</span> </span>;
        } else if (organizationHost){
            return `${organizationType} overseen by ${organizationHost}`;
        }
        else{
            return organizationType;
        }
    }

    const handleOnHostClick = () => (
        setShowPfpCard(true)
    )

    return(
        <>
            {showPfpCard && <ProfileCard onClose={() => setShowPfpCard(false)}/>}
            <div className="organizationProfileContainer" style={{position: "relative"}}>
                {organizationData.organizationTags && <RelevanceBanner relevanceType={organizationData.organizationTags}/>}
                <div style={{width: "75%", borderRightStyle: "solid", borderRightColor: "#C0C0C0", borderWidth: "1.5px", overflow: "hidden"}}>
                    <div style={{display: "flex", position: "relative", justifyContent: "center", alignItems: "center"}}>
                        <img src="https://purepng.com/public/uploads/large/big-chungus-jkg.png" alt="display image" 
                        style={{borderStyle: "solid", width: "145px", height: "145px"}} />
                        <div style={{paddingLeft: "15px"}}>
                            <span style={{fontWeight: "bolder", fontSize: "20px"}}>{organizationData.organizationName}</span> <br />
                            <span style={{fontWeight: "300", fontSize: "smaller"}}>{
                                handleOrganizationDesc(organizationData.organizationType, organizationData.organizationHost)
                            }</span> <br /> <br />
                            
                            <span>blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah</span>
                        </div>
                    </div>
                    {organizationData.organizationLogistics && <div style={{display: "flex", justifyContent: "space-evenly", paddingTop: "10px"}}>
                        {logisticsList.map((logistic, index)=>(
                            <div key={index} className={organizationData.organizationLogistics[index] ? "logisticOption" : "logisticOption hidden"}>
                                {logistic}
                                <span style={{fontWeight: "300"}}>{organizationData.organizationLogistics[index]}</span>
                            </div>
                        ))}
                    </div>}
                </div>
                <div style={{display: "flex", justifyContent: "center", alignItems: "center", width: "25%", flexDirection: "column", gap: "20px"}}>
                    <button className="btnOrganizationConnect"> Learn More </button>
                    <button className="btnOrganizationLearnMore"> {organizationData.organizationType==="Community Service" ? "Volunteer" : "Connect"} </button>
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