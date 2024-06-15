import './sidenav_test.css';
import React from 'react';
import TopBar from "../../components/Topbar/TopBar";
import SideNav from '../../components/Sidenav/SideNav';
import ProfileCard from '../../components/Profilecard/ProfileCard';
import { useState, useEffect } from 'react';


export default function SideNav_Test() {

    const [showPfpCard, setShowPfpCard] = useState(false);

    useEffect(() => {
        document.addEventListener("keydown", onKeyPress, true)
    }, [])

    const onKeyPress = (e) => {
        if(e.key === "Escape"){
            setShowPfpCard(false)
        }
    }
    
    return(
        <>
            {showPfpCard && <ProfileCard onClose={() => setShowPfpCard(false)}/>}
            <div>
                <TopBar/>
                <div className='onboarding1Container'> 
                    <SideNav/>
                    <div className='content'>
                        <button className='btnProfile' onClick={()=>setShowPfpCard(true)}>See profile</button>
                    </div>
                    
                </div>
            </div>

            </>
    )
}