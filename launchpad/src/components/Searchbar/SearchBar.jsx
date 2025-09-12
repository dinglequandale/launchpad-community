import React, { useState } from 'react';
import ContentFilter from "../Contentfilter/ContentFilter";
import CollegeSearchFilter from "../Contentfilter/CollegeSearchFilter";
import "./searchbar.css";
import { CiSearch } from "react-icons/ci";
import { capitalizeFirstLetter } from '../../pages/Homepage/Home';
import { careerInterests } from '../../pages/Onboarding/Options';

export default function SearchBar({filters, currentFilters = null, pageName, handleFilterChange, handleSearch, clearAllFilters}) {
    const searchType = () => {
        switch(pageName){
            case `The ${capitalizeFirstLetter(localStorage.getItem("schoolId"))} Network`: 
                return "profession, interests, company, or name";
            case "Opportunities":
                return "company, interest, or name"
            default:
                return "search terms"
        }
    }
    
    const [queryText, setQueryText] = useState('');
    
    // Enhanced filter configurations with multi-select support
    const getFilterConfig = (filterKey) => {
        switch(filterKey) {
            case 'userType':
                return {
                    title: "User Type",
                    isMultiSelect: false,
                    showSearch: false,
                    allowAnyOption: true
                };
            case 'collegeInterestsOrDecision':
                return {
                    title: "College",
                    isMultiSelect: true,
                    showSearch: true,
                    maxSelections: 5,
                    allowAnyOption: true
                };
            case 'areasOfInterestOrExpertise':
                return {
                    title: "Any Interests",
                    isMultiSelect: true,
                    showSearch: true,
                    maxSelections: 8,
                    allowAnyOption: true
                };
            case 'schoolAttending':
                return {
                    title: "High School",
                    isMultiSelect: false,
                    showSearch: false,
                    allowAnyOption: true
                };
            case 'networkingLevel':
                return {
                    title: "Networking Commitment",
                    isMultiSelect: true,
                    showSearch: false,
                    maxSelections: 3,
                    allowAnyOption: true
                };
            default:
                return {
                    title: filterKey,
                    isMultiSelect: false,
                    showSearch: true,
                    allowAnyOption: true
                };
        }
    };

    // Enhanced filter content with specific interests and colleges
    const getEnhancedFilterContent = (filterKey, currentContent) => {
        if (filterKey === 'areasOfInterestOrExpertise') {
            // Add specific career interests from Options.jsx
            const specificInterests = careerInterests.map(ci => ci.label);
            return [
                ...currentContent,
                ...specificInterests
            ];
        } else if (filterKey === 'collegeInterestsOrDecision') {
            // For college search, we'll use the existing college search functionality
            // This will be populated dynamically when user types
            return currentContent;
        }
        return currentContent;
    };
 
    return (
        <div className="searchContainer">
            <h2 className="search-title">{pageName}</h2>
            <div className="search">
                <form onSubmit={(e) => handleSearch(e, queryText)} className="search-form">
                    <CiSearch size={20} className="searchIcon" />
                    <input
                        type="text"
                        name="fname"
                        className="searchBar"
                        placeholder={`Search by ${searchType()}`}
                        value={queryText}
                        onChange={(e) => setQueryText(e.target.value)}
                    />
                </form>
            </div>
            <div className="search-filters">
                {Object.keys(filters)
                    .filter((filterKey) => filters[filterKey] !== null)
                    .map((filterKey) => {
                        const config = getFilterConfig(filterKey);
                        const enhancedContent = getEnhancedFilterContent(filterKey, filters[filterKey]);
                        
                        // Use CollegeSearchFilter for college searches
                        if (filterKey === 'collegeInterestsOrDecision') {
                            return (
                                <CollegeSearchFilter 
                                    key={`${filterKey}-${currentFilters ? JSON.stringify(currentFilters[filterKey]) : 'default'}`}
                                    title={config.title}
                                    filterKey={filterKey} 
                                    filterContent={enhancedContent} 
                                    currentValue={currentFilters ? currentFilters[filterKey] : undefined}
                                    onFilterChange={handleFilterChange}
                                    isMultiSelect={config.isMultiSelect}
                                    showSearch={config.showSearch}
                                    maxSelections={config.maxSelections}
                                    allowAnyOption={config.allowAnyOption}
                                />
                            );
                        }
                        
                        return (
                            <ContentFilter 
                                key={`${filterKey}-${currentFilters ? JSON.stringify(currentFilters[filterKey]) : 'default'}`}
                                title={config.title}
                                filterKey={filterKey} 
                                filterContent={enhancedContent} 
                                currentValue={currentFilters ? currentFilters[filterKey] : undefined}
                                onFilterChange={handleFilterChange}
                                isMultiSelect={config.isMultiSelect}
                                showSearch={config.showSearch}
                                maxSelections={config.maxSelections}
                                allowAnyOption={config.allowAnyOption}
                            />
                        );
                    })}
                {clearAllFilters && (
                    <button 
                        className="v0-clear-filters-btn"
                        onClick={clearAllFilters}
                    >
                        Clear All Filters
                    </button>
                )}
            </div>
        </div>
    );
}