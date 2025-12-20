import { useCallback, useEffect, useRef, useState } from "react";
import "./Organizations.css"
import SearchBar from "../../components/Searchbar/SearchBar";
import SideNav from "../../components/Sidenav/SideNav";
import TopBar from "../../components/Topbar/TopBar";
import OrganizationProfile from "../../components/Organizationprofile/OrganizationProfile";
import { EmptyField } from "../../components/NoResultsnotifier/NoResults";
import Loading from "../../components/LoadingAnimation/Loading";
import { getFilteredData } from "../../services/filteringServices";
import { useAuth } from "../../contexts/auth/AuthContext";
import { searchDocuments } from "../../services/searchServices";
import ProfileModal from "../../components/Profilemodal/ProfileModal"
import ConnectModal from "../../components/Connectmodal/ConnectModal";
import { useNavigate, useOutletContext } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { auth } from "../../firebase/firebaseConfig";
import { useModal } from '../../contexts/ModalContext';
// import jsonData from "../Onboarding/tempInitialOrgData.json";
// import { addDoc, collection, doc, setDoc } from "firebase/firestore";
// import { db } from "../../firebase/firebaseConfig";

const filterContent = {
    organizationType: ["Any Category", "Clubs", "Workplace Opportunities", "Nonprofits", "Businesses", "Community Service", "Leadership"],
    areasOfInterestOrExpertise: ["Any Subject Matter", "My Interests"]
};

export default function Organizations(){

    const {currentUser} = useAuth();
    const navigate = useNavigate();
    const { openConnectModal, isProfileModalOpen, isConnectModalOpen } = useModal();
    const [organizationsData, setOrganizationsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    // COMMUNITY VERSION: Removed tenantId state - no longer needed without multi-tenant architecture
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const [lastDoc, setlastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [initLoadLength, setInitLoadLength] = useState(0);

    const { chatClient } = useOutletContext();

    const [filters, setFilters] = useState({
        organizationType: 'Any Category',
        areasOfInterestOrExpertise: 'Any Subject Matter'
    });

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
    
        // useEffect(() => {
        // jsonData.map(async (org, index) => {
        //     await setDoc(doc(db, "tenants", "awty", "opportunities", org.organizationName), org);
        //     // print("Org ", index + 1, " uploaded")
        // })
        // },[]);
      useEffect(() => {
        setlastDoc(null);
        setHasMore(true);
        const fetchInitial = async () => {
            await fetchOpportunities();
        }
        fetchInitial();
    }, [filters]);

    const fetchOpportunities = async (isInitial = true) => {
        if (!isSearching && !loading) {
            setLoading(true);
            if(isInitial){setInitLoading(true)};

            try {
                const { results, lastVisible } = await getFilteredData(
                    'opportunities',
                    filters,
                    currentUser.uid,
                    null,
                    isInitial ? null : lastDoc,
                    5
                );

                if(!isInitial){
                    setOrganizationsData([...organizationsData, ...results])
                }
                else{
                    setOrganizationsData(results);
                    setInitLoadLength(results.length);
                }
                setlastDoc(lastVisible);

                // Update hasMore based on whether we got a full page of results
                // If we got fewer than the limit, there are no more results
                setHasMore(results.length === 5 && lastVisible !== null);
            } catch (error) {
                console.error("Error fetching opportunities:", error);
            } finally {
                setLoading(false);
                setInitLoading(false);
            }
        }
    };

    const fetchMoreOpportunities = async () => {
        if (loading || !hasMore || initLoadLength < 5) return;
        await fetchOpportunities(false);
    };


    const handleEmailClick = async (email) => {
        console.log(`Email clicked: ${email}`)
        try {
            await navigator.clipboard.writeText(email);
            toast.success('Email copied to clipboard!');
          } catch (err) {
            console.error('Failed to copy email: ', err);
            toast.error('Failed to copy email');
          }
      
    }

    const handleConnectClick = async (userData) => {
        openConnectModal({ userData, chat: chatClient });
    }

    const handleReferalClick = async (referalType, organizationData, userData) => {
        const referalValue = organizationData[referalType === "learnMore" ? "learnMore" : "apply"];
        const methodType = referalValue?.split(': ')[0];
        const value = referalValue?.split(': ')[1];

        switch(methodType){
            case "Messages":
            case "Email":
                // Both "Message me" and "Email me" now open the ConnectModal for consistency
                handleConnectClick(userData);
                return;
            case "Website":
                window.open(value, '_blank', 'noopener,noreferrer');
                return;
        }
    }


    const handleShowProfile = (userData) => {
        // Navigate to user's profile page
        navigate(`/profile/${userData.userId || userData.id}`);
    }

    const handleFilterChange = (filterKey, value) => {
        // setIsFiltering(true);
        setFilters(prev => ({...prev, [filterKey]: value}));
    };

    const clearAllFilters = () => {
        setFilters({
            organizationType: 'Any Category',
            areasOfInterestOrExpertise: 'Any Subject Matter'
        });
    };

    const pageName = "Opportunities";

    // COMMUNITY VERSION: Removed custom claims logic - no longer using school_id claims

    const handleSearch = async (e, queryText) => {
        e.preventDefault();
        setIsSearching(false);
        if (queryText) {
            // COMMUNITY VERSION: No tenantId needed for search
            const searchResults = await searchDocuments(pageName.toLowerCase(), queryText);
            setOrganizationsData(searchResults);
            console.log(searchResults);
        }
    };

    const onShowMoreClick = async () => {
        await fetchMoreOpportunities();
    }

    useEffect(() => {
        if (isProfileModalOpen || isConnectModalOpen) {
          document.body.classList.add('modal-open');
        } else {
          document.body.classList.remove('modal-open');
        }
      }, [isProfileModalOpen, isConnectModalOpen]);

    const loadingStyles = {
        position: 'absolute',
        left: "50%",
        top: "50%",
        transform: "translate(-50%,320%)",
        width: "300px",
    };

    return(
        <>
            {/* <Toaster position={'bottom-right'} reverseOrder={false}/> */}
            <TopBar isSidebarCollapsed={isSidebarCollapsed}/>
            <SideNav/>
            <div className={`organizationsContainer ${isSidebarCollapsed ? 'organizations-sidebar-collapsed' : 'organizations-sidebar-expanded'}`}>
                <SearchBar 
                    filters={filterContent} 
                    currentFilters={filters}
                    pageName={pageName} 
                    handleFilterChange={handleFilterChange} 
                    handleSearch={handleSearch}
                    clearAllFilters={clearAllFilters}
                /> 
                
                <div className="v0-organizations-content">
                    {initLoading ?
                        <div className="v0-loading-container">
                            <Loading/>
                        </div>
                        : (organizationsData && organizationsData.length > 0) ?
                        
                        (<>
                        {organizationsData.map((organization, index)=>(
                            <OrganizationProfile key={index} handleReferalClick={handleReferalClick} organizationData={organization} handleShowProfile={handleShowProfile} location={"organizations_page"}/>
                            ))}
                        </>)
                        :
                        <div className="v0-no-results-container">
                            <EmptyField/>
                        </div>
                        }
                        
                </div>
                {(hasMore && !loading && !initLoading && organizationsData.length > 0) &&
                <footer className="v0-show-more-footer">
                    <ShowMoreButton onShowMoreClick={onShowMoreClick}/>
                </footer>}
            </div>
        </>
        
    )
}

function ShowMoreButton({onShowMoreClick}){

    return(<>
        <button className="v0-show-more-btn" onClick={onShowMoreClick}>Show More...</button>
    </>)
}