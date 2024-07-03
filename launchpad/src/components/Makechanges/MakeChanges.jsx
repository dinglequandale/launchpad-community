import Modal from "react-modal";

export default function MakeChanges({visibility, onCancel, onVerify}){
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
          zIndex: "10",
        }
      };
    
    return(
        <div>
            <Modal
            isOpen={visibility}
            onRequestClose={onCancel}
            style={customStyles}
            contentLabel="Make Changes Modal"
            >
                <span style={{fontSize: "larger", fontWeight: "300"}}> <span style={{fontWeight: "500", color: "#4d73be"}}>Are you sure</span> you want to lose your changes?</span>
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