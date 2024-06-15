import './topbar.css';
import React from 'react';
import LoginIcon from '../Loginicon/LoginIcon';
import LogoutButton from '../Loginbutton/LogoutButton';

export default function TopBar(){
    return (
        <div className='topBar'>
            <span align="center" className='topBarTitle'>L A U C H P A D.</span>
            <div className='user'>
                <LoginIcon/>
                <LogoutButton/>
            </div>
        </div>   
    )
}