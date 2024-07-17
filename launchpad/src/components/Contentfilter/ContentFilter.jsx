import { useEffect, useRef, useState } from "react";
import "./contentfilter.css";
import { RiArrowDropDownLine } from "react-icons/ri";

export default function ContentFilter({filterContent}){

    const [dropdownVisibility, setDropdownVisibility] = useState(false);
    const [selectedOption, setSelectedOption] = useState(filterContent[0]);

    const onClickOption = (option) => {
        setSelectedOption(option);
    };



    const dropRef = useRef();

    const handleClick = () => {
        setDropdownVisibility(!dropdownVisibility);
    }

    useEffect(()=>{

        let onClickHandler = (e) => {
            if(!dropRef.current.contains(e.target)){
                setDropdownVisibility(false);
            }
        }

        document.addEventListener("mousedown", onClickHandler)
    })

    return(
        <div className="filterContainer" ref={dropRef}>
            <div style={{display: "flex", alignItems: "center", cursor: "pointer"}} className="filterTop" onClick={handleClick}>
                <span style={{fontWeight: "550"}}>{selectedOption ? selectedOption : filterContent[0]}</span>
                <RiArrowDropDownLine size={40}/>
            </div>
            <div className={dropdownVisibility ? "dropdown open" : "dropdown "}>
                {filterContent.map((option, index)=>(
                    <div
                        key={index}
                        style={{
                        padding: "7px",
                        fontWeight: "500",
                        cursor: "pointer",
                        }}
                        className={`filterOptions ${
                        selectedOption === option ? 'active' : ''
                        }`}
                        onClick={() => onClickOption(option)}>
                        {option} <br />
                    </div>
                ))}
            </div>
        </div>
    )
}