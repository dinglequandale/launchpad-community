import './editprofilecard.css';
import React from 'react';
import { VscAccount } from "react-icons/vsc";
import { SlLink } from "react-icons/sl";   
import { IoCloseOutline } from "react-icons/io5";
import { useState, useEffect, useRef } from 'react';
import { IoAdd } from "react-icons/io5";
import { IoLockClosedOutline } from "react-icons/io5";
import { TbWorld } from "react-icons/tb";

export default function ProfileCard({userData, onClose}) {

    const userType = ["professional, high schooler, alumni"];
    const userName = "Shuja";

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
            <div className='editprofileCardContainer'>
                <div className='editprofileCard'>
                    <div style={{borderBottomStyle: "solid", borderColor: "#C0C0C0", paddingBottom: "20px"}}>
                        <IoCloseOutline className='return' onClick={onClose}/>
                        <div className='basicInfo'>
                            <div>
                                <VscAccount size = {80} className='cardPfp'/>
                            </div>
                            <div className='cardNameDescription'>
                                <span className='cardName'>Name Tittel</span>
                                <span className='cardDescription'> Short description</span>
                            </div>   
                        </div>
                        <div className='userInfo' style={{fontSize: "16px"}}>
                            <span>Current position (if applicable): ...</span>
                            <span>Expertise (if applicable): ... </span>
                        </div>
                        <button className='cardbtnConnect'> 
                            <div>
                                <SlLink size={15}/> Connect
                            </div> 
                        </button>
                    </div>
                    <div style={{paddingTop: "20px"}}>
                        <div className="initiativeOrOpportunity" style={{backgroundColor: "#DFECEF", borderRadius: "20px", padding: "0px 5px",
                            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
                            <p style={{color: "#4d73be", textAlign: "center", borderBottomStyle: "solid", paddingBottom: "5px"}}>
                                <span style={{fontWeight: "bolder"}}>Do you</span> currently have an available <span style={{fontWeight: "bolder"}}>workplace opportunity</span> at your organization for high school or college students?
                            </p>
                            <div className="addOne">
                                <IoAdd size={25} />
                                <span style={{textDecoration: "underline"}}>Add one!</span>
                            </div>
                        </div>
                    </div>
                    <div className="aboutMe" style={{paddingTop: "20px"}}>
                        <span style={{fontSize: "20px", fontWeight: "bolder"}}>About Me ...</span> <br />
                        <span style={{fontWeight: "250", fontSize: "15px"}}>Share a little about yourself. Why and with who do you want to connect?</span>
                        <div className="addOne">
                            <IoAdd size={25} />
                            <span style={{textDecoration: "underline"}}>Add an About Me Description</span>
                        </div>
                    </div>
                    <div className="userResume">
                    <div style={{display: "flex", justifyContent: "space-between"}}>
                        <span style={{fontSize: "20px", fontWeight: "bolder"}}>{userName}'s Resume ...</span>
                        <PublicPrivateDropdown/>
                    </div>
                    <span style={{fontWeight: "250", fontSize: "15px"}}>Upload a resume so others can understand more about your experiences.</span> 
                    <div className="addOne">
                        <IoAdd size={25} />
                        <span style={{textDecoration: "underline"}}>Upload a Resume</span>
                    </div>
                    </div>

                </div>
            </div>
        </>
    )
}

function EditInformation(){
    return(
        <div style={{display: "flex", flexDirection: "column", alignItems:"center", justifyContent: "center"}}>
            <span style={{textDecoration: "underline", color: "#4d73be"}}>
            </span>
        </div>
    )
}

function PublicPrivateDropdown({userResumePublicity}){
    const dropdownRef = useRef();
    const [selectedPublicity, setSelectedPublicity] = useState(<div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"}}> {<TbWorld/>} <span>Public</span>
        </div>);
    const [dropdownVisibility, setDropdownVisibility] = useState(false);
    const options = [["Public",<TbWorld size={15}/>], ["Private", <IoLockClosedOutline size={25}/>]];
    const handleClick = () => {
        setDropdownVisibility(!dropdownVisibility);
    }
    const [optionSelected, setOptionSelected] = useState("");

    useEffect(()=>{
        let onClickHandler = (e) => {
            if(!dropdownRef.current.contains(e.target)){
                setDropdownVisibility(false);
            }
        }

        document.addEventListener("mousedown", onClickHandler)
    })
    return(
        <div className="dropdownContainer" ref={dropdownRef}>
            <div style={{display: "flex", alignItems: "center", cursor: "pointer"}} className="filterTop" onClick={handleClick}>
                <span style={{fontWeight: "550"}}>{selectedPublicity}</span>
            </div>
            <div className={dropdownVisibility ? "dropdown open" : "dropdown "}>
                {options.map(([option,icon],index)=>(<div style={{className={}, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "5px"}} key={index}> {icon}
                     <span>{option}</span>
                     </div>))}
            </div>
        </div>
    )
}