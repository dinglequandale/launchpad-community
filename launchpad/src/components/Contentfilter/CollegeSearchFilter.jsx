import { useState } from "react";
import "./contentfilter.css";
import { CollegeSearch } from "../../pages/Onboarding/Options";

export default function CollegeSearchFilter({ 
    title="College", 
    filterKey, 
    filterContent, 
    onFilterChange,
    isMultiSelect = true,
    showSearch = true,
    maxSelections = 5,
    allowAnyOption = true
}){
    const [selectedOptions, setSelectedOptions] = useState({});

    // Handle college selection changes
    const handleCollegeChange = (field, value) => {
        setSelectedOptions(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Convert the value to the format expected by the parent component
        if (isMultiSelect) {
            // For multi-select, value should be an array of strings
            const collegeNames = Array.isArray(value) 
                ? value.map(college => typeof college === 'string' ? college : college.label || college.value)
                : [];
            onFilterChange(filterKey, collegeNames);
        } else {
            // For single select, value should be a string
            const collegeName = value ? 
                (typeof value === 'string' ? value : value.label || value.value) 
                : '';
            onFilterChange(filterKey, collegeName);
        }
    };

    return (
        <div className="content-filter">
            <div className="filter-header">
                <span className="filter-title">{title}</span>
            </div>
            
            <div className="college-search-container">
                <CollegeSearch
                    selectedOptions={selectedOptions}
                    handleChange={handleCollegeChange}
                    isMultiSelect={isMultiSelect}
                    showQuestion={false}
                    field={filterKey}
                />
            </div>
        </div>
    );
}
