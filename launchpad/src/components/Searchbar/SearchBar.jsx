import ContentFilter from "../Contentfilter/ContentFilter";
import "./searchbar.css";
import { CiSearch } from "react-icons/ci";

export default function SearchBar({filters, pageName}) {
    return (
        <div className="searchContainer">
            <h2 style={{paddingLeft: "3%"}}>{pageName}</h2>
            <div style={{dislay: "flex"}} className="search">
                <CiSearch size={28} style={{color:"grey"}}/>
                <input type="text" name="fname" className="searchBar" placeholder="Search for connections" />
            </div>
            <div style={{display: "flex", paddingBottom: "10px", gap: "30px", marginLeft: "5%"}}>
                {filters.map((filter, index)=>(
                    <ContentFilter filterContent={filters[index]}/>
                ))}
            </div>
        </div>
        
    )
}