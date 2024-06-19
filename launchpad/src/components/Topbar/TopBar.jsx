import './topbar.css';
import React from 'react';
import LoginIcon from '../Loginicon/LoginIcon';
import LogoutButton from '../Loginbutton/LogoutButton';
import { RxHamburgerMenu } from "react-icons/rx";

export default function TopBar({onBurgerPress}){

    return (
        <div className='topBar'>
            {/* <div style={{display: "flex", gap: "5px", justifyContent: "center", alignItems: "center", cursor: "pointer"}}>
                <RxHamburgerMenu size={25} style={{color: "white"}} onClick={onBurgerPress}/> */}
                <span align="center" className='topBarTitle'>L A U N C H P A D.</span>
            {/* </div> */}
            <div className='user'>
                <LoginIcon/>
                <LogoutButton/>
            </div>
        </div>   
    )
}