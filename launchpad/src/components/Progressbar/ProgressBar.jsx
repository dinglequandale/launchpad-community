import { useState } from "react";
import "./ProgressBar.css";
import { GrFormPrevious } from "react-icons/gr";
import { GrFormNext } from "react-icons/gr";
import Modal from "react-modal";
import { CgClose } from "react-icons/cg";

export default function ProgressBar({numOfSections, currentPage, setCurrentPage, showLast=true, showArrows=true}){
    const sectionWidth = 100/numOfSections;
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
          zIndex: "10",
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          zIndex: "10",
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
        {bufferModalVisibility && (
          <div className="v0-modal-overlay" onClick={() => setBuffererModalVisibility(false)}>
            <div className="v0-modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="v0-modal-header">
                <button className="v0-modal-close-btn" onClick={() => setBuffererModalVisibility(false)}>
                  <CgClose size={20} />
                </button>
                <h2 className="v0-modal-title">Notice</h2>
              </div>
              <div className="v0-modal-content">
                <p className="v0-modal-text">Please fill out the remainder of the form before proceeding.</p>
              </div>
            </div>
          </div>
        )}
        <div className="v0-step-container">
            {showArrows && (
              <button 
                onClick={goPrevious} 
                className={`v0-progress-arrow ${currentPage === 1 ? "v0-progress-arrow-hidden" : ""}`}
              > 
                <GrFormPrevious size={20}/> Previous 
              </button>
            )}
            <div className="v0-step-bars">
            {emptyArray.map((num, index)=>(
                <div 
                  key={index} 
                  onClick={()=>handleClick(num)} 
                  className={`v0-step-bar ${num <= currentPage ? "v0-step-bar-filled" : "v0-step-bar-unfilled"}`}
                  style={{width: `${sectionWidth}%`}}
                >
                </div>
            ))}
            </div>
            {showArrows && (
              <button 
                onClick={goNext} 
                className={`v0-progress-arrow ${currentPage === numOfSections ? "v0-progress-arrow-hidden" : ""}`}
              > 
                Next <GrFormNext size={20}/> 
              </button>
            )}
        </div>
        </>
    )
}