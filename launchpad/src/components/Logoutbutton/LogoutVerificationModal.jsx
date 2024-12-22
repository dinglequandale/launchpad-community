import Modal from "react-modal";

export default function LogoutVerificationModal({visibility, onCancel, onVerify}){
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
                    <span style={{fontSize: "larger", paddingTop: "10px"}}>You want to <span style={{color: "var(--highlight)", textDecoration: "underline"}}>logout</span> of your account?</span>
                </main>
                <div style={{display: "flex", justifyContent: "space-between", paddingTop: "15px"}}>
                <button 
                    className="btnUnfilled"
                    style={{width: "30%", borderRadius: "5px", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}} 
                    onClick={onCancel}>
                    No
                </button>
                    
                <button onClick={()=>{
                      onCancel();
                      onVerify();
                      }} className="btnSaveChanges" style={{ width: "30%", borderRadius: "5px", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
                  Yes
                </button>
                </div>
            </Modal>
        </div>
    )
}