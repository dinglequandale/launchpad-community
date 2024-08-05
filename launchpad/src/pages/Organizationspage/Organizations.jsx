import { useEffect, useState } from "react";
import "./organizations.css"
import SearchBar from "../../components/Searchbar/SearchBar";
import SideNav from "../../components/Sidenav/SideNav";
import TopBar from "../../components/Topbar/TopBar";
import OrganizationProfile from "../../components/Organizationprofile/OrganizationProfile";
import { db } from "../../firebase/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import NoResults, { EmptyField } from "../../components/NoResultsnotifier/NoResults";
import Loading from "../../components/LoadingAnimation/Loading";
import { getFilteredData } from "../../services/filteringServices";
import { useAuth } from "../../contexts/auth/AuthContext";
import { searchDocuments } from "../../services/searchServices";

const filterContent = {
    organizationType: ["Any Category","Community Service", "Clubs", "Workplace Opportunities", "Nonprofits"],
    areasOfInterestOrExpertise: ["Any Subject Matter", "My Interests"]
};

export default function Organizations(){

    const {currentUser} = useAuth();

    const [organizationsData, setOrganizationsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);

    const [filters, setFilters] = useState({
        category: 'Any Category',
        subjectMatter: 'Any Subject Matter'
    });

    useEffect(() => {
        fetchOpportunities();
    }, [filters]);

    const fetchOpportunities = async () => {
        if(!isSearching){
        const filteredData = await getFilteredData('opportunities', filters, currentUser.uid);
        setOrganizationsData(filteredData);
        }
    };

    const handleFilterChange = (filterKey, value) => {
        setIsFiltering(true);
        setFilters(prev => ({...prev, [filterKey]: value}));
    };

    const pageName = "Opportunities";

    const handleSearch = async (e, queryText) => {
        e.preventDefault();
        // setIsSearching(false);
        if (queryText) {
            const searchResults = await searchDocuments(pageName.toLowerCase(), queryText);
            setOrganizationsData(searchResults);
        }
    };


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
                    <SearchBar filters = {filterContent} pageName = {pageName} handleFilterChange={handleFilterChange} handleSearch={handleSearch}/> 
                    
                    <div style={{display: "flex", margin: "0 auto", flexDirection: "column", gap: "40px", paddingTop: "40px", paddingBottom: "40px"}}>
                        {loading ?
                            <div>
                                <Loading style={loadingStyles}/>
                            </div>
                            : (organizationsData && organizationsData.length > 0) ?
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