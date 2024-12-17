import { getFunctions, httpsCallable } from "firebase/functions";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { GrAdd } from "react-icons/gr";
import Modal from "react-modal";

export default function InviteContactsModal({visibility, onClose}){

    // const [targetUserData, setTargetUserData] = useState([{userName: "", email: ""}]);
    const [targetUserData,setTargetUserData] = useState([{id: 0, userName: "", email: ""}])
    const {userName} = JSON.parse(localStorage.getItem("basicUserInfo"));
    const customStyles = {
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          zIndex: "4",
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          zIndex: "4",
        }
      };

      const onInviteSend = async () => {
        const loadingToast = toast.loading('Sending your invitations...');
      
        try {
          const sendInvitations = httpsCallable(getFunctions(), "sendInviteEmail");
          const result = await sendInvitations({ recipientData: targetUserData, senderName: userName });
    
          toast.success('Invitations sent successfully!', { id: loadingToast });
      
          onClose();
      
        } catch (error) {
          toast.error(`Failed to send invitations!`, { id: loadingToast });
      
          // You can handle the error case here (e.g., log the error, show more details to the user)
          console.error('Error sending invitations:', error);
        }
      };
      

      const handleInputChange = (key, value, index) => {
        // const prevUserData = targetUserData;
        
        // prevUserData[index] = {...prevUserData[index], [key]: value};
        setTargetUserData([...targetUserData.map((userData) => (userData.id === index ? {id: index, ... targetUserData[index], [key]: value} : userData))]);
        console.log(targetUserData);
      }

      const handleAddTargetUser = () => {
        console.log("Adding user")
        // const newTargetData = targetUserData.push({userName: "", email: ""});
        setTargetUserData([...targetUserData, {id: targetUserData.length, userName: "", email: ""}]);

        console.log(targetUserData)
      }
    
      return (
        <div>
           <Toaster position="bottom-right" reverseOrder={false} />
          <Modal
            isOpen={visibility}
            onRequestClose={onClose}
            style={customStyles}
            contentLabel="Invite Contacts Modal"
          >
            <header>
              <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "5px", color: "var(--secondary)"}}> Invite Friends, Family, Colleagues, ... <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>Help grow our community!</span></h2>
              <hr style={{borderColor: "var(--secondary)"}}/>
            </header>
            <main style={{paddingTop: "10px", display: "flex", flexDirection: "column", gap: "7px"}}>
                {targetUserData.map((user, index) => (
                  <form onSubmit={handleAddTargetUser}>
                    <h2 style={{color: "var(--secondary)", textAlign: "center"}}>Recipient {index + 1}</h2>
                    <div style={{display: "flex", justifyContent: "space-around"}}>
                    <input type="text" style={{width: "35%"}} value={user.userName} placeholder="Full Name" onChange={(e) => handleInputChange("userName", e.target.value, index)}/>
                    <input type="text" style={{width: "50%"}} value={user.email} placeholder="Email" onChange={(e) => handleInputChange("email", e.target.value, index)}/>
                    </div>
                  </form>
                ))}
            </main>
            <footer style={{paddingTop: "20px", position: "relative"}}>
                <button className="btnText" onClick={handleAddTargetUser} style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "larger", margin: "0 auto", marginBottom: "20px"}}><GrAdd size={25}/> Add another contact!</button>
                <div style={{display: "flex", justifyContent: "space-between",}}>
                  <button onClick={onClose} className="btnUnfilled" style={{borderRadius: "4px", width: "35%", padding: "8px", fontSize: "larger"}}>
                      Cancel</button>
                  <button onClick={onInviteSend} type='submit' className="btnSaveChanges" style={{borderRadius: "4px", width: "35%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
                      Send it!</button>
                </div>
            </footer>
          </Modal>
        </div>
      );
}