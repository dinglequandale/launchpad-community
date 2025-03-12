import { useEffect, useRef, useState } from "react";
import "./contentfilter.css";
import { RiArrowDropDownLine } from "react-icons/ri";
import { BiSearch, BiTrash } from "react-icons/bi";
import { CiSearch } from "react-icons/ci";

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

// export default function ContentFilter({ title="title", filterKey, filterContent, onFilterChange }){
//     const [isOpen, setIsOpen] = useState(false);
//     const [selectedOptions, setSelectedOptions] = useState([]);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [filteredOptions, setFilteredOptions] = useState(filterContent);
//     const dropdownRef = useRef(null);
  
//     // Filter options based on search query
//     useEffect(() => {
//       if (searchQuery.trim() === '') {
//         setFilteredOptions(filterContent);
//       } else {
//         const filtered = filterContent.filter(option => 
//           option.toLowerCase().includes(searchQuery.toLowerCase())
//         );
//         setFilteredOptions(filtered);
//       }
//     }, [searchQuery, filterContent]);
  
//     // Close dropdown when clicking outside
//     useEffect(() => {
//       const handleClickOutside = (event) => {
//         if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//           setIsOpen(false);
//         }
//       };
  
//       document.addEventListener('mousedown', handleClickOutside);
//       return () => {
//         document.removeEventListener('mousedown', handleClickOutside);
//       };
//     }, []);
  
//     // Toggle dropdown
//     const toggleDropdown = () => {
//       setIsOpen(!isOpen);
//     };
  
//     // Handle checkbox change
//     const handleCheckboxChange = (option) => {
//       let newSelectedOptions;
      
//       if (option.includes('Any')) {
//         // If "Any Interest" is selected, clear all other selections
//         newSelectedOptions = selectedOptions.includes('Any') 
//           ? [] 
//           : ['Any Interest'];
//       } else {

//         const withoutAny = selectedOptions.filter(item => !item.includes('Any'));
        
//         if (withoutAny.includes(option)) {
//           newSelectedOptions = withoutAny.filter(item => item !== option);
//         } else {
//           newSelectedOptions = [...withoutAny, option];
//         }
//       }
      
//       setSelectedOptions(newSelectedOptions);
      
//       if (onFilterChange) {
//         onFilterChange(filterKey, selectedOptions.map(option => filterDisplayToIdPairs(option) ?? option));
//       }
//     };
  
//     // Clear search query
//     const clearSearch = () => {
//       setSearchQuery('');
//     };
  
//     return (
//       <div className="filter-dropdown" ref={dropdownRef}>
//         <div className="filter-header" onClick={toggleDropdown}>
//           <span className="filter-title">{title}</span>
//         </div>
        
//         {isOpen && (
//           <div className="dropdown-content">
//             <div className="search-container">
//               <CiSearch size={20} className="searchIcon"/>
//               <input
//                 type="text"
//                 placeholder="Search"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="search-input"
//               />
//               {searchQuery && (
//                 <button className="clear-button" onClick={clearSearch}>
//                   <BiTrash />
//                 </button>
//               )}
//             </div>
//             <div className="divider"></div>
//             <div className="options-list">
//               {filteredOptions.map((option, index) => (
//                 <label key={index} className="option-item">
//                   <input
//                     type="checkbox"
//                     checked={selectedOptions.includes(option)}
//                     onChange={() => handleCheckboxChange(option)}
//                   />
//                   <span className="option-label">{option}</span>
//                 </label>
//               ))}
//               {filteredOptions.length === 0 && (
//                 <div className="no-results">No matching options found</div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }
  

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
            <div className={dropdownVisibility ? "dropdown open" : "dropdown "} style={{border: !dropdownVisibility ? "none" : ""}}>
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