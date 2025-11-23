import "./EditProfilePage.css";
import EditProfileCard from "../../components/EditProfilecard/EditProfileCard"
import TopBar from "../../components/Topbar/TopBar";
import SideNav from "../../components/Sidenav/SideNav";
import { useState, useEffect } from "react";

export default function EditProfilePage(){
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Listen for sidebar state changes
    useEffect(() => {
        const handleSidebarToggle = (event) => {
            const isCollapsed = event.detail.isCollapsed;
            setIsSidebarCollapsed(isCollapsed);
        };

        // Initial check - get current state from DOM
        const sidebar = document.querySelector('.v0-sidebar');
        if (sidebar) {
            const isCollapsed = sidebar.classList.contains('v0-sidebar-collapsed');
            setIsSidebarCollapsed(isCollapsed);
        }

        // Listen for custom sidebar toggle events
        window.addEventListener('sidebarToggle', handleSidebarToggle);

        return () => {
            window.removeEventListener('sidebarToggle', handleSidebarToggle);
        };
    }, []);

    return(
        <>
            <TopBar isSidebarCollapsed={isSidebarCollapsed}/>
            <SideNav/>
            <div className={`editProfilePageContainer ${isSidebarCollapsed ? 'editprofile-sidebar-collapsed' : 'editprofile-sidebar-expanded'}`} style={{paddingTop: "6%", paddingLeft: "16%", paddingRight: "6%", paddingBottom: "40px", alignItems: "center"}}>
                <EditProfileCard isSidebarCollapsed={isSidebarCollapsed}/>
            </div>
        </>
        
    )
}