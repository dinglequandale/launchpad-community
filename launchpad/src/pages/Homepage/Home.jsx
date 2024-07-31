import "./home.css";
import TopBar from "../../components/Topbar/TopBar";
import SideNav from "../../components/Sidenav/SideNav";
import ReactPlayer from "react-player";
import ProfileStrength from "../../components/Profilestrength/ProfileStrength";
import { FaArrowCircleDown } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function Home(){

    const [userBasicInfo, setUserBasicInfo] = useState(null);

    useEffect(()=>{
        const storedUserBasicInfo = localStorage.getItem("basicUserInfo");
        setUserBasicInfo(JSON.parse(storedUserBasicInfo));
    },[]);

    console.log(userBasicInfo)

    const resourceSections = ["How-To Network", "Discover Your Career", "SAT/ACT Study Tips", "Launchpad Help"];
    const tutorialData = [
        {
            tutorialName: "Overview: Why Network?",
            tutorialVideoLink: "https://www.youtube.com/watch?v=uhnxWBqVvbY",
            tutorialPresentationLink: "https://docs.google.com/document/d/1hckUNRFHGQvIKBQiz2FqFK2bFQrPpor5GzZPtfJ6Mc8/edit#heading=h.xk8nbj32eu9r",
            highlyRecommended: false
        },
        {
            tutorialName: "How to Network",
            tutorialVideoLink: "https://www.youtube.com/watch?v=IIoVUIwsJRM",
            tutorialPresentationLink: "https://docs.google.com/document/d/1hckUNRFHGQvIKBQiz2FqFK2bFQrPpor5GzZPtfJ6Mc8/edit#heading=h.xk8nbj32eu9r",
            highlyRecommended: true
        },
        {
            tutorialName: "Finding and Applying to Internships",
            tutorialVideoLink: "https://www.youtube.com/watch?v=xFrqZjIDE44",
            tutorialPresentationLink: "https://docs.google.com/document/d/1hckUNRFHGQvIKBQiz2FqFK2bFQrPpor5GzZPtfJ6Mc8/edit#heading=h.xk8nbj32eu9r",
            highlyRecommended: false
        }
    ]

    return(
        <>
            <TopBar/>
            <SideNav/>
            <div className='homeContainer' style={{paddingTop: "5%", paddingLeft: "16%", paddingRight: "6%", paddingBottom: "40px"}}>
                <div style={{paddingTop: "20px"}}>
                    {userBasicInfo && <InviteContacts userName={userBasicInfo.userName.split(" ")[0] ?? "user"}/>}
                </div>
                <div style={{display: "flex", paddingTop: "30px", position: "relative", width: "fitParent", height: "400px"}}>
                    <div className="launchpadIntro" style={
                        {padding: "10px", backgroundColor: "white", width: "53%", borderRadius: "10px",
                            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.09)"}
                    }>
                        <span style={
                            {fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center",
                                 borderBottomStyle: "solid", paddingBottom: "5px", borderColor: "#C0C0C0", borderWidth: "1px"}
                            }>
                            Welcome to Launchpad! &nbsp; <span style={{fontSize: "smaller", fontWeight:"400"}}>(Watch Full Video)</span>
                        </span>
                        <div style={{paddingTop: "15px", height: "330px"}}>
                            <ReactPlayer
                                url='https://www.youtube.com/watch?v=uhnxWBqVvbY'
                                width='100%'
                                height='100%'
                                controls={true}/>
                        </div>
                    </div>
                    <div style={
                        {padding: "10px", backgroundColor: "white", width: "40%", marginLeft: "auto", borderRadius: "10px",
                            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.09)"}
                        }>
                        <ProfileStrength userData={userBasicInfo}/>
                    </div>
                </div>
                <div className="resourceCenter">
                    <h2>Resource Center</h2>
                    <div style={
                        {display:"flex", alignItems: "center", justifyContent: "center", gap: "40px",
                        borderBottomStyle: "solid", borderColor: "#C0C0C0", paddingBottom: "20px"}}>
                        {resourceSections.map((resourceType, index)=>(
                            <ResourceItem resourceType={resourceType} key={index}/>
                        ))}
                    </div>
                    <h3>How-To Network <span style={{fontWeight: "400", fontSize: "smaller"}}>(overview with frameworks and scripts)</span></h3>
                    <span style={{display: "flex", justifyContent: "center", fontSize: "25px", fontWeight: "200"}}>Articles, Presentations, and Videos</span>
                    <div style={{display: "flex", gap: "30px", justifyContent: "center", paddingTop: "20px"}}>
                        {tutorialData.map((tutorial, index)=>(
                            <TutorialDisplay 
                                key={index}
                                tutorialVideoLink={tutorial.tutorialVideoLink} 
                                tutorialPresentationLink={tutorial.tutorialPresentationLink}
                                title={tutorial.tutorialName}
                                highlyRecommended={tutorial.highlyRecommended}/>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

function InviteContacts({userName}){
    return(
        <div style={
            {textAlign: "center", position: "relative", padding: "15px", margin: "0 auto", width: "fitParent", backgroundColor: "#bae7ec",
         height: "fitContent", borderRadius: "5px", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.09)", border: "solid 1.4px var(--secondary)"}
         }>
            <span style={{fontSize: "18.5px", fontWeight: "350"}}><span style={{fontSize: "28px", fontWeight: "bolder", color: "var(--secondary)"}}>Hey, {userName}!</span> <br /> Know any <span style={{textDecoration: "underline", color: "var(--secondary)"}}>college students </span>or <span style={{textDecoration: "underline", color: "var(--secondary)"}}>working professionals</span> not on the app? Invite them below!</span>
            <div style={{display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "15px"}}>
                <button className="btnUnfilled" style={{borderRadius: "10px", background: "var(--primary)", fontWeight: "550", fontSize: "20px", padding: "10px", width: "200px"}}>Invite Contacts</button>
            </div>
        </div>
    )
}

function ResourceItem({resourceType}){
    return(
        <button className="resourceItem">
            <span style={{padding: "5px", fontSize: "larger"}}>{resourceType}</span>
            <FaArrowCircleDown color="grey" size={20}/>
        </button>
    )
}

function TutorialDisplay({tutorialVideoLink, tutorialPresentationLink, title, highlyRecommended}){
    return(
        <div style={{position: "relative", padding: "10px", width: "30%",
            backgroundColor: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.09)", borderRadius: "5px"}}>
            {highlyRecommended && <ImportanceBanner/>}
            <span style={{display: "flex", justifyContent: "center", fontWeight: "bolder"}}>{title}</span>
            <div style={{paddingTop: "10px", height: "200px"}}>
                <ReactPlayer
                    url={tutorialVideoLink}
                    width='100%'
                    height='100%'
                    controls={true}/>
            </div>
            <span style={{display: "flex", justifyContent: "center", paddingTop: "5px"}}> To access presentation, click &nbsp;<a href={tutorialPresentationLink} style={{textDecoration: "underline"}}>here. </a> </span>
        </div>
    )
}

function ImportanceBanner(){
    return(
        <div style={{borderRadius: "20px", position: "absolute", top: "-15px", left: "10px", width: "fitContent", padding: "4px 8px", background: "rgb(47,162,52)",
            background: "linear-gradient(90deg, rgba(47,162,52,1) 48%, rgba(18,123,22,1) 100%)", zIndex: "1"}}>
            <span style={{color: "white", fontWeight: "600"}}>Highly Recommended!</span>
        </div>
    )
}