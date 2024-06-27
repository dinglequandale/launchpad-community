import { useState } from "react";
import "./organizations.css"
import SearchBar from "../../components/Searchbar/SearchBar";
import SideNav from "../../components/Sidenav/SideNav";
import TopBar from "../../components/Topbar/TopBar";
import OrganizationProfile from "../../components/Organizationprofile/OrganizationProfile";

export default function Organizations(){
    const organizationsData = [
        {
            id: Math.random(10**5),
            organizationType: "Club",
            organizationName: "Financial Literacy Club",
            organizationHost: "Juan Gallo Bonilla",
            organizationDescription: "Description Description Description Description Description Description",
            prganizationImage: "Image src",
            organizationLogistics: null,
            organizationTags: ["engineering", "fortnite"],
            organizationLearnMore: null,
        },
        {
            id: Math.random(10**5),
            organizationType: "Community Service",
            organizationName: "Houston Food Bank",
            organizationHost: null,
            organizationDescription: "Description Description Description Description Description Description",
            prganizationImage: "Image src",
            organizationLogistics: null,
            organizationTags: null,
            organizationLearnMore: null,
        },
        {
            id: Math.random(10**5),
            organizationType: "Organization_Type",
            organizationName: "Organization_Name",
            organizationHost: null,
            organizationDescription: "Description Description Description Description Description Description",
            prganizationImage: "Image src",
            organizationLogistics: ["Unpaid", null, "On-site", null],
            organizationTags: null,
            organizationLearnMore: null,
        },
        {
            id: Math.random(10**5),
            organizationType: "Organization_Type",
            organizationName: "Organization_Name",
            organizationHost: null,
            organizationDescription: "Description Description Description Description Description Description",
            prganizationImage: "Image src",
            organizationLogistics: ["Paid", "High School", "On-site", "Seasonal (Full-time)"],
            organizationTags: ["theatre", "arts", "leadership"],
            organizationLearnMore: null,
        },
        {
            id: Math.random(10**5),
            organizationType: "Organization_Type",
            organizationName: "Organization_Name",
            organizationHost: null,
            organizationDescription: "Description Description Description Description Description Description",
            prganizationImage: "Image src",
            organizationLogistics: null,
            organizationTags: null,
            organizationLearnMore: null,
        },
    ]


    const pageName = "Organizations";

    const filterContent = [
        ["Any Category","Community Service", "Student Clubs", "Workplace Opportunities"],
        ["Any Field of Interest", "Relevant Fields of Interest"]
    ]

    return(
        <>
            <TopBar/>
            <div style={{paddingTop: "3%"}}>
                <SideNav/>
            </div>
            <div style={{paddingLeft:"10%"}}>
                <div className='organizationsContainer'>
                        <SearchBar filters = {filterContent} pageName = {pageName}/> 
                    </div>
                    <div style={{display: "flex", margin: "0 auto", flexDirection: "column", gap: "40px", paddingTop: "40px", paddingBottom: "40px"}}>
                        {organizationsData.map((organization, index)=>(
                            <OrganizationProfile key={index} organizationData={organization} location={"organizations_page"}/>
                        ))}
                </div>
            </div>
                
        </>
        
    )
}