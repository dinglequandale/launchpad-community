import "./searchbar.css";
import { CiSearch } from "react-icons/ci";

export default function SearchBar({filters}) {
    return (
        <div className="searchContainer">
            <h2 style={{paddingLeft: "3%"}}>Network</h2>
            <div style={{dislay: "flex"}} className="search">
                <CiSearch size={28} style={{color:"grey"}}/>
                <input type="text" name="fname" className="searchBar" placeholder="Search for connections" />
            </div>
            <div style={{display: "flex", paddingBottom: "10px", gap: "30px", marginLeft: "5%"}}>
                <span className="searchFilter">
                    Upperclassmen
                </span>
                <span className="searchFilter">
                    Alumni
                </span>
                <span className="searchFilter">
                    Professionals
                </span>
                <span className="searchFilter">
                    More Filters +
                </span>
            </div>
        </div>
        
    )
}