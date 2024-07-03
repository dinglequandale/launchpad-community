import Modal from "react-modal";

export default function DeleteWarningModal({visibility, onCancel, onVerify, objectOfDeletation}){
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
    
    return(
        <div>
            <Modal
            isOpen={visibility}
            onRequestClose={onCancel}
            style={customStyles}
            contentLabel="Delete Warning Modal"
            >
                <main style={{textAlign: "center"}}>
                    <span style={{fontWeight: "600", color: "var(--secondary)", fontSize: "40px"}}>Are you sure</span>
                    <hr style={{width: "70%", borderColor: "var(--accent)", borderWidth: "2px"}}/>
                    <span style={{fontSize: "larger", paddingTop: "10px"}}>You want to delete your <span style={{fontWeight: "500", color: "var(--secondary)"}}>{objectOfDeletation.toLowerCase()}</span> display card?</span>
                </main>
                <div style={{display: "flex", justifyContent: "space-between", paddingTop: "15px"}}>
                    <button 
                    style={{color: "white", width: "30%", borderRadius: "5px", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}} 
                    onClick={onCancel}>
                    No</button>
                    
                    <button onClick={()=>{
                          onCancel();
                          onVerify();
                          }} style={{color: "white", width: "30%", borderRadius: "5px", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
                        Yes</button>
                </div>
            </Modal>
        </div>
    )
}