import './topbar.css';
import React from 'react';
import LoginIcon from '../Loginicon/LoginIcon';
import LogoutButton from '../Loginbutton/LogoutButton';
import { RxHamburgerMenu } from "react-icons/rx";

export default function TopBar({onBurgerPress}){

    return (
        <div className='topBar'>
            <img src="/assets/launchpad_logo.png" alt="Your Image Description" style={{width: "19%"}}/>
            <div className='user'>
                <LoginIcon/>
                <LogoutButton/>
            </div>
        </div>   
    )
}