import "./home.css";
import TopBar from "../../components/Topbar/TopBar";
import SideNav from "../../components/Sidenav/SideNav";
import ReactPlayer from "react-player/youtube";
import ProfileStrength from "../../components/Profilestrength/ProfileStrength";
import { FaArrowCircleDown } from "react-icons/fa";
import React, { useEffect, useRef, useState } from "react";
import InviteContactsModal from "../../components/InviteContactsmodal/InviteContactsModal";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { auth, db } from "../../firebase/firebaseConfig";
import LegalityFooter from "../../components/Legality Footer/LegalityFooter";
import ParentalVerificationModal from '../../components/ParentalVerificationModal';
import ConnectionStatusModal from '../../components/ConnectionStatusModal';
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { parentVerificationResendTemplate } from "../../utils/parentVerificationTemplates";
import ConnectModal from "../../components/Connectmodal/ConnectModal";
import { useOutletContext } from "react-router-dom";
import { getConnectionsByStatus } from "../../services/connectionService";
import { useModal } from '../../contexts/ModalContext';


class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, info) {
    console.error("ReactPlayer error:", error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Error loading video player</div>;
    }
    return this.props.children;
  }
}

export default function Home(){

    const currentUser = auth.currentUser;

    const [userBasicInfo, setUserBasicInfo] = useState(null);
    const [showParentModal, setShowParentModal] = useState(false);
    const [showConnectionModal, setShowConnectionModal] = useState(false);
    const [connectedUserData, setConnectedUserData] = useState(null);
    const [showVerifedConnectionModal, setShowVerifiedConnectionModal] = useState(false);
    const [receivedConnections, setReceivedConnections] = useState([]);
    const {openProfileModal} = useModal();

    const { chatClient } = useOutletContext();

    const storedUserBasicInfo = localStorage.getItem("basicUserInfo");

    const info = JSON.parse(storedUserBasicInfo);
    const schoolId = localStorage.getItem("schoolId");
    console.log("SCHOOL ID: "+ schoolId);

    const getUserData = async () => {
      const userDocRef = doc(db, "tenants", localStorage.getItem("schoolId"), 'users', currentUser.uid);
      unsubscribe = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
              return doc.data();
          } else {
              console.log("No such document!");
              return null;
          }
      });
    };

    const onUpdateParentEmail = async (newEmail) => {
      const updatedBasicUserInfo = { ...userBasicInfo, parentEmail: newEmail };
      localStorage.setItem('basicUserInfo', JSON.stringify(updatedBasicUserInfo));
      setUserBasicInfo(updatedBasicUserInfo);
      const userDocRef = doc(db, "tenants", localStorage.getItem("schoolId"), 'users', currentUser.uid);
      try{
        await updateDoc(userDocRef, {parentEmail: newEmail});
      } catch (error) {
        console.error("Error updating parent email:", error);
      }
    };

    const onParentVerificationResend = async () => {

      const generateVerificationLink = httpsCallable(getFunctions(), "generateVerificationLink");
      const verificationLinkResult = await generateVerificationLink({
        uid: currentUser.uid,
        action: "verify_account",
        schoolId: localStorage.getItem("schoolId"),
      });

      // Extract the verification link from the result
      const verificationLink = verificationLinkResult.data;

      const sendSESEmail = httpsCallable(getFunctions(), "sendSESEmail");
      const result = await sendSESEmail({
        recipient: [ userBasicInfo.parentEmail ], 
        subject: "Verify Your Student's Account", 
        htmlTemplate: parentVerificationResendTemplate({
          studentName: userBasicInfo.userName ? userBasicInfo.userName.split(" ")[0] : "",
          parentName: "",
          verificationLink: verificationLink}),
        emailType: "parent_verification"});
    };

    
    const getUserTokenInfo = async () => {
        if (currentUser) {
            const idTokenResult = await currentUser.getIdTokenResult();
            const schoolId = idTokenResult.claims.school_id;
            console.log("School Id:", schoolId);

            setUserBasicInfo((prev) => ({
                ...prev, 
                schoolId,
            }));
        }
    };

    useEffect(() => {
      setUserBasicInfo(JSON.parse(storedUserBasicInfo));

      // if(!schoolId){
      getUserTokenInfo();
      // }

      const sessionFlag = sessionStorage.getItem('parentalModalShown');
      if (
        info &&
        info.userType === 'High Schooler' &&
        info.parentEmail &&
        !info.parentVerified &&
        !sessionFlag
      ) {
        setShowParentModal(true);
        sessionStorage.setItem('parentalModalShown', 'true');
        return;
      }

      // connection status visibility check
      console.log("Initial useEffect - calling fetchReceivedConnections");
      fetchReceivedConnections();


    }, []);

    // Check for connection modal display after receivedConnections is updated
    // useEffect(() => {
    //   console.log("Connection modal check useEffect triggered");
    //   console.log("receivedConnections:", receivedConnections);
    //   console.log("info:", info);
      
    //   const connectionSessionFlag = sessionStorage.getItem('connectionModalShown');
    //   console.log("connectionSessionFlag:", connectionSessionFlag);
      
    //   if (
    //     (info &&
    //     info.userType === 'High Schooler' &&
    //     info.parentVerified &&
    //     !connectionSessionFlag) ||
    //     (info.userType !== 'High Schooler' )
    //       // && !connectionSessionFlag) TODO: ADD BACK
    //   ) {
    //     console.log("All conditions met for connection modal check");
    //   //   const pendingConnections = JSON.parse(localStorage.getItem('pendingConnections') || '[]');
    //   //   const approvedConnections = JSON.parse(localStorage.getItem('approvedConnections') || '[]');
        
    //   //   console.log("pendingConnections:", pendingConnections);
    //   //   console.log("approvedConnections:", approvedConnections);
    //   //   // console.log("receivedConnections.length:", receivedConnections.length);

    //   //   if (pendingConnections.length > 0 || approvedConnections.length > 0 || receivedConnections.length > 0) {
    //   //     console.log("SHOWING CONNECTION MODAL!");
    //   //     setShowConnectionModal(true);
    //   //     sessionStorage.setItem('connectionModalShown', 'true');
    //   //   } else {
    //   //     console.log("No connections found, not showing modal");
    //   //   }
    //   // } else {
    //   //   console.log("Conditions not met for connection modal:");
    //   //   console.log("- info exists:", !!info);
    //   //   console.log("- userType is High Schooler:", info?.userType === 'High Schooler');
    //   //   console.log("- parentVerified:", info?.parentVerified);
    //   //   console.log("- connectionSessionFlag:", connectionSessionFlag);
    //   }
    // }, [receivedConnections, info]);

    const fetchReceivedConnections = async () => {
      
      const connectionSessionFlag = sessionStorage.getItem('connectionModalShown');
      try {
        if (
          (info &&
          info.userType === 'High Schooler' &&
          info.parentVerified &&
          !connectionSessionFlag) ||
          (info.userType !== 'High Schooler' 
            && !connectionSessionFlag)
        ) {
          console.log("Fetching received connections...");
          const receivedResult = await getConnectionsByStatus(schoolId, 'pending');
          const parentApprovedResult = await getConnectionsByStatus(schoolId, 'parent_approved');
          
          console.log("Received result:", receivedResult);
          console.log("Parent approved result:", parentApprovedResult);
          
          // Filter to only show connections where current user is the target
          const allReceived = [...(receivedResult.connections || []), ...(parentApprovedResult.connections || [])]
            .filter(conn => conn.role === 'target');

          console.log("All received connections:", allReceived);

          // Filter based on user type and status
          const filteredReceived = allReceived.filter(conn => {
            const isHighSchooler = info?.userType === 'High Schooler';
            const isParentApproved = conn.status === 'parent_approved';
            
            // Adults only see parent_approved connections
            if (!isHighSchooler && !isParentApproved) {
              return false;
            }
            
            return true;
          });
          
          console.log("Filtered received connections:", filteredReceived);
          setReceivedConnections(filteredReceived);

          const pendingConnections = JSON.parse(localStorage.getItem('pendingConnections') || '[]');
          const approvedConnections = JSON.parse(localStorage.getItem('approvedConnections') || '[]');
          
          console.log("pendingConnections:", pendingConnections);
          console.log("approvedConnections:", approvedConnections);
          // console.log("receivedConnections.length:", receivedConnections.length);

          if (pendingConnections.length > 0 || approvedConnections.length > 0 || filteredReceived.length > 0) {
            console.log("SHOWING CONNECTION MODAL!");
            setShowConnectionModal(true);
            sessionStorage.setItem('connectionModalShown', 'true');
          } else {
            console.log("No connections found, not showing modal");
          }
      }
        
      } catch (error) {
        console.error("Error fetching received connections:", error);
        setReceivedConnections([]);
      }
    }

    const handleOnConnectClick = async (connectingUserData) => {
      setConnectedUserData(connectingUserData);
      setShowVerifiedConnectionModal(true);
    }

    const handleOnProfileClick = (userData) => {
      openProfileModal({userData})
    } 

    useEffect(()=>{
      console.log("showing: ", showConnectionModal);
      console.log("showing verification: ", showParentModal);
    },[showConnectionModal]);
    
    const resourceData = {
        "How To Network": [
          {
            title: "The Basics of (Digital) Networking for Highschoolers",
            link: "https://docs.google.com/document/d/1G57KLYBhdCnElJDgJ_zYKv1Eg-3_MYZ8ULVhyW0B3j0/edit",
            description: "Launchpad gives you access to undergraduates and industry professionals who are experienced in your fields of interest - but it's up to YOU to make the most of these connections. Read this guide to learn how to approach busy professionals and take full advantage of their expertise. By following these networking strategies, you will open doors to the learning and working opportunities of your lifetime.",
            recommendedBanner: "yes (highly recommended)",
            userType: "High Schoolers"
          }
        ],
        "Find Your Ideal Career": [
          {
            title: "Career Explorer Free Career Survey",
            link: "https://www.careerexplorer.com/career-test/",
            description: "Find your dream career based on your personality, strengths, and experiences! The Career Explorer Career Survey is widely regarded as the #1 career survey in the world for any students seeking to learn more about careers they'd be a great fit for. It is perfect for students who want to learn more about jobs within a certain area of interest (i.e business) or just understand careers better in general. Though long, it is very highly recommended to complete this survey in order to find careers that are a great fit for you (career explorer generates 30 career options based on responses).",
            recommendedBanner: "yes",
            time: "20 minutes",
            userType: "High Schoolers and Undergrads"
          },
          {
            title: "VIA Free Character Strength Survey",
            link: "https://www.viacharacter.org/surveys/takesurvey",
            description: "Find your top 3 strengths with the VIA survey! The VIA free personality test is highly recommended by experts for anyone seeking to learn more about their character. It's an excellent, thorough tool for gaining self-awareness, helping highschool students craft compelling college essays, and considering which colleges might be the best fit. For students and professionals alike, it provides valuable insights into which career environments might make you happiest.",
            recommendedBanner: "yes",
            time: "10 minutes",
            userType: "High Schoolers and Undergrads"
          },
          {
            title: "Myers Briggs Free Personality Test",
            link: "https://www.16personalities.com/free-personality-test",
            description: "Possibly the most famous and respected personality test, a test that has helped millions understand themselves better and thus find their dream career. The Myers Briggs personality test places you into one of the 16 personality types and then gives you a multiple page report with recommendations about career paths, what workplace is best for you, famous people with your personality type, etc… Overall, it is a very useful tool to determine what career matches your personality.",
            recommendedBanner: "no",
            time: "10 minutes",
            userType: "High Schoolers and Undergrads"
          },
          {
            title: "Indigo Research Career Pathway Guide",
            link: "https://www.indigoresearch.org/blog/how-to-choose-profession",
            description: "Not sure how to start your career path as a highschooler? You're not alone! The Indigo Research Blog offers an insightful guide that gives you, as a highschooler, actionable steps to start your real-world career experience. This blog provides practical tips on how to identify your strengths, explore your interests, and seek mentorship and internships. Make sure to take action on the lessons by reaching out to undergrads and professionals on Launchpad after!",
            recommendedBanner: "yes",
            userType: "High Schoolers"
          },
          {
            title: "Education Planner Checklist and Resources",
            link: "http://www.educationplanner.org/students/career-planning/checklists",
            description: "Learn about the 6 core tasks you should have done by highschool. Make sure you are on task to achieve them! Education Planner has links to other useful guides, it is a great starting point to understand what to do during your highschool years. Take action on what you learn with Launchpad! Find volunteer opportunities and reach out to undergrads & professionals to check off your highschool list.",
            recommendedBanner: "no",
            userType: "High Schoolers"
          },
          {
            title: "My Next Move Career Outlook",
            link: "https://www.mynextmove.org/?fbclid=IwAR2OGpd-YNBFlZu_ZUOW8RQY1kFf1Exanso_MPFmT2vF6aRaluimDiMwde4",
            description: "Discover your ideal career path with My Next Move! Think of it as an interactive version of regular career outlook resources like Occupational Outlook Handbook. My Next Move is a top-rated resource designed to help students identify careers that align with their interests, strengths, and goals - you'll understand the average salary, job growth, and other key metrics about your dream careers. Whether you're passionate about a specific field, like finance or healthcare, or just want to explore your options, My Next Move offers a personalized experience that guides you toward the careers that are the best fit for you.",
            recommendedBanner: "no",
            userType: "High Schoolers and Undergrads"
          },
          {
            title: "Occupational Outlook Handbook",
            link: "https://www.bls.gov/ooh/home.htm",
            description: "The Occupational Outlook Handbook is an excellent tool for exploring different careers. It provides insights into what a typical day looks like in a given profession, the required education, and average salaries in the U.S. Additionally, the Similar Careers tab helps you discover related fields, broadening your understanding of career possibilities. The more you explore, the better informed you'll be about your options.",
            recommendedBanner: "no",
            userType: "High Schoolers"
          }
        ],
        "Find Your Dream University": [
          {
            title: "College Board College Search and Quiz",
            link: "https://bigfuture.collegeboard.org/college-search/filters",
            description: "The college board provides a great university search tool. Click 'match me' to take their quick quiz and find your best-fit universities, based on your interests. You can also search and learn more about universities you already have in mind.",
            recommendedBanner: "no",
            userType: "High Schoolers"
          },
          {
            title: "Cialfo College Search",
            link: "https://www.cialfo.co/",
            description: "If your school provides you with Cialfo, take full advantage of it. Cialfo provides an excellent college search tool that allows you to search for colleges based on your interests and learn everything about them.",
            recommendedBanner: "no",
            userType: "High Schoolers",
          }
        ],
        "Resume-Building": [
          {
            title: "Yale Resume-Phrasing Guide",
            link: "https://ocs.yale.edu/resources/writing-impactful-resume-bullets/",
            description: "According to Yale University Admissions, the key to writing a resume is not quantity, but quality. Only write about your experiences that truly made an impact and/or showcase your interests. Filler awards and positions only hinder you. A good student resume is one page long. Here's how to write a student resume that impresses both college admissions and internship and job employers.",
            recommendedBanner: "yes",
            userType: "High Schoolers and Undergrads"
          }
        ],
        "SAT/ACT Hacks": [
          {
            title: "College Board Bluebook Practice Tests",
            link: "https://bluebook.app.collegeboard.org/",
            description: "Download bluebook to take 6 college board verified digital SAT practice Tests. This is the nearest thing to the actual SAT exam, and is the most useful tool to gauge where you are and how you are improving",
            recommendedBanner: "no",
            userType: "High Schoolers"
          },
          {
            title: "SAT Panda FREE Practice Test and Study Guides",
            link: "https://www.satpanda.com/sat/",
            description: "SAT Panda is widely regarded as the #1 free resource for SAT Prep. It gives you access to 20 free practice tests and thousands of free practice questions in specific subjects you need to work on. Stand-alone, SAT Panda is a great SAT prep tool alone, but it works best as a complementary resource to tutors or other study programs.",
            recommendedBanner: "no",
            userType: "High Schoolers"
          },
          {
            title: "ACT Test Free Practice Tests & Questions",
            link: "https://www.act.org/content/act/en/products-and-services/the-act/test-preparation/free-act-test-prep.html",
            description: "This is the nearest thing to the actual ACT exam, and is a useful tool to gauge where you are and how you are improving. You can take tests specific to your weaker sections, as well as answer hundreds of free practice questions. Remember, like for the SAT, It is recommended to find some sort of a tutor or self-study ACT prep plan to prepare for this important test.",
            recommendedBanner: "no",
            userType: "High Schoolers"
          }
        ],
      };

    const refSections = useRef({});

    const resourceSections = { "How To Network": "howToNetwork", "Find Your Ideal Career": "discoverYourCareer", "Find Your Dream University":"findDreamUniversity", "Resume-Building": "buildResume", "SAT/ACT Hacks":"satTips"}
    
    const handleSectionRef = (sectionTitle, ref) => {
      refSections.current[sectionTitle] = ref;
    };

    return(
        <>
            {showVerifedConnectionModal && <ConnectModal onClose = {()=>setShowVerifiedConnectionModal(false)} userData={connectedUserData} visibility={showVerifedConnectionModal} chat={chatClient} userId = {connectedUserData.id}/>}
            {showParentModal && (
              <ParentalVerificationModal
                parentEmail={userBasicInfo.parentEmail}
                parentVerified={userBasicInfo.parentVerified}
                userEmail={userBasicInfo.email}
                onResend={onParentVerificationResend}
                onClose={() => setShowParentModal(false)}
                onUpdateEmail={onUpdateParentEmail}
              />
            )}
            {showConnectionModal && (
              <ConnectionStatusModal
                onClose={() => setShowConnectionModal(false)}
                onConnect={handleOnConnectClick}
                handleProfileClick={handleOnProfileClick}
                filteredReceived={receivedConnections}
              />
            )}
            <TopBar/>
            <SideNav/>
            <div className='homeContainer' style={{background: "var(--primary)", paddingTop: "5%", paddingLeft: "16%", paddingRight: "6%", paddingBottom: "40px"}}>
                <div style={{paddingTop: "20px"}}>
                    {userBasicInfo && <InviteContacts userBasicInfo={userBasicInfo} userName={userBasicInfo.userName.split(" ")[0] ?? "User"} tenantId={capitalizeFirstLetter(userBasicInfo.schoolId)}/>}
                </div>
                <div style={{display: "flex", paddingTop: "30px", position: "relative", width: "fitParent", height: "400px"}}>
                    <div className="launchpadIntro" style={
                        {padding: "10px", backgroundColor: "white", width: "53%", borderRadius: "10px",
                            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.09)"}
                    }>
                        <span style={
                            {fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center",
                                 borderBottomStyle: "solid", paddingBottom: "5px", borderColor: "#C0C0C0", borderWidth: "1px"}
                            }>
                            Welcome to Launchpad! &nbsp; <span style={{fontSize: "smaller", fontWeight:"400"}}>(Watch Full Video)</span>
                        </span>
                        <div style={{paddingTop: "15px", height: "330px"}}>
                        <ErrorBoundary>
                            <ReactPlayer
                                url='https://www.youtube.com/watch?v=uhnxWBqVvbY'
                                width='100%'
                                height='100%'
                                controls={true}/>
                        </ErrorBoundary>
                        </div>
                    </div>
                    <div style={
                        {padding: "10px", backgroundColor: "white", width: "40%", marginLeft: "auto", borderRadius: "10px",
                            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.09)"}
                        }>
                        <ProfileStrength userData={userBasicInfo}/>
                    </div>
                </div>
                <div className="resourceCenter">
                    <h2>Resource Center</h2>
                    <div style={
                        {display:"flex", alignItems: "center", justifyContent: "center", gap: "40px",
                        borderBottomStyle: "solid", borderColor: "#C0C0C0", paddingBottom: "20px"}}>
                        {Object.keys(resourceSections).map((sectionName, index)=>(
                            <ResourceItem 
                            resourceType={sectionName}
                            resourceRef={refSections.current[sectionName]}
                            key={index}
                            />
                        ))}
                    </div>
                    <div>
                        {Object.entries(resourceData).map(([sectionTitle, resources]) => (
                        <ResourceSection 
                        sectionRef={resourceSections[sectionTitle]}
                        key={sectionTitle}
                        title={sectionTitle}
                        resources={resources}
                        onSectionRef={handleSectionRef}/>
                        ))}
                    </div>
                    <hr/>
            
                    <div style={{marginTop: "25px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                        <h2 style={{fontSize: "30px"}}>Launchpad Support</h2>
                        <div style={{width: "800px", background: "white", boxShadow: "var(--shadowColor)", padding: "19px", borderRadius: "5px", textAlign: "center", fontSize: "larger"}}>
                            <span>If you experience any techincal bugs, errors, or issues of any sort, please contact <span className="highlight">launchpadhelpline@gmail.com</span>. Additionally, if you have any questions about networking or certain opportunities, feel free to contact us there as well!</span>
                        </div>
                    </div>
                </div>
                
            </div>
            {/* <div className="landing-footer" style={{zIndex: "4"}}>
              <LegalityFooter/>
            </div> */}
        </>
    )
}

export function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function InviteContacts({userName, tenantId, userBasicInfo}){
    const [inviteContactsModalVisibility,setInviteContactsModalVisibility] = useState(false);

    const disableActions = userBasicInfo.userType === "High Schooler" && !userBasicInfo.parentVerified;

    return(
        <>
        {inviteContactsModalVisibility && <InviteContactsModal onClose={()=>setInviteContactsModalVisibility(false)} visibility={inviteContactsModalVisibility} tenantId={tenantId}/>}
        <div style={
            {textAlign: "center", position: "relative", padding: "15px", margin: "0 auto", width: "fitParent", backgroundColor: "rgba(14, 195, 111, .3)",
         height: "fitContent", borderRadius: "4px", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.09)"}
         }>
            <span style={{fontSize: "18.5px", fontWeight: "350"}}><span style={{fontSize: "28px", fontWeight: "bolder"}}>Hello, {userName}!</span> <br /> Know any <span style={{fontWeight: "550"}}>{tenantId} high schoolers</span> or <span style={{fontWeight: "550"}}>{tenantId} alumni</span> who would benefit from being on the app? Know other  <span style={{fontWeight: "550"}}>professionals</span> in the {tenantId} community willing to share their expertise? Invite friends and family below!</span>
            <div style={{display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "15px"}}>
                <button 
                  disabled={disableActions} 
                  style={{cursor: disableActions ? "not-allowed" : "pointer"}} 
                  onClick={()=>{if(!disableActions)setInviteContactsModalVisibility(true)}} 
                  className="btnInviteContacts"
                  title={disableActions ? "Parent/guardian approval required" : ""}
                >
                  Invite Contacts
                </button>
            </div>
        </div>
        </>
    )
}

function ResourceItem({resourceType, resourceRef}){

  const handleResourceClick = () => {
    resourceRef.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start', // Scroll to the top of the section
      });
  }
  return(
      <button className="resourceItem" onClick={handleResourceClick}>
          <span style={{padding: "3.5px", fontSize: "larger"}}>{resourceType}</span>
          <FaArrowCircleDown color="grey" size={20}/>
      </button>
  )
}

