import React, { useState } from 'react';
import ContentFilter from "../Contentfilter/ContentFilter";
import "./searchbar.css";
import { CiSearch } from "react-icons/ci";

export default function SearchBar({filters, pageName, handleFilterChange, handleSearch}) {
    const searchType = () => {
        switch(pageName){
            case "Network":
                return "connections";
            case "Opportunities":
                return "opportunities and organizations"
        }
    }
    const [queryText, setQueryText] = useState('');

    return (
      <div className="searchContainer">
        <h2 style={{paddingLeft: "3%"}}>{pageName}</h2>
        <div style={{dislay: "flex"}} className="search">
            <CiSearch size={28} style={{color:"grey"}}/>
            <form onSubmit={(e) => handleSearch(e, queryText)} style={{ display: "flex", flex: 1 }}>
              <input 
                type="text" 
                name="fname" 
                className="searchBar" 
                placeholder={`Search for ${searchType()}`} 
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
              />
          </form>
        </div>
        <div style={{display: "flex", paddingBottom: "10px", gap: "30px", marginLeft: "5%"}}>
            {Object.keys(filters).filter((filterKey) => filters[filterKey] !== null).map((filterKey)=>(
                <ContentFilter filterKey={filterKey} filterContent={filters[filterKey]} onFilterChange={handleFilterChange}/>
            ))}
        </div>
      </div>
  );
}