import { useEffect, useRef, useState } from "react";
import "./contentfilter.css";
import { RiArrowDropDownLine } from "react-icons/ri";

export default function ContentFilter({filterContent}){

    const [dropdownVisibility, setDropdownVisibility] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);

    const onClickOption = (option) => {
        setSelectedOptions(prevSelected => {
        if (prevSelected.includes(option)) {
            // Option is already selected, remove it
            return prevSelected.filter(item => item !== option);
        } else {
            // Option is not selected, add it
            return [...prevSelected, option];
        }
        });
    };



    const dropRef = useRef();

    const options = filterContent[1];
    console.log(options, filterContent[0])

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
                <span style={{fontWeight: "550"}}>{filterContent[0]}</span>
                <RiArrowDropDownLine size={40}/>
            </div>
            <div className={dropdownVisibility ? "dropdown open" : "dropdown "}>
                {options.map((option, index)=>(
                    <div
                    key={index}
                    style={{
                      padding: "7px",
                      fontWeight: "500",
                      textShadow: "#7883FF 1px 0 5px",
                      cursor: "pointer",
                    }}
                    className={`filterOptions ${
                      selectedOptions.includes(option) ? 'active' : ''
                    }`}
                    onClick={() => onClickOption(option)}>
                    {option} <br />
                  </div>
                ))}
            </div>
        </div>
    )
}