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
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        const loadAllOpportunities = async () => {
            const opportunitiesRef = collection(db, "opportunities");
            try {
                setLoading(true);
                const opportunitiesSnapshot = await getDocs(opportunitiesRef);
                setOrganizationsData(opportunitiesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })))
    
            } catch (error) {
                console.log("Error fetching all opportunities:", error);
            } finally {
                setLoading(false)
            }
          }
        loadAllOpportunities();
    },[])


    const pageName = "Opportunities";

    const filterContent = [
        ["Any Category","Community Service", "Student Clubs", "Workplace Opportunities"],
        ["Any Field of Interest", "Your Interests"]
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
                        {(organizationsData && !loading) ? organizationsData.map((organization, index)=>(
                            <OrganizationProfile key={index} organizationData={organization} location={"organizations_page"}/>))
                            : loading ?
                            <div>
                                Loading...
                            </div> :
                            <div>
                                Nothing to see here!
                            </div>
                        }
                </div>
            </div>
                
        </>
        
    )
}