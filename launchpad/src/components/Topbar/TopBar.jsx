import './topbar.css';
import React from 'react';
import LoginIcon from '../Loginicon/LoginIcon';
import LogoutButton from '../Logoutbutton/LogoutButton';
// import { RxHamburgerMenu } from "react-icons/rx";
import { useNavigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import { BiFlag } from 'react-icons/bi';
import { useReport } from '../../contexts/report/ReportContext';

export default function TopBar({onBurgerPress}){
    const navigate = useNavigate();
    const { setReportVisibility } = useReport();

    const userBasicInfo = JSON.parse(localStorage.getItem("basicUserInfo"));
    const disableActions = userBasicInfo.userType === "High Schooler" && !userBasicInfo.parentVerified;
    return (
        <div className='topBar'>
            <img src="/assets/launchpad_logo.png" alt="Logo" style={{width: "320px", cursor: "pointer"}} onClick={()=>navigate("/Home")}/>
            <div className='user'>
                <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "15px"}}>
                    <div className='settings-tab'><FiSettings size={30} onClick={() => {navigate("/settings")}}/></div>
                    <BiFlag 
                        className='reportProfileModal-diff-color'
                        size={35} 
                        disabled={disableActions}
                        style={{cursor: disableActions ? "not-allowed" : "pointer"}} 
                        title={disableActions ? "Parent/guardian approval required" : ""}
                        onClick={() => { if(!disableActions){setReportVisibility(true)}}}
                    />
                    <LoginIcon storedBasicUserInfo={userBasicInfo}/>
                </div>
                <LogoutButton/>
            </div>
        </div>   
    )
}