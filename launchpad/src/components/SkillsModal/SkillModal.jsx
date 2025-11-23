import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { GrAdd } from "react-icons/gr";
import Modal from "react-modal";
import { editUserData } from "../../services/userProfileServices";
import { useAuth } from "../../contexts/auth/AuthContext";
import { BiPlus, BiTrash, BiX } from "react-icons/bi";
import "./SkillModal.css";
import { IoCloseOutline } from "react-icons/io5";

export default function SkillModal({visibility, onClose, userData}) {

    // Add null checks and fallback initialization
    const safeUserData = userData || {};
    const safeUserSkills = safeUserData.userSkills || [];
    
    const initialUserSkills = (safeUserSkills.length === 0) ? 
        [{id: 0, skillCategory: "", skillDescription: ""}] : 
        safeUserSkills;
    
    const [skillData, setSkillData] = useState(initialUserSkills);
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
            {/* <Toaster position="bottom-right" reverseOrder={false} /> */}
            {visibility && (
                <div className="v0-modal-overlay" onClick={onClose}>
                    <div className="v0-modal-container" onClick={(e) => e.stopPropagation()} ref={modalRef}>
                        <div className="v0-modal-header">
                            <button className="v0-modal-close-btn" onClick={onClose}>
                                <IoCloseOutline size={20} />
                            </button>
                            <h2 className="v0-modal-title">Introduce your Skill Set</h2>
                            <p className="v0-modal-subtitle">Impress professionals and secure internships</p>
                        </div>
                        
                        <div className="v0-modal-content">
                            <div className="v0-skills-container">
                                {(skillData || []).map((skill, index) => (
                                    <div key={index} className="v0-skill-item">
                                        <div className="v0-skill-header">
                                            <h3 className="v0-skill-title">Skill {index + 1}</h3>
                                            {index > 0 && (
                                                <button 
                                                    className="v0-skill-remove-btn" 
                                                    onClick={() => handleRemoveSkill(index)}
                                                >
                                                    <BiTrash size={18} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="v0-skill-inputs">
                                            <input
                                                type="text"
                                                placeholder="Skill name"
                                                value={skill.skillCategory}
                                                onChange={(e) => handleInputChange("skillCategory", e.target.value, index)}
                                                className="v0-form-input"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Brief description"
                                                value={skill.skillDescription}
                                                onChange={(e) => handleInputChange("skillDescription", e.target.value, index)}
                                                className="v0-form-input"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <button className="v0-btn-secondary v0-add-skill-btn" onClick={handleAddSkill}>
                                <BiPlus size={18} /> Add Skill
                            </button>
                        </div>
                        
                        <div className="v0-modal-footer">
                            <button 
                                className="v0-btn-secondary" 
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button 
                                className="v0-btn-primary" 
                                onClick={handleSubmit}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}