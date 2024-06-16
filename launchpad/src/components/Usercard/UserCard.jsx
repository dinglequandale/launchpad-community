import "./usercard.css";
import { VscAccount } from "react-icons/vsc";
import { SlLink } from "react-icons/sl";   
import { IoCloseOutline } from "react-icons/io5";

export default function ProfileCard({userData}) {
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
                </div>
            </div>
        </>   
    )
}