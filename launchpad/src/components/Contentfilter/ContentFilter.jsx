import { useEffect, useRef, useState } from "react";
import "./contentfilter.css";
import { RiArrowDropDownLine } from "react-icons/ri";
import { BiSearch, BiTrash, BiX } from "react-icons/bi";
import { CiSearch } from "react-icons/ci";

const filterDisplayToIdPairs = {
    "My Interests":"areasOfInterest",
    "My Fields of Expertise":"areasOfInterest",
    "High Schoolers":"High Schooler",
    "College Students":"Alumni",
    "Professionals": "Professional",
    "Workplace Opportunities":["Internship", "Shadowing", "Job"],
    "Community Service":"Community Service",
    "Clubs": "Club",
    "Nonprofits":"Nonprofit",
    "My Dream Colleges":"collegeInterestsOrDecision",
    "My College":"collegeInterestsOrDecision",
    "My High School":"schoolAttending",
    "Businesses":"Business",
    "Leadership":"Youth Leadership"
}

export default function ContentFilter({ 
    title="Filter", 
    filterKey, 
    filterContent, 
    currentValue,
    onFilterChange,
    isMultiSelect = false,
    showSearch = true,
    maxSelections = null,
    allowAnyOption = true
}){
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(filterContent);
    const dropdownRef = useRef(null);
  
    // Initialize with first option if single select (only once)
    useEffect(() => {
        if (!isMultiSelect && filterContent && filterContent.length > 0 && selectedOptions.length === 0) {
            setSelectedOptions([filterContent[0]]);
        }
    }, [filterContent, isMultiSelect, selectedOptions.length]);

    // Reset internal state when currentValue changes (for clear filters functionality)
    useEffect(() => {
        if (currentValue !== undefined) {
            if (isMultiSelect) {
                setSelectedOptions(Array.isArray(currentValue) ? currentValue : []);
            } else {
                setSelectedOptions(currentValue ? [currentValue] : []);
            }
        }
    }, [currentValue, isMultiSelect]);

    // Filter options based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredOptions(filterContent);
        } else {
            const filtered = filterContent.filter(option => 
                option.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredOptions(filtered);
        }
    }, [searchQuery, filterContent]);
  
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
  
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
  
    // Toggle dropdown
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };
  
    // Handle option selection
    const handleOptionChange = (option) => {
        let newSelectedOptions;
        
        if (isMultiSelect) {
            if (option.includes('Any') && allowAnyOption) {
                // If "Any" option is selected, clear all other selections
                newSelectedOptions = selectedOptions.includes(option) 
                    ? [] 
                    : [option];
            } else {
                // Remove "Any" option if it exists
                const withoutAny = selectedOptions.filter(item => !item.includes('Any'));
                
                if (withoutAny.includes(option)) {
                    newSelectedOptions = withoutAny.filter(item => item !== option);
                } else {
                    // Check max selections limit
                    if (maxSelections && withoutAny.length >= maxSelections) {
                        // Remove oldest selection and add new one
                        newSelectedOptions = [...withoutAny.slice(1), option];
                    } else {
                        newSelectedOptions = [...withoutAny, option];
                    }
                }
            }
        } else {
            // Single select
            newSelectedOptions = [option];
        }
        
        setSelectedOptions(newSelectedOptions);
        
        // Call parent handler
        if (onFilterChange) {
            const value = isMultiSelect ? newSelectedOptions : newSelectedOptions[0];
            onFilterChange(filterKey, value);
        }
    };

    // Remove specific option (for multi-select)
    const removeOption = (optionToRemove) => {
        const newSelectedOptions = selectedOptions.filter(option => option !== optionToRemove);
        setSelectedOptions(newSelectedOptions);
        
        if (onFilterChange) {
            const value = isMultiSelect ? newSelectedOptions : newSelectedOptions[0];
            onFilterChange(filterKey, value);
        }
    };
  
    // Clear search query
    const clearSearch = () => {
        setSearchQuery('');
    };

    // Get display text for the filter
    const getDisplayText = () => {
        if (selectedOptions.length === 0) return title;
        if (selectedOptions.length === 1) return selectedOptions[0];
        if (selectedOptions.length === 2) return `${selectedOptions[0]}, ${selectedOptions[1]}`;
        return `${selectedOptions[0]}, ${selectedOptions[1]} +${selectedOptions.length - 2}`;
    };
  
    return (
        <div className="filter-dropdown" ref={dropdownRef}>
            <div className="filter-header" onClick={toggleDropdown}>
                <div className="filter-content">
                    <span className="filter-title">{getDisplayText()}</span>
                    {isMultiSelect && selectedOptions.length > 0 && (
                        <div className="selected-tags">
                            {selectedOptions.slice(0, 2).map((option, index) => (
                                <span key={index} className="selected-tag">
                                    {option}
                                    <BiX 
                                        size={14} 
                                        className="remove-tag" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeOption(option);
                                        }}
                                    />
                                </span>
                            ))}
                            {selectedOptions.length > 2 && (
                                <span className="more-tag">+{selectedOptions.length - 2}</span>
                            )}
                        </div>
                    )}
                </div>
                <RiArrowDropDownLine 
                    size={20} 
                    className={`dropdown-arrow ${isOpen ? 'open' : ''}`} 
                />
            </div>
            
            {isOpen && (
                <div className="dropdown-content">
                    {showSearch && (
                        <>
                            <div className="search-container">
                                <CiSearch size={20} className="searchIcon"/>
                                <input
                                    type="text"
                                    placeholder="Search options..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                                {searchQuery && (
                                    <button className="clear-button" onClick={clearSearch}>
                                        <BiTrash />
                                    </button>
                                )}
                            </div>
                            <div className="divider"></div>
                        </>
                    )}
                    
                    <div className="options-list">
                        {filteredOptions.map((option, index) => (
                            <label key={index} className="option-item">
                                <input
                                    type={isMultiSelect ? "checkbox" : "radio"}
                                    name={filterKey}
                                    checked={selectedOptions.includes(option)}
                                    onChange={() => handleOptionChange(option)}
                                />
                                <span className="option-label">{option}</span>
                            </label>
                        ))}
                        {filteredOptions.length === 0 && (
                            <div className="no-results">No matching options found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}