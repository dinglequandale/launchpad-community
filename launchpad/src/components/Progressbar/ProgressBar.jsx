import { useState } from "react";
import "./progressbar.css";
import { GrFormPrevious } from "react-icons/gr";
import { GrFormNext } from "react-icons/gr";
import Modal from "react-modal";
import { CgClose } from "react-icons/cg";

export default function ProgressBar({numOfSections, currentPage, setCurrentPage, showLast=true}){
    // const sectionWidth = 100/numOfSections;
    // TODO: Integrate showLast state into opportunity modal
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
            <CgClose className="btnClose" size={25} onClick={()=>setBuffererModalVisibility(false)}/>
            <h1 style={{color: "var(--secondary)", lineHeight: "1px", textAlign: "center"}}>Notice:</h1>
            <hr style={{width:"20%", borderColor: "var(--secondary)", borderWidth: "2px"}}/>
            <p style={{fontWeight: "300", fontSize: "larger"}}>Please fill out the remainder of the form before proceeding.</p>
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
            {<button onClick={goNext} className={`btnNavigate ${currentPage === numOfSections ? "hidden" : ""} btnUnfilled`}> Next <GrFormNext size={20}/> </button>}
        </header>
        </>
    )
}