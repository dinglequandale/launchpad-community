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
// import { collection, getDocs, limit, query } from "firebase/firestore";
// import { db } from "../../firebase/firebaseConfig";

const filterContent = {
    organizationType: ["Any Category","Community Service", "Clubs", "Workplace Opportunities", "Nonprofits"],
    areasOfInterestOrExpertise: ["Any Subject Matter", "My Interests"]
};

export default function Organizations(){

    const {currentUser} = useAuth();
    const [showPfpCard, setShowPfpCard] = useState(false);
    const [organizationsData, setOrganizationsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    // const [isFiltering, setIsFiltering] = useState(false);
    const [profileModalTop, setProfileModalTop] = useState(0);
    const [targetUserData, setTargetUserData] = useState(null);
    const [connectTargetUserId,setConnectTargetUserId] = useState("");
    const [connectTargerUserName, setConnectTargetUserName] = useState("");

    const [lastDoc, setlastDoc] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [initLoadLength, setInitLoadLength] = useState(0);

    const [connectModalVisibility, setConnectModalVisibility] = useState(false);

    const { chatClient } = useOutletContext();

    const [filters, setFilters] = useState({
        category: 'Any Category',
        subjectMatter: 'Any Subject Matter'
    });

    // useEffect(() => {
    //     const orgData = getDocs(query(collection(db, "opportunities"), limit(10)));
    //     console.log(orgData.docs);
    // },[]);

    const handleConnectClick = (userData = null) => {
        if(userData){
            setConnectTargetUserId(userData.userId);
            setConnectTargetUserName(userData.userName);
            setShowPfpCard(false);
            setConnectModalVisibility(true);
            return;
        }
        setConnectTargetUserId(targetUserData.userId);
        setConnectTargetUserName(targetUserData.userName);
        setShowPfpCard(false);
        setConnectModalVisibility(true);
      }
    

      useEffect(() => {
        setOrganizationsData([]);
        setlastDoc(null);
        setHasMore(true);
        fetchOpportunities(true);
    }, [filters]);

    const fetchOpportunities = async (isInitial = false) => {
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
                    isInitial ? 10 : 5 // adjust this number as needed
                );
                setlastDoc(lastVisible);
                setHasMore(lastVisible !== null);
                if(isInitial){
                    setInitLoadLength(results.length);
                }

                setOrganizationsData(prevData => 
                    isInitial ? results : [...prevData, ...results]
                );
            } catch (error) {
                console.error("Error fetching opportunities:", error);
            } finally {
                setLoading(false);
                setInitLoading(false);
            }
        }
    };

    const fetchMoreOpportunities = async () => {
        if (loading || !hasMore || initLoadLength < 10) return;
        fetchOpportunities(false);
    };

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


    const handleEmailClick = (email) => {
        console.log(`Email clicked: ${email}`)
    }

    const handleReferalClick = async (referalType, organizationData, userData) => {
        setTargetUserData(userData);
 
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
    
    // const handleOnJoin = (organizationData, userData) => {
    //     setTargetUserData(userData);
    //     switch(organizationData.apply){
    //         case "Messages":
    //             handleConnectClick();
    //         case "Email":
    //             handleEmailClick();
    //         default:
    //             window.open(organizationData.apply, '_blank', 'noopener,noreferrer');

    //     }
    // }


    const handleShowProfile = (userData) => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const modalTop = Math.max(0, scrollY + (window.innerHeight - 100) / 2 + 80);

        setTargetUserData(userData);

        setProfileModalTop(modalTop);
        setShowPfpCard(true);
    }

    const handleFilterChange = (filterKey, value) => {
        // setIsFiltering(true);
        setFilters(prev => ({...prev, [filterKey]: value}));
    };

    const pageName = "Opportunities";

    const handleSearch = async (e, queryText) => {
        e.preventDefault();
        setIsSearching(false);
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
            {connectModalVisibility && <ConnectModal onClose = {()=>setConnectModalVisibility(false)} userName={targetUserData.userName} visibility={connectModalVisibility} chat={chatClient} userId = {connectTargetUserId}/>}
            {showPfpCard && <ProfileModal visibility={showPfpCard} onClose={()=>setShowPfpCard(false)} top={profileModalTop} onConnectClick={handleConnectClick} userData={targetUserData} handleReferalClick={handleReferalClick}/>}
            <TopBar/>
            <SideNav/>
            <div className='organizationsContainer' style={{paddingTop: "4%", paddingLeft: "10%"}}>
                <SearchBar filters = {filterContent} pageName = {pageName} handleFilterChange={handleFilterChange} handleSearch={handleSearch}/> 
                
                <div style={{display: "flex", margin: "0 auto", flexDirection: "column", gap: "40px", paddingTop: "40px", paddingBottom: "40px", position: "relative"}}>
                    {initLoading ?
                        <div style={loadingStyles}>
                            <Loading/>
                        </div>
                        : (organizationsData && organizationsData.length > 0) ?
                        
                        (<>
                        {organizationsData.map((organization, index)=>(
                            <div ref={index === organizationsData.length - 1 ? lastOpportunityElementRef : null} key={index}>
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
                </div>
            </div>
        </>
        
    )
}