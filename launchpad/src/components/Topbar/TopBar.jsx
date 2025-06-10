import './topbar.css';
import React, { useEffect, useState } from 'react';
import LoginIcon from '../Loginicon/LoginIcon';
import LogoutButton from '../Logoutbutton/LogoutButton';
// import { RxHamburgerMenu } from "react-icons/rx";
import { useNavigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';

export default function TopBar({onBurgerPress}){

    const navigate = useNavigate();

    return (
        <div className='topBar'>
            <img src="/assets/launchpad_logo.png" alt="Logo" style={{width: "320px", cursor: "pointer"}} onClick={()=>navigate("/Home")}/>
            <div className='user'>
                <div style={{display: "flex"}}>
                    <LoginIcon/>
                    <div className='settings-tab'><FiSettings size={30} onClick={() => {navigate("/settings")}}/></div>
                </div>
                <LogoutButton/>
            </div>
        </div>   
    )
}