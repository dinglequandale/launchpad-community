import './sidenav.css';
import React from 'react';
import { IoHomeOutline } from "react-icons/io5";
import { TbUserHexagon } from "react-icons/tb";
import { GoOrganization } from "react-icons/go";
import { LuMessagesSquare } from "react-icons/lu";
import { IoCloseOutline } from "react-icons/io5";
import { Link } from 'react-router-dom';

export default function SideNav({show}){
    
    return(
        <div className={show ? 'sideNav open' : 'sideNav'}>
            <IoCloseOutline className='navClose' size={20}/>
            <img src="https://thebuzzmagazines.com/sites/default/files/events/2021/08/awty_logo_sep16.jpg" alt="school-logo" className='schoollogo' />
            <div className='navOptions'>
                <div className='destinationNav'>
                    <IoHomeOutline size={35}/>
                    <Link to="/" style={{ color: 'inherit' }}>
                        <span>Home</span>
                    </Link>
                </div>

                <div className='destinationNav'>
                    <TbUserHexagon size={35}/>
                    <Link to="/" style={{ color: 'inherit' }}>
                        <span>Network</span>
                    </Link>
                </div>

                <div className='destinationNav'>
                    <GoOrganization size={35}/>
                    <Link to="/" style={{ color: 'inherit' }}>
                        <span>Organizations</span>
                    </Link>
                </div>

                <div className='destinationNav'>
                    <LuMessagesSquare size={35}/>
                    <Link to="/" style={{ color: 'inherit' }}>
                        <span>Messages</span>
                    </Link>
                </div>
                <div className='destinationNav'> 
                    <Link to="/" style={{ color: 'inherit' }}>
                        <span>Clubs</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}