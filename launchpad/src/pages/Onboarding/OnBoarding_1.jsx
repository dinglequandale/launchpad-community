import './onboarding.css';
import React from 'react';
import TopBar from "../../components/Topbar/TopBar";
import SideNav from '../../components/Sidenav/SideNav';
// import { useRef,useEffect } from 'react';
import ProfileCard from '../../components/Profilecard/ProfileCard';

export default function OnBoarding_1() {

    // const topBarRef = useRef(null);
    // const sideNavRef = useRef(null);
  
    // useEffect(() => {
    //   const topBarHeight = topBarRef.current.offsetHeight;
    //   sideNavRef.current.style.top = `${topBarHeight}px`;
    // }, []);

    return(
        <>
            <TopBar/>
            <div className='onboarding1Container'> 
                <SideNav/>
                <div className='content'>
                    <ProfileCard/>
                </div>
                
            </div>
        </>
    )
}