import { useEffect, useState } from "react";
import "./organizations.css"
import SearchBar from "../../components/Searchbar/SearchBar";
import SideNav from "../../components/Sidenav/SideNav";
import TopBar from "../../components/Topbar/TopBar";
import OrganizationProfile from "../../components/Organizationprofile/OrganizationProfile";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs, query } from "firebase/firestore";
import NoResults, { EmptyField } from "../../components/NoResultsnotifier/NoResults";
import Loading from "../../components/LoadingAnimation/Loading";

export default function Organizations(){

    const [organizationsData, setOrganizationsData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const opportunitiesRef = collection(db, "opportunities");
        setLoading(true);
      
        const unsubscribe = onSnapshot(opportunitiesRef, 
          (snapshot) => {
            const opportunitiesData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setOrganizationsData(opportunitiesData);
            setLoading(false);
          },
          (error) => {
            console.log("Error fetching opportunities:", error);
            setLoading(false);
          }
        );
      
        return () => unsubscribe();
      }, []);

    useEffect(()=>{
        console.log(organizationsData)
    },[organizationsData])

    const pageName = "Opportunities";

    const filterContent = [
        ["Any Category","Community Service", "Student Clubs", "Workplace Opportunities"],
        ["Any Field of Interest", "Your Interests"]
    ];


    // TODO: make these styles more dynamic
    const loadingStyles = {
        position: 'absolute',
        top: "25%",
        left: "10%",
        right: 0,
        bottom: 0,
    };

    return(
        <>
            <TopBar/>
            <div style={{paddingTop: "3%"}}>
                <SideNav/>
            </div>
            <div style={{paddingLeft:"10%"}}>
                <div className='organizationsContainer'>
                    <SearchBar filters = {filterContent} pageName = {pageName}/> 
                    
                    <div style={{display: "flex", margin: "0 auto", flexDirection: "column", gap: "40px", paddingTop: "40px", paddingBottom: "40px"}}>
                        {loading ?
                            <div>
                                <Loading style={loadingStyles}/>
                            </div>
                            : organizationsData.length > 0 ?
                            organizationsData.map((organization, index)=>(
                                <OrganizationProfile key={index} organizationData={organization} location={"organizations_page"}/>))
                            :
                            <div style={{margin: "0 auto"}}>
                                <EmptyField/>
                            </div>
                            }
                    </div>
                </div>
            </div>
                
        </>
        
    )
}