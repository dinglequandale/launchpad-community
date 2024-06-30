import { useState } from "react"
import "./basicinfomodal.css"
import Modal from "react-modal"
import MakeChanges from "../Makechanges/MakeChanges";

export default function BasicInfoModal({visibility,onClose,userType,}){
    const [basicInfoContent, setBasicInfoContent] = useState({areasOfInterest: "", colleges: "", yearsOfExperience: "", industryOfExperience});
    const [makeChangesVisibility, setMakeChangesVisibility] = useState(false);
    // later replace with logic tailored to FireStore
  
    const saveBasicInfo = () => {
      localStorage.setItem("userBasicInfo", basicInfoContent);
      onClose();
    }
  
    // useEffect(() => {
    //   const storedBasicInfo = localStorage.getItem("userBasicInfo");
    //   if (storedBasicInfo) {
    //     setBasicInfoContent(basicInfoContent);
    //   }},[visibility])

    const customStyles = {
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          zIndex: "3",
        }
      };

    return(
        <div>
        <MakeChanges visibility={makeChangesVisibility} onCancel={()=>setMakeChangesVisibility(false)} onVerify={onClose}/>
        <Modal
          isOpen={visibility}
          onRequestClose={onClose}
          style={customStyles}
          contentLabel="Basic Info Modal"
          shouldCloseOnOverlayClick={false} 
          shouldCloseOnEsc={false}
        >
          <header>
            <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "10px", color: "var(--secondary)", lineHeight: "1.2"}}> My Introduction <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>Enlighten us with your {userType==="Professional" ? "expertise" : "interests"} and {userType==="Professional" ? "work experience" : userType==="Alumni" ? "accepted colleges" : "dream colleges"}!</span></h2>
            <hr style={{borderColor: "var(--secondary)"}}/>
          </header>
          <main style={{paddingTop: "20px"}}>
            <form style={{width: "650px", display: "flex", gap: "20px", flexDirection: "column"}}>
            <div style={{display: "flex", justifyContent: "space-between"}}>
                    <label htmlFor="areasOfInterest">What is are your areas of {userType==="Professional" ? "expertise" : "interests"}?</label>
                    <input 
                    type="text"
                    name="areasOfInterest"
                    value={basicInfoContent.areasOfInterest}
                    placeholder="E.g. 'finance, data analytics'"/>
                </div>
                {userType !== "Professional" &&
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <label htmlFor="colleges">What is are your areas of {userType==="Professional" ? "expertise" : "interests"}?</label>
                    <input 
                    type="text"
                    name="colleges"
                    value={basicInfoContent.colleges}
                    placeholder=""/>
                </div>}
                {userType === "Professional" && 
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <label htmlFor="experience">  </label>
                    <input 
                    type="text"
                    name="experience"
                    value={basicInfoContent.experience}
                    placeholder=""/>
                </div>}
                {userType === "Professional" &&
                <div style={{display: "flex", justifyContent: "space-between"}}>
                    <label htmlFor="experience">  </label>
                    <input 
                    type="text"
                    name="experience"
                    value={basicInfoContent.experience}
                    placeholder=""/>
                </div>}


            </form>
          </main>
          <footer style={{paddingTop: "20px", display: "flex", justifyContent: "space-between"}}>
            <button onClick={
              ()=>setMakeChangesVisibility(true)
              } style={{borderRadius: "4px", width: "30%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
              Cancel</button>
            <button onClick={saveBasicInfo} type='submit' style={{borderRadius: "4px", width: "45%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
              Save Changes</button>
          </footer>
        </Modal>
      </div>
    )
}