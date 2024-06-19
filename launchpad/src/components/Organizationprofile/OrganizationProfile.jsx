import "./organizationprofile.css";
import { RiMoneyDollarBoxLine } from "react-icons/ri";
import { RiGraduationCapLine } from "react-icons/ri";
import { GoBriefcase } from "react-icons/go";
import { SlCalender } from "react-icons/sl";

export default function OrganizationProfile({organizationData}){
    const paymentStatus = "Unpaid";
    const educationLevel = "High School";
    const type = "On-site";
    const timePeriod = "Seasonal (Full-time)"
    return(
        <div className="organizationProfileContainer">
            <div style={{width: "75%", borderRightStyle: "solid", borderRightColor: "#C0C0C0", borderWidth: "1.5px", overflow: "hidden"}}>
                <div style={{display: "flex", position: "relative", justifyContent: "center", alignItems: "center"}}>
                    <img src="https://purepng.com/public/uploads/large/big-chungus-jkg.png" alt="display image" style={{borderStyle: "solid", width: "145px", height: "145px"}} />
                    <div style={{paddingLeft: "15px"}}>
                        <span style={{fontWeight: "bolder", fontSize: "20px"}}>Houston Food Bank </span> <br />
                        <span style={{fontWeight: "300", fontSize: "smaller"}}> Description 1 </span> <br /> <br />
                        
                        <span>blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah</span>
                    </div>
                </div>
                <div style={{display: "flex", justifyContent: "space-evenly", paddingTop: "10px"}}>
                    <div style={{display: "flex", gap: "5px", alignItems: "center", justifyContent: "center"}}>
                        <RiMoneyDollarBoxLine size={20} color="gray"/>
                        <span style={{fontWeight: "300"}}>{paymentStatus}</span>
                    </div>
                    <div style={{display: "flex", gap: "5px", alignItems: "center", justifyContent: "center"}}>
                        <RiGraduationCapLine size={20} color="gray"/>
                        <span style={{fontWeight: "300"}}>{educationLevel}</span>
                    </div>
                    <div style={{display: "flex", gap: "5px", alignItems: "center", justifyContent: "center"}}>
                        <GoBriefcase size={20} color="gray"/>
                        <span style={{fontWeight: "300"}}>{type}</span>
                    </div>
                    <div style={{display: "flex", gap: "5px", alignItems: "center", justifyContent: "center"}}>
                        <SlCalender size={20} color="gray"/>
                        <span style={{fontWeight: "300"}}>{timePeriod}</span>
                    </div>
                </div>
            </div>
            <div style={{display: "flex", justifyContent: "center", alignItems: "center", width: "25%", flexDirection: "column", gap: "20px"}}>
                <button className="btnOrganizationConnect"> Learn More </button>
                <button className="btnOrganizationLearnMore"> Connect </button>
            </div>
        </div>
    )
}