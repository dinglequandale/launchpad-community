import './profilemodal.css';
import React from 'react';
import { VscAccount } from "react-icons/vsc";
import { SlLink } from "react-icons/sl";   
import { IoCloseOutline } from "react-icons/io5";
import SideNav from '../Sidenav/SideNav';
import { useState, useEffect } from 'react';

export default function ProfileCard({user, onClose, top}) {

//     const [profileCardVisibility, setProfileCardVisibility] = useState(false);

//     const menuRef = useRef();

//     useEffect(() => {
//       let onClickOutside = (e) => {
//           if(!menuRef.current.contains(e.target)){
//             setProfileCardVisibility(false);
//           }
//       }
//       document.addEventListener("mousedown", onClickOutside)
//   })

    useEffect(() => {
        const modalOverlay = document.querySelector('.blurOverlay');
        const pageHeight = Math.max(
          document.body.scrollHeight, document.documentElement.scrollHeight,
          document.body.offsetHeight, document.documentElement.offsetHeight,
          document.body.clientHeight, document.documentElement.clientHeight
        );
        if (modalOverlay) {
          modalOverlay.style.height = `${pageHeight}px`;
        }
    }, []);

    return(
        <>
            <div className='blurOverlay'>
                <div className='profileModalContent' style={{ top: top }}>
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
        </>   
    )
}