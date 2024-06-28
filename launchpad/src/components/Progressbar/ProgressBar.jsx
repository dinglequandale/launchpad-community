import { useState } from "react";
import "./progressbar.css";
import { GrFormPrevious } from "react-icons/gr";
import { GrFormNext } from "react-icons/gr";
import Modal from "react-modal";

export default function ProgressBar({numOfSections, currentPage, setCurrentPage, showLast=false}){
    // const sectionWidth = 100/numOfSections;
    const emptyArray = Array.from({ length: numOfSections }, (_, i) => i + 1); 
    const [bufferModalVisibility, setBuffererModalVisibility] = useState(false);

    const goPrevious = () => {
        setCurrentPage(currentPage - 1);
      }
    
    const goNext = () => {
    if(currentPage===numOfSections-1 && !showLast){
        setBuffererModalVisibility(true);
    }
    else{
        setCurrentPage(currentPage + 1);;
    }
    }
      const customStyles = {
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          zIndex: "5",
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          zIndex: "4",
        }
      };

      const handleClick = (num) => {
        if(num === numOfSections && !showLast){
            setBuffererModalVisibility(true);
        }
        else{
            setCurrentPage(num);
        }
      }

    return(
        <>
        <Modal
        isOpen={bufferModalVisibility}
        onRequestClose={()=>setBuffererModalVisibility(false)}
        style={customStyles}
        contentLabel="Buffer Modal"
        >
            <h1>Note:</h1>
            <p>Please fill out the remainder of the form before proceeding.</p>
        </Modal>
        <header style={{display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "20px", paddingTop: "10px"}}>
            {<button onClick={goPrevious} className={`btnNavigate ${currentPage === 1 ? "hidden" : ""} btnUnfilled`}> <GrFormPrevious size={20}/> Previous </button>}
            <div style={{display: "flex", gap: "4px", width: "40%", overflow: "hidden", borderRadius: "10px",boxShadow: "var(--shadowColor)"}}>
            {emptyArray.map((num, index)=>(
                <div key={index} onClick={()=>handleClick(num)} className={`bar ${num <= currentPage ? "filled" : "unfilled"}`} style={{width: "30%", height: "12px", cursor: "pointer"}}>
                    <br />
                </div>
            ))}
            </div>
            {<button onClick={goNext} className={`btnNavigate ${currentPage === 5 ? "hidden" : ""} btnUnfilled`}> Next <GrFormNext size={20}/> </button>}
        </header>
        </>
    )
}