function ResourceCard({ title, link, description, recommendedBanner, time, userType }) {
    return (
      <div style={{
        position: "relative",
        padding: "20px",
        width: "320px",
        backgroundColor: "white",
        boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.09)",
        borderRadius: "5px",
        margin: "10px",
        height: "320px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}>
        {recommendedBanner === "yes (highly recommended)" && (
            <ImportanceBanner/>
        )}
        <h3 style={{ margin: "0" }}>{title}</h3>
        <p style={{ flex: 1, overflow: "auto" }}>{description}</p>
        {time && <span>Time: {time}</span>}
        <p>For: {userType}</p>
        <a href={link} target="_blank" rel="noopener noreferrer"  style={{
          display: "block",
          textAlign: "center",
          // background: "#007bff",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
          textDecoration: "none"
        }} className="resource-btn">
          Access Resource
        </a>
      </div>
    );
  }  

function ResourceSection({ title, resources, onSectionRef }) {
  
  const sectionRef = useRef(null);

  useEffect(() => {
    onSectionRef(title, sectionRef.current);
  }, [title, onSectionRef]);

  const settings = {
    dots: true,
    // infinite: true,
    // speed: 1000,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
    };
  
    return (
      <div style={{ margin: "20px 0", position: "relative" }}>
        <div ref={sectionRef} style={{position: "absolute", marginLeft: "auto", marginRight: "auto", left: "0", right: "0", width: "5px", top: "-80px", display: "hidden"}}></div>
        <span style={{display: "flex", justifyContent: "center", fontSize: "25px", fontWeight: "200"}}>{title}</span>
        {(resources.length > 3) ? <Slider {...settings}>
          {resources.map((resource, index) => (
            <ResourceCard key={index} {...resource} />
          ))}
        </Slider> :
        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
          {resources.map((resource, index) => (
            <ResourceCard key={index} {...resource} />
          ))}
        </div>}
      </div>
    );
  }
  
  

function ImportanceBanner(){
    return(
        <div style={{borderRadius: "20px", position: "absolute", top: "-15px", left: "10px", width: "fitContent", padding: "2px 8px", background: "rgb(47,162,52)",
            background: "linear-gradient(90deg, rgba(47,162,52,1) 48%, rgba(18,123,22,1) 100%)", zIndex: "1"}}>
            <span style={{color: "white", fontWeight: "600"}}>Highly Recommended!</span>
        </div>
    )
}