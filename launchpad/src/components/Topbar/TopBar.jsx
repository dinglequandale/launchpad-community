import './topbar.css';
import React from 'react';
import LoginIcon from '../Loginicon/LoginIcon';
import LogoutButton from '../Loginbutton/LogoutButton';
import { RxHamburgerMenu } from "react-icons/rx";

export default function TopBar({onBurgerPress}){

    return (
        <div className='topBar'>
                <span align="center" className='topBarTitle'>L A U N C H P A D.</span>
            <div className='user'>
                <LoginIcon/>
                <LogoutButton/>
            </div>
        </div>   
    )
}