import { useState, useRef, useEffect } from "react";
import "./contentfilter.css";
import { getColleges } from "../../pages/Onboarding/Options";
import { RiArrowDropDownLine } from "react-icons/ri";
import { BiX, BiTrash } from "react-icons/bi";
import { CiSearch } from "react-icons/ci";

export default function CollegeSearchFilter({ 
    title="College", 
    filterKey, 
    filterContent, 
    currentValue,
    onFilterChange,
    isMultiSelect = true,
    showSearch = true,
    maxSelections = 5,
    allowAnyOption = true
}){
    const [isOpen, setIsOpen] = useState(false);
    const [selectedColleges, setSelectedColleges] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredColleges, setFilteredColleges] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Load default colleges when dropdown opens
    useEffect(() => {
        if (isOpen && filteredColleges.length === 0) {
            loadDefaultColleges();
        }
    }, [isOpen]);

    // Reset internal state when currentValue changes (for clear filters functionality)
    useEffect(() => {
        if (currentValue !== undefined) {
            if (isMultiSelect) {
                setSelectedColleges(Array.isArray(currentValue) ? currentValue : []);
            } else {
                setSelectedColleges(currentValue ? [currentValue] : []);
            }
        }
    }, [currentValue, isMultiSelect]);

    // Search for colleges when user types
    useEffect(() => {
        if (searchQuery.trim() === '') {
            loadDefaultColleges();
            return;
        }

        setLoading(true);
        const searchColleges = async () => {
            try {
                const { colleges } = await getColleges(searchQuery);
                setFilteredColleges(colleges);
            } catch (error) {
                console.error('Error searching colleges:', error);
                setFilteredColleges([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(searchColleges, 300); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Load default colleges
    const loadDefaultColleges = async () => {
        setLoading(true);
        try {
            const { colleges } = await getColleges('');
            setFilteredColleges(colleges.slice(0, 5)); // Show first 5 colleges
        } catch (error) {
            console.error('Error loading default colleges:', error);
            setFilteredColleges([]);
        } finally {
            setLoading(false);
        }
    };

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

    // Handle college selection
    const handleCollegeClick = (college) => {
        const collegeName = college.label || college.value;
        
        if (isMultiSelect) {
            if (selectedColleges.includes(collegeName)) {
                // Remove if already selected
                const newColleges = selectedColleges.filter(c => c !== collegeName);
                setSelectedColleges(newColleges);
                onFilterChange(filterKey, newColleges);
            } else {
                // Add if not selected (check max selections)
                if (maxSelections && selectedColleges.length >= maxSelections) {
                    // Remove oldest selection and add new one
                    const newColleges = [...selectedColleges.slice(1), collegeName];
                    setSelectedColleges(newColleges);
                    onFilterChange(filterKey, newColleges);
                } else {
                    const newColleges = [...selectedColleges, collegeName];
                    setSelectedColleges(newColleges);
                    onFilterChange(filterKey, newColleges);
                }
            }
        } else {
            // Single select
            setSelectedColleges([collegeName]);
            onFilterChange(filterKey, collegeName);
            setIsOpen(false); // Close dropdown for single select
        }
    };

    // Remove selected college
    const removeCollege = (collegeToRemove) => {
        const newColleges = selectedColleges.filter(college => college !== collegeToRemove);
        setSelectedColleges(newColleges);
        onFilterChange(filterKey, isMultiSelect ? newColleges : newColleges[0] || '');
    };

    // Clear search query
    const clearSearch = () => {
        setSearchQuery('');
    };

    // Get display text for the filter (matching ContentFilter logic)
    const getDisplayText = () => {
        if (selectedColleges.length === 0) return title;
        if (selectedColleges.length === 1) return selectedColleges[0];
        if (selectedColleges.length === 2) return `${selectedColleges[0]}, ${selectedColleges[1]}`;
        return `${selectedColleges[0]}, ${selectedColleges[1]} +${selectedColleges.length - 2}`;
    };

    return (
        <div className="filter-dropdown" ref={dropdownRef}>
            <div className="filter-header" onClick={() => setIsOpen(!isOpen)}>
                <div className="filter-content">
                    <span className="filter-title">{getDisplayText()}</span>
                    {isMultiSelect && selectedColleges.length > 0 && (
                        <div className="selected-tags">
                            {selectedColleges.slice(0, 2).map((college, index) => (
                                <span key={index} className="selected-tag">
                                    {college}
                                    <BiX 
                                        size={14} 
                                        className="remove-tag" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeCollege(college);
                                        }}
                                    />
                                </span>
                            ))}
                            {selectedColleges.length > 2 && (
                                <span className="more-tag">+{selectedColleges.length - 2}</span>
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
                    {/* Search section */}
                    <div className="search-container">
                        <CiSearch size={20} className="searchIcon"/>
                        <input
                            type="text"
                            placeholder="Search colleges..."
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
                    
                    {/* Loading state */}
                    {loading && (
                        <div className="loading-container">
                            <div className="loading-spinner">Loading colleges...</div>
                        </div>
                    )}
                    
                    {/* Colleges list */}
                    <div className="options-list">
                        {filteredColleges.map((college, index) => (
                            <label key={index} className="option-item">
                                <input
                                    type={isMultiSelect ? "checkbox" : "radio"}
                                    name={filterKey}
                                    checked={selectedColleges.includes(college.label || college.value)}
                                    onChange={() => handleCollegeClick(college)}
                                />
                                <span className="option-label">{college.label || college.value}</span>
                            </label>
                        ))}
                        {!loading && filteredColleges.length === 0 && (
                            <div className="no-results">No colleges found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
