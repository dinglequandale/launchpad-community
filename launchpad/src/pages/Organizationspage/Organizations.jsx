import { useCallback, useEffect, useRef, useState } from "react";
import "./organizations.css"
import SearchBar from "../../components/Searchbar/SearchBar";
import SideNav from "../../components/Sidenav/SideNav";
import TopBar from "../../components/Topbar/TopBar";
import OrganizationProfile from "../../components/Organizationprofile/OrganizationProfile";
import NoResults, { EmptyField } from "../../components/NoResultsnotifier/NoResults";
import Loading from "../../components/LoadingAnimation/Loading";
import { getFilteredData } from "../../services/filteringServices";
import { useAuth } from "../../contexts/auth/AuthContext";
import { searchDocuments } from "../../services/searchServices";
import ProfileModal from "../../components/Profilemodal/ProfileModal"
import ConnectModal from "../../components/Connectmodal/ConnectModal";
import { useOutletContext } from "react-router-dom";

const filterContent = {
    organizationType: ["Any Category","Community Service", "Clubs", "Workplace Opportunities", "Nonprofits"],
    areasOfInterestOrExpertise: ["Any Subject Matter", "My Interests"]
};

export default function Organizations(){

    const {currentUser} = useAuth();
    const [showPfpCard, setShowPfpCard] = useState(false);
    const [organizationsData, setOrganizationsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [profileModalTop, setProfileModalTop] = useState(0);
    const [targetUserData, setTargetUserData] = useState(null);
    const [connectTargetUserId,setConnectTargetUserId] = useState("");
    const [connectTargerUserName, setConnectTargetUserName] = useState("");

    const [lastDoc, setlastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const [connectModalVisibility, setConnectModalVisibility] = useState(false);

    const { chatClient } = useOutletContext();

    const [filters, setFilters] = useState({
        category: 'Any Category',
        subjectMatter: 'Any Subject Matter'
    });

    const handleConnectClick = () => {
        setConnectTargetUserId(targetUserData.userId);
        setConnectTargetUserName(targetUserData.userName);
        setShowPfpCard(false);
        setConnectModalVisibility(true);
      }
    
      
    const observer = useRef();
    const lastOpportunityElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchMoreOpportunities();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);
  
    
    useEffect(() => {
        setOrganizationsData([]);
        setlastDoc(null);
        setHasMore(true);
        fetchOpportunities(true);
        console.log("Initial opportunities: ", organizationsData)
    }, [filters]);

    const fetchOpportunities = async (isInitial = false) => {
        if(!isSearching){
        setLoading(true);
        const {results, lastVisible} = await getFilteredData('opportunities', filters, currentUser.uid, null, isInitial ? null : lastDoc,
            5 // adjust this number as needed
);
        setlastDoc(lastVisible);
        setHasMore(results.length === 5 && lastVisible !== null);

        setOrganizationsData(results);
        setLoading(false);
        }
    };

    const fetchMoreOpportunities = async () => {
        if (loading || !hasMore) return;
        
        // setLoading(true);
        try {
            const { results, lastVisible } = await getFilteredData(
                'opportunities', 
                filters, 
                currentUser.uid, 
                null,
                lastDoc,
                5 // Amount to fetch each time
            );

            if (results.length > 0) {
                setOrganizationsData(prev => {
                    // Remove duplicates
                    const newOpportunities = results.filter(
                        newOpp => !prev.some(existingOpp => existingOpp.id === newOpp.id)
                    );
                    return [...prev, ...newOpportunities];
                });
                setlastDoc(lastVisible);
            }

            setlastDoc(lastVisible);
            setHasMore(results.length === 5 && lastVisible !== null);
        } catch (error) {
            console.error("Error fetching more opportunities:", error);
        } finally {
            // setLoading(false);
            console.log("fetching more opportunities ...", organizationsData)
        }
    };


    const handleShowProfile = (userData) => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;set
        const modalTop = Math.max(0, scrollY + (window.innerHeight - 100) / 2);

        setTargetUserData(userData);

        setProfileModalTop(modalTop);
        setShowPfpCard(true);
    }

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

    useEffect(() => {
        if (showPfpCard) {
          document.body.classList.add('modal-open');
        } else {
          document.body.classList.remove('modal-open');
        }
      }, [showPfpCard]);

    // TODO: make these styles more dynamic
    const loadingStyles = {
        position: 'absolute',
        left: "50%",
        top: "50%",
        transform: "translate(-50%,320%)",
        width: "300px",
    };

    return(
        <>
            {connectModalVisibility && <ConnectModal onClose = {()=>setConnectModalVisibility(false)} userName={connectTargerUserName} visibility={connectModalVisibility} chat={chatClient} userId = {connectTargetUserId}/>}
            {showPfpCard && <ProfileModal visibility={showPfpCard} onClose={()=>setShowPfpCard(false)} top={profileModalTop} onConnectClick={handleConnectClick} userData={targetUserData}/>}
            <TopBar/>
            <SideNav/>
            <div className='organizationsContainer' style={{paddingTop: "4%", paddingLeft: "10%"}}>
                <SearchBar filters = {filterContent} pageName = {pageName} handleFilterChange={handleFilterChange} handleSearch={handleSearch}/> 
                
                <div style={{display: "flex", margin: "0 auto", flexDirection: "column", gap: "40px", paddingTop: "40px", paddingBottom: "40px", position: "relative"}}>
                    {loading ?
                        <div style={loadingStyles}>
                            <Loading/>
                        </div>
                        : (organizationsData && organizationsData.length > 0) ?
                        organizationsData.map((organization, index)=>(
                            <div ref={index === organizationsData.length - 1 ? lastOpportunityElementRef : null} key={index}>
                                <OrganizationProfile organizationData={organization} handleShowProfile={handleShowProfile} location={"organizations_page"}/>
                            </div>
                            ))
                        :
                        <div style={{margin: "0 auto", transform: "translateY(18%)"}}>
                            <EmptyField/>
                        </div>
                        }
                </div>
            </div>
        </>
        
    )
}