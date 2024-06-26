import "./progressbar.css"

export default function ProgressBar({numOfSections, currentPage, setCurrentPage}){
    const sectionWidth = 100/numOfSections;
    const emptyArray = Array.from({ length: numOfSections }, (_, i) => i + 1); 

    return(
        <div style={{display: "flex", gap: "4px", width: "40%", borderStyle: "solid"}}>
        {emptyArray.map((num, index)=>(
            <div key={index} onClick={()=>setCurrentPage(num)} className={`bar ${num <= currentPage ? "filled" : "unfilled"}`} style={{width: "30%", height: "20px"}}>
                <br />
            </div>
        ))}
        </div>
    )
}