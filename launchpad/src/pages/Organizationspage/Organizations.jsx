import { useState } from "react";
import "./organizations.css"
import SearchBar from "../../components/Searchbar/SearchBar";
import SideNav from "../../components/Sidenav/SideNav";
import TopBar from "../../components/Topbar/TopBar";
import OrganizationProfile from "../../components/Organizationprofile/OrganizationProfile";

export default function Organizations(){
    const [organizationData, setOrganizationData] = useState({
        organizationType: '',
        organizationHostStudent: '',
        applicantFieldOfWork: '',
        applicantPosition: '',
        applicantExpectations: '',
        isPaid: 'Unpaid',
        applicants: 'Either One',
        workLocation: 'On-site',
        timeFrame: 'One Week',
        learnMore: '',
        apply: '',
        organizationLogo: null,
        organizationLogoPreview: '',
      });
    const organizationsData = [
        {
            // initiative data format
            id: Math.random(10**5),
            organizationType: "Club",
            organizationName: "Financial Literacy Club",
            organizationHostStudent: "Juan Gallo Bonilla",
            organizationMission: "Description Description Description Description Description Description",
            organizationTags: ["engineering", "fortnite"],
            learnMore: '',
            apply: '',
            organizationLogo: null,
            organizationLogoPreview: '',
        },
        {
            id: Math.random(10**5),
            organizationType: "Volunteering",
            organizationName: "Houston Food Bank",
            organizationHostStudent: "e",
            organizationMission: "Description Description Description Description Description Description",
            prganizationImage: "Image src",
            organizationTags: null,
            organizationLearnMore: null,
        },
        {
            id: Math.random(10**5),
            organizationType: "Organization_Type",
            organizationName: "Organization_Name",
            organizationHostStudent: "",
            organizationMission: "Description Description Description Description Description Description",
            prganizationImage: "Image src",
            organizationTags: "",
            organizationLearnMore: "",
        },
        {
            id: Math.random(10**5),
            organizationType: "Organization_Type",
            organizationName: "Organization_Name",
            organizationHostStudent: "",
            organizationMission: "Description Description Description Description Description Description",
            prganizationImage: "",
            organizationTags: ["theatre", "arts", "leadership"],
            organizationLearnMore: "",
        },
        {
            id: Math.random(10**5),
            organizationType: "Organization_Type",
            organizationName: "Organization_Name",
            organizationHostStudent: "",
            organizationMission: "Description Description Description Description Description Description",
            prganizationImage: "Image src",
            organizationTags: "",
            organizationLearnMore: "",
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