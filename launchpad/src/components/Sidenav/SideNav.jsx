import './sidenav.css';
import React from 'react';
import { IoHomeOutline } from "react-icons/io5";
import { TbUserHexagon } from "react-icons/tb";
import { GoOrganization } from "react-icons/go";
import { LuMessagesSquare } from "react-icons/lu";
import { IoCloseOutline } from "react-icons/io5";

export default function SideNav(){
    return(
        <div className='sideNav'>
            <IoCloseOutline className='navClose' size={20}/>
            <img src="https://thebuzzmagazines.com/sites/default/files/events/2021/08/awty_logo_sep16.jpg" alt="school-logo" className='schoollogo' />
            <div className='navOptions'>
                <div className='destinationNav'>
                    <IoHomeOutline size={35}/>
                    <span>Home</span>
                    
                </div>
                <div className='destinationNav'>
                <TbUserHexagon size={35}/>
                    <span>Network</span>
                </div>
                <div className='destinationNav'>
                    <GoOrganization size={35}/>
                    <span>Organizations</span>
                </div>
                <div className='destinationNav'>
                    <LuMessagesSquare size={35}/>
                    <span>Messages</span>
                </div>
                <div className='destinationNav'>
                    <IoHomeOutline size={35}/>
                    <span>Workplace</span>
                    <span>Opportunities</span>
                </div>
                <div className='destinationNav'> 
                    <span>Clubs</span>
                </div>
            </div>
        </div>
    )
}