import React, { useState } from 'react';
import ContentFilter from "../Contentfilter/ContentFilter";
import "./searchbar.css";
import { CiSearch } from "react-icons/ci";
import { capitalizeFirstLetter } from '../../pages/Homepage/Home';

export default function SearchBar({filters, pageName, handleFilterChange, handleSearch}) {
    const searchType = () => {
        switch(pageName){
            case `The ${capitalizeFirstLetter(localStorage.getItem("schoolId"))} Network`: 
                return "profession, interests, company, or name";
            case "Opportunities":
                return "company, interest, or name"
        }
    }
    const [queryText, setQueryText] = useState('');
 
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
                  .map((filterKey) => (
                      <ContentFilter filterKey={filterKey} filterContent={filters[filterKey]} onFilterChange={handleFilterChange} />
                  ))}
          </div>
      </div>
  );
}