import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';
import { FaFolderOpen } from 'react-icons/fa';
import "./NoResults.css";
import { useNavigate } from 'react-router-dom';
import { FcOrganization } from 'react-icons/fc';
import InviteContactsModal from '../InviteContactsmodal/InviteContactsModal';

export default function NoResults ( {searchTerm, customMessage, customButtonText} ) {

  const [inviteContactsModalVisibility,setInviteContactsModalVisibility] = useState(false);
  const userName = JSON.parse(localStorage.getItem("basicUserInfo") || '{}').userName || '';

  return (
    <>
    {inviteContactsModalVisibility && <InviteContactsModal onClose={()=>setInviteContactsModalVisibility(false)} visibility={inviteContactsModalVisibility} userName={userName} />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="no-results-container"
      >
        <motion.div
          initial={{ scale: 0.5, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.8
          }}
          className="icon-container"
        >
          <FaSearch className="search-icon" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="title"
        >
          No results found
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="message"
        >
          {customMessage || "Couldn't find who you were looking for? Invite them to your school's network!"}
        </motion.p>
        {/* <motion.ul
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="suggestions"
        >
          <li>Check for typos or spelling errors</li>
          <li>Try using more general keywords</li>
          <li>Explore other filter options!</li>
        </motion.ul> */}
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "15px"}}>
            <button onClick={()=>setInviteContactsModalVisibility(true)} className="btnInviteContacts" style={{}}>{customButtonText || "Invite Contacts"}</button>
        </div>
      </motion.div>
    </>
    );
  };

export function EmptyField () {

    const navigate = useNavigate();

    return (<>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="empty-field"
      >
        <FcOrganization className="empty-icon" />
        <h3 className="empty-title">Nothing to see here ... yet!</h3>
        <p className="empty-message">
          We're in need of <span style={{fontWeight: "bolder", color: "var(--secondary)"}}>your</span> help! <br />
          Be the first to pave the futures <br /> of aspiring minds.
        </p>
        <button className='btnSaveChanges' style={{padding: "10px", borderRadius: "10px", fontSize: "15px"}} onClick={() => {
          navigate("/profile", { state: { scrollToOpportunities: true } });
        }}>
          Add one in your profile!
        </button>
      </motion.div>
      </>
    );    
}