import './topbar.css';
import React, { useEffect, useState } from 'react';
import LoginIcon from '../Loginicon/LoginIcon';
import LogoutButton from '../Logoutbutton/LogoutButton';
import { RxHamburgerMenu } from "react-icons/rx";

export default function TopBar({onBurgerPress}){

    return (
        <div className='topBar'>
            <img src="/assets/launchpad_logo.png" alt="Logo" style={{width: "19%"}}/>
            <div className='user'>
                <LoginIcon/>
                <LogoutButton/>
            </div>
        </div>   
    )
}