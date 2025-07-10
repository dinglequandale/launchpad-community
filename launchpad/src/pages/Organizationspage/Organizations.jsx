import { useCallback, useEffect, useRef, useState } from "react";
import "./organizations.css"
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
import { useOutletContext } from "react-router-dom";
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
    const { openProfileModal, openConnectModal, isProfileModalOpen, isConnectModalOpen } = useModal();
    const [organizationsData, setOrganizationsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [tenantId, setTenantId] = useState(null);

    const [lastDoc, setlastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [initLoadLength, setInitLoadLength] = useState(0);

    const { chatClient } = useOutletContext();

    const [filters, setFilters] = useState({
        category: 'Any Category',
        subjectMatter: 'Any Subject Matter'
    });

    const handleConnectClick = (userData = null) => {
        if(userData){
            openConnectModal({ userData, chat: chatClient, userId: userData.userId, isOpportunity: true });
            return;
        }
        // fallback: openConnectModal with last targetUserData
    }
    
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

    const handleReferalClick = async (referalType, organizationData, userData) => {
        handleConnectClick(userData);
 
        const referalValue = organizationData[`organization${referalType === "learnMore" ? "LearnMore" : "Apply"}`];
        const methodType = organizationData[`organization${referalType === "learnMore" ? "LearnMore" : "Apply"}Method`];
        
        switch(methodType){
            case "Messages":
                handleConnectClick(userData);
                return;
            case "Email":
                handleEmailClick(referalValue);
                return;
            case "Website":
                window.open(referalValue, '_blank', 'noopener,noreferrer');
                return;
        }
    }


    const handleShowProfile = (userData) => {
        openProfileModal({ userData, onConnectClick: handleConnectClick, handleReferalClick });
    }

    const handleFilterChange = (filterKey, value) => {
        // setIsFiltering(true);
        setFilters(prev => ({...prev, [filterKey]: value}));
    };

    const pageName = "Opportunities";

    const user = auth.currentUser;
    useEffect(() => {
        const getUserTokenInfo = async () => {
          const idTokenResult = await user.getIdTokenResult();
          setTenantId(idTokenResult.claims.school_id);
        };
      
        getUserTokenInfo();
      }, [user]);

    const handleSearch = async (e, queryText) => {
        e.preventDefault();
        setIsSearching(false);
        if (queryText) {
            const searchResults = await searchDocuments(pageName.toLowerCase(), queryText, tenantId);
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
            <Toaster position={'bottom-right'} reverseOrder={false}/>
            <TopBar/>
            <SideNav/>
            <div className='organizationsContainer' style={{paddingTop: "6%", paddingLeft: "10%", backgroundColor: "white", paddingBottom: "2%"}}>
                <SearchBar filters = {filterContent} pageName = {pageName} handleFilterChange={handleFilterChange} handleSearch={handleSearch}/> 
                
                <main style={{display: "flex", margin: "0 auto", flexDirection: "column", gap: "40px", paddingTop: "20px", position: "relative"}}>
                    {initLoading ?
                        <div style={loadingStyles}>
                            <Loading/>
                        </div>
                        : (organizationsData && organizationsData.length > 0) ?
                        
                        (<>
                        {organizationsData.map((organization, index)=>(
                            <div key={index}>
                                <OrganizationProfile handleReferalClick={handleReferalClick} organizationData={organization} handleShowProfile={handleShowProfile} location={"organizations_page"}/>
                            </div>
                            ))}
                        {/* <div style={loadingStyles}>
                            <Loading/>
                        </div> */}
                        </>)
                        :
                        <div style={{margin: "0 auto", transform: "translateY(18%)"}}>
                            <EmptyField/>
                        </div>
                        }
                        
                </main>
                {((organizationsData.length % 5 === 0) && !loading) && <footer style={{display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "25px", marginTop: "15px"}}><ShowMoreButton onShowMoreClick={onShowMoreClick}/></footer>}
            </div>
        </>
        
    )
}

function ShowMoreButton({onShowMoreClick}){

    return(<>
        <button className="btnText" style={{fontSize: "25px"}} onClick={onShowMoreClick}>Show More...</button>
    </>)
}