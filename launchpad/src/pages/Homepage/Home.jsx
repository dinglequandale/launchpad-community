import "./home.css";
import TopBar from "../../components/Topbar/TopBar";
import SideNav from "../../components/Sidenav/SideNav";
import ReactPlayer from "react-player";

export default function Home({userData}){

    const userName = "Username";

    return(
        <>
            <TopBar/>
            <SideNav/>
            <div className='homeContainer' style={{paddingTop: "3%", paddingLeft: "14%", paddingRight: "4%"}}>
                <div style={{paddingTop: "20px"}}>
                    <InviteContacts userName={userName}/>
                </div>
                <div style={{display: "flex", gap: "20px", paddingTop: "20px"}}>
                    <div className="launchpadIntro" style={{padding: "10px", backgroundColor: "white", width: ""}}>
                        <span style={{fontWeight: "600", paddingBottom: "20px"}}>Welcome to Launchpad! <span style={{fontSize: "smaller", fontWeight:"400"}}>(Watch Full Video)</span></span>
                        <ReactPlayer
                            url='https://www.youtube.com/watch?v=uhnxWBqVvbY'
                            width='100%'
                            height='100%'
                            controls={true}/>
                    </div>
                    <div>

                    </div>
                </div>
            </div>
        </>
    )
}

function InviteContacts({userName}){
    return(
        <div style={{position: "relative", padding: "15px", margin: "0 auto", width: "90%", backgroundColor: "#73a9df", height: "fitContent", borderRadius: "5px", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.09)"}}>
            <span> &emsp; Hey, {userName}!</span> <br />
            <span>&emsp; &emsp; &emsp; Know any college students or working professionals not on the app? Invite them below!</span>
            <div style={{display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "15px"}}>
                <button style={{borderRadius: "10px", color: "white", fontWeight: "bold", fontSize: "17px", padding: "10px"}}>Invite Contacts</button>
            </div>
        </div>
    )
}