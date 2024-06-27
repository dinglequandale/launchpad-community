import "./progressbar.css";
import { GrFormPrevious } from "react-icons/gr";
import { GrFormNext } from "react-icons/gr";

export default function ProgressBar({numOfSections, currentPage, setCurrentPage}){
    // const sectionWidth = 100/numOfSections;
    const emptyArray = Array.from({ length: numOfSections }, (_, i) => i + 1); 

    const goPrevious = () => {
        setCurrentPage(currentPage - 1);
      }
    
      const goNext = () => {
        setCurrentPage(currentPage + 1);
      }

    return(
        <header style={{display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "20px", paddingTop: "10px"}}>
            {<button onClick={goPrevious} className={`btnNavigate ${currentPage === 1 ? "hidden" : ""} btnUnfilled`}> <GrFormPrevious size={20}/> Previous </button>}
            <div style={{display: "flex", gap: "4px", width: "40%", overflow: "hidden", borderRadius: "10px",boxShadow: "var(--shadowColor)"}}>
            {emptyArray.map((num, index)=>(
                <div key={index} onClick={()=>setCurrentPage(num)} className={`bar ${num <= currentPage ? "filled" : "unfilled"}`} style={{width: "30%", height: "12px", cursor: "pointer"}}>
                    <br />
                </div>
            ))}
            </div>
            {<button onClick={goNext} className={`btnNavigate ${currentPage === 5 ? "hidden" : ""} btnUnfilled`}> Next <GrFormNext size={20}/> </button>}
        </header>
    )
}