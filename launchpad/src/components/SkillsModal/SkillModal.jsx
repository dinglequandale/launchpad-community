import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { GrAdd } from "react-icons/gr";
import Modal from "react-modal";
import { editUserData } from "../../services/userProfileServices";
import { useAuth } from "../../contexts/auth/AuthContext";
import { BiPlus, BiTrash, BiX } from "react-icons/bi";
import "./skillmodal.css";
import { IoCloseOutline } from "react-icons/io5";

export default function SkillModal({visibility, onClose, userData}) {

    const initialUserSkills = ((userData.userSkills === null) || (userData.userSkills && userData.userSkills.length === 0)) ? [{id: 0, skillCategory: "", skillDescription: ""}] : userData.userSkills;
    console.log(initialUserSkills);
    const [skillData,setSkillData] = useState(initialUserSkills);
    const {currentUser} = useAuth();
    console.log("tittel", skillData);
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
    
    const handleInputChange = (key, value, index) => {
        setSkillData([...skillData.map((skill) => (skill.id === index ? {id: index, ... skillData[index], [key]: value} : skill))]);
    }

    const handleAddSkill = () => {
    setSkillData([...skillData, {id: skillData.length, skillCategory: "", skillDescription: ""}]);
    };
    
    const handleRemoveSkill = (index) => {
        const updatedSkills = skillData.filter((_, i) => i !== index);
        setSkillData(updatedSkills);
    };

    const handleSubmit = async () => {
        const loadingToast = toast.loading('Making your changes...');
    
        try {
            await editUserData({userSkills: skillData}, currentUser, userData);
    
            toast.success('Changes made successfully!', { id: loadingToast });

            new Promise( res => setTimeout(res, 500) );

            onClose();
    
        } catch (error) {
            toast.error(`Failed to make changes!`, { id: loadingToast });
        
            console.error('Error changing skills:', error);
        }
    };

    const modalRef = useRef();

    useEffect(() => {
      let onClickOutside = (e) => {
          if(!modalRef.current.contains(e.target)){
            onClose();
          }
      }
      document.addEventListener("mousedown", onClickOutside)
  })

    return (
    <>
        <Toaster position="bottom-right" reverseOrder={false} />
        <div className="modal-overlay">
            <div className="modal-content" ref={modalRef}>
            
            <div className="close-skills" onClick={onClose}><IoCloseOutline size={30} /></div>
            <header>
                <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "5px"}}> Introduce your Skill Set <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>Impress professionals and secure internships</span></h2>
                <hr style={{borderColor: "var(--secondary)"}}/>
            </header>
            
            <div className="skills-modal-container">
            {skillData.map((skill, index) => (
                <div key={index} className="skill-item">
                <div className="skill-header">
                    <h3>Skill {index + 1}</h3>
                    {index > 0 && (
                    <button className="btnText remove-button" onClick={() => handleRemoveSkill(index)}>
                        <BiTrash size={22} />
                    </button>
                    )}
                </div>
                <input
                    type="text"
                    placeholder="Skill"
                    value={skill.skillCategory}
                    onChange={(e) => handleInputChange("skillCategory", e.target.value, index)}
                />
                <input
                    type="text"
                    placeholder="Brief Description"
                    value={skill.skillDescription}
                    onChange={(e) => handleInputChange("skillDescription", e.target.value, index)}
                />
                </div>
            ))}
            </div>
            
            <button className="btnUnfilled skill-add-button" onClick={handleAddSkill}>
            <BiPlus size={20} /> Add Skill
            </button>
            <footer style={{paddingTop: "20px", position: "relative"}}>
                {/* <button className="btnText" onClick={handleAddSkill} style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "larger", margin: "0 auto", marginBottom: "20px"}}><GrAdd size={25}/> Add skill</button> */}
                <div style={{display: "flex", justifyContent: "space-between",}}>
                    <button onClick={onClose} className="btnUnfilled" style={{borderRadius: "4px", width: "35%", padding: "8px", fontSize: "larger"}}>
                        Cancel</button>
                    <button onClick={handleSubmit} type='submit' className="btnSaveChanges" style={{borderRadius: "4px", width: "35%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
                        Submit</button>
                </div>
            </footer>
        </div>
    </div>
    </>
    )
}