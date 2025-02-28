import { MdOutlinePersonOutline } from "react-icons/md";

export default function DefaultIcon({length}){
    // width: 44px;
    // /* border-radius: 50%; */
    // box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    // height: 44px;

    return(
        <div style={{borderRadius: "15px", 
        width: "44px", 
        height: "44px", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        background: "var(--secondaryHighlight)",
        border: "var(--border)"}}
        >
            <MdOutlinePersonOutline size={35}/>
        </div>
    )
}
