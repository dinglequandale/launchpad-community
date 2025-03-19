import React, { useState } from 'react';
import ContentFilter from "../Contentfilter/ContentFilter";
import "./searchbar.css";
import { CiSearch } from "react-icons/ci";

export default function SearchBar({filters, pageName, handleFilterChange, handleSearch}) {
    const searchType = () => {
        switch(pageName){
            case "The Ram Network":
                return "profession, interests, company, or name";
            case "Opportunities":
                return "company, interest, or name"
        }
    }
    const [queryText, setQueryText] = useState('');

    return (
      <div className="searchContainer" style={{background: "white"}}>
          <h2 style={{ paddingLeft: "3%" }}>{pageName}</h2>
          <div className="search">
              <form onSubmit={(e) => handleSearch(e, queryText)} style={{ display: "flex", flex: 1, position: "relative" }}>
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
          <div style={{ display: "flex", paddingBottom: "10px", gap: "30px", marginLeft: "5%" }}>
              {Object.keys(filters)
                  .filter((filterKey) => filters[filterKey] !== null)
                  .map((filterKey) => (
                      <ContentFilter filterKey={filterKey} filterContent={filters[filterKey]} onFilterChange={handleFilterChange} />
                  ))}
          </div>
      </div>
  );
}