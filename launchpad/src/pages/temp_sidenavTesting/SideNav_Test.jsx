import './sidenav_test.css';
import React from 'react';
import TopBar from "../../components/Topbar/TopBar";
import SideNav from '../../components/Sidenav/SideNav';
import ProfileCard from '../../components/Profilecard/ProfileCard';
import { useState, useEffect } from 'react';


export default function SideNav_Test() {

    const [sideNavVisibility, setSideNavVisibility] = useState(false);
    const [showPfpCard, setShowPfpCard] = useState(false);

    const onBurgerPress = () => {
        setSideNavVisibility(!sideNavVisibility);
    }

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
                <TopBar onBurgerPress={onBurgerPress}/>
                {/* {sideNavVisibility && <SideNav onClose={()=>{setSideNavVisibility(false)}} id ="sideNav"/>} */}
                <SideNav show={sideNavVisibility}/>
                <div className='onboarding1Container'> 
                    <div className='content'>
                        <button className='btnProfile' onClick={()=>setShowPfpCard(true)}>See profile</button>
                    </div>
                    
                </div>
            </div>

            </>
    )
}