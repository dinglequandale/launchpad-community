import { useEffect, useRef, useState } from "react";
import "./contentfilter.css";
import { RiArrowDropDownLine } from "react-icons/ri";

export default function ContentFilter({filterContent}){

    console.log(filterContent);
    const [dropdownVisibility, setDropdownVisibility] = useState(false);
    const [selectedOption, setSelectedOption] = useState(filterContent[0]);

    const [displayData, setDisplayData] = useState(false);

    const filterDisplayToIdPairs = [
        {
            "Any Interest":null,
            "Any Field of Expertise":null,
            "Any User":null,
            "My Interests":"areasOfInterest",
            "My Fields of Expertise":"fieldsOfExpertise",
            "High Schoolers":"High Schooler",
            "College Students":"Alumni",
            "Professionals": "Professional",
        },
        {
            "Workplace Opportunities":["Internship", "Shadowing", "Job"],
            "Community Service":"Community Service",
            "Any Subject Matter":null,
            "Any Field of Expertise":null,
            "My Interests":"areasOfInterest",
            "My Fields of Expertise":"fieldsOfExpertise",
            "Clubs": "Club",
            "Youth Voices":"???",
            "Any Category": null,
        }
    ]
    
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