import './profilecard.css';
import React from 'react';
import { VscAccount } from "react-icons/vsc";
import { SlLink } from "react-icons/sl";   
import { IoCloseOutline } from "react-icons/io5";
import SideNav from '../Sidenav/SideNav';
import { useState } from 'react';

export default function ProfileCard({userData, onClose}) {
    return(
        <>
            <div className='profileCardContainer'>
                <div className='profileCard'>
                    <IoCloseOutline className='close' onClick={onClose}/>
                    <div className='basicInfo'>
                        <div>
                            <VscAccount size = {80} className='cardPfp'/>
                        </div>
                        <div className='cardNameDescription'>
                            <span className='cardName'>Name Tittel</span>
                            <span className='cardDescription'> Short description</span>
                        </div>   
                    </div>
                    <div className='userInfo'>
                        <span>Current position (if applicable): ...</span>
                        <span>Expertise (if applicable): ... </span>
                    </div>
                    <button className='cardbtnConnect'> 
                        <div>
                            <SlLink size={15}/> Connect
                        </div> 
                    </button>
                    <span className='cardResume'>Resume:</span>
                    <img src="https://www.myperfectresume.com/wp-content/uploads/2022/05/Free-Template-Modern-Blueprint-resume-template.svg" alt="sample resume" />
                </div>
            </div>
            <div className='blurOverlay'></div>
        </>   
    )
}