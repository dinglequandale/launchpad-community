import "./editprofilepage.css";
import EditProfileCard from "../../components/EditProfilecard/EditProfileCard"
import TopBar from "../../components/Topbar/TopBar";
import SideNav from "../../components/Sidenav/SideNav";

export default function EditProfilePage(){
    return(
        <>
            <TopBar/>
            <SideNav/>
            <div className='editProfilePageContainer' style={{paddingTop: "6%", paddingLeft: "16%", paddingRight: "6%", paddingBottom: "40px", alignItems: "center"}}>
                <EditProfileCard/>
            </div>
        </>
        
    )
}