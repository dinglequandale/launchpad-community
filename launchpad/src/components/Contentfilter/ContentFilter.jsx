import { useEffect, useRef, useState } from "react";
import "./contentfilter.css";
import { RiArrowDropDownLine } from "react-icons/ri";

const filterDisplayToIdPairs = {
    "My Interests":"areasOfInterest",
    "My Fields of Expertise":"areasOfInterest",
    "High Schoolers":"High Schooler",
    "College Students":"Alumni",
    "Professionals": "Professional",
    "Workplace Opportunities":["Internship", "Shadowing", "Job"],
    "Community Service":"Community Service",
    "My Interests":"areasOfInterest",
    "My Fields of Expertise":"areasOfInterest",
    "Clubs": "Club",
    "Nonprofits":"Nonprofit",
    "My Dream Colleges":"collegeInterestsOrDecision",
    "My College":"collegeInterestsOrDecision",
    "My High School":"schoolAttending",
    "Businesses":"Business",
    "Leadership":"Youth Leadership"
}

export default function ContentFilter({filterKey, filterContent, onFilterChange}){

    const [dropdownVisibility, setDropdownVisibility] = useState(false);
    const [selectedOption, setSelectedOption] = useState(filterContent[0]);

    const onClickOption = (option) => {
        setDropdownVisibility(false);
        setSelectedOption(option);
        onFilterChange(filterKey, filterDisplayToIdPairs[option] ?? option);
    };

    const dropRef = useRef();

    const handleClick = () => {
        setDropdownVisibility(!dropdownVisibility);
    }

    useEffect(()=>{

        let onClickHandler = (e) => {
            try{
            if(!dropRef.current.contains(e.target)){
                setDropdownVisibility(false);
            }
        }catch{}
        }

        document.addEventListener("mousedown", onClickHandler)
    },[])

    return(
        <div className="filterContainer" ref={dropRef}>
            <div style={{display: "flex", alignItems: "center", cursor: "pointer"}} className="filterTop" onClick={handleClick}>
                <span style={{fontWeight: "550"}}>{selectedOption ? selectedOption : filterContent[0]}</span>
                <RiArrowDropDownLine size={40}/>
            </div>
            <div className={dropdownVisibility ? "dropdown open" : "dropdown "}>
                {Object.values(filterContent).filter((filter)=>filter !== null).map((option, index)=>(
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