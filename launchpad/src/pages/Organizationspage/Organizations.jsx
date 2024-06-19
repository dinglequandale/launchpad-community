import { useState } from "react";
import "./organizations.css"
import SearchBar from "../../components/Searchbar/SearchBar";
import SideNav from "../../components/Sidenav/SideNav";
import TopBar from "../../components/Topbar/TopBar";
import OrganizationProfile from "../../components/Organizationprofile/OrganizationProfile";

export default function Organizations(){

    const pageName = "Organizations";

    const filterContent = [
        ["Any Category",["Community Service", "Clubs", "Workplace Opportunities"]],
        ["Relevant Fields of Interest",["Any Field of Interest"]]
    ]

    const [sideNavVisibility, setSideNavVisibility] = useState(false);

    const onBurgerPress = () => {
        setSideNavVisibility(!sideNavVisibility);
      }

    return(
        <>
            <TopBar onBurgerPress={onBurgerPress}/>
            <SideNav show={sideNavVisibility}/>
            <div className='organizationsContainer'>
                <SearchBar filters = {filterContent} pageName = {pageName}/> 
            </div>
            <div style={{display: "flex", margin: "0 auto", flexDirection: "column", gap: "40px", paddingTop: "40px"}}>
                <OrganizationProfile/>
                <OrganizationProfile/>
                <OrganizationProfile/>
                <OrganizationProfile/>
                <OrganizationProfile/>
                <OrganizationProfile/>
            </div>
        </>
        
    )
}