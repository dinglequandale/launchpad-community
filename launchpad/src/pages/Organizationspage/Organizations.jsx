import { useEffect, useState } from "react";
import "./organizations.css"
import SearchBar from "../../components/Searchbar/SearchBar";
import SideNav from "../../components/Sidenav/SideNav";
import TopBar from "../../components/Topbar/TopBar";
import OrganizationProfile from "../../components/Organizationprofile/OrganizationProfile";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs, query } from "firebase/firestore";

export default function Organizations(){

    const [organizationsData, setOrganizationsData] = useState([]);

    useEffect(()=>{
        const loadAllOpportunities = async () => {
            const opportunitiesRef = collection(db, "opportunities");
          
            try {
                const opportunitiesSnapshot = await getDocs(opportunitiesRef);
                setOrganizationsData(opportunitiesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })))
    
            } catch (error) {
              console.log("Error fetching all opportunities:", error);
            }
          }
        loadAllOpportunities();
    },[])


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
                        {organizationsData && organizationsData.map((organization, index)=>(
                            <OrganizationProfile key={index} organizationData={organization} location={"organizations_page"}/>
                        ))}
                </div>
            </div>
                
        </>
        
    )
}