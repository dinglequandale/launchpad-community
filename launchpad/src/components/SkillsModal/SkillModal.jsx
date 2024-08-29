import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { GrAdd } from "react-icons/gr";
import Modal from "react-modal";
import { editUserData } from "../../services/userProfileServices";
import { useAuth } from "../../contexts/auth/AuthContext";

export default function SkillModal({visibility, onClose}) {

    const [skillData,setSkillData] = useState([{id: 0, skillCategory: "", skillDescription: ""}])
    const {currentUser} = useAuth();
    console.log(skillData);
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
        setSkillData([...skillData.map((userData) => (userData.id === index ? {id: index, ... skillData[index], [key]: value} : userData))]);
        console.log(skillData);
    }

    const handleAddTargetUser = () => {
    setSkillData([...skillData, {id: skillData.length, skillCategory: "", skillDescription: ""}]);
    console.log(skillData)
    }

    const handleSubmit = async () => {
        const loadingToast = toast.loading('Making your changes...');
    
        try {
            await editUserData({userSkills: skillData}, currentUser);
    
            toast.success('Changes made successfully!', { id: loadingToast });

            new Promise( res => setTimeout(res, 500) );

            onClose();
    
        } catch (error) {
            toast.error(`Failed to make changes!`, { id: loadingToast });
        
            console.error('Error changing skills:', error);
        }
    };

    return (
    <div>
        <Toaster position="bottom-right" reverseOrder={false} />
        <Modal
        isOpen={visibility}
        onRequestClose={onClose}
        style={customStyles}
        contentLabel="Skills Modal"
        >
        <header>
            <h2 style={{margin: "0 auto", textAlign: "center", paddingBottom: "5px", color: "var(--secondary)"}}> Introduce your Skillset <br /> <span style={{fontWeight: "250", fontSize: "smaller"}}>Impress Professionals and Secure Internships</span></h2>
            <hr style={{borderColor: "var(--secondary)"}}/>
        </header>
        <main style={{paddingTop: "10px", display: "flex", flexDirection: "column", gap: "7px"}}>
            {skillData.map((user, index) => (
                <form onSubmit={handleAddTargetUser}>
                <h2 style={{color: "var(--secondary)", textAlign: "center"}}>Skill {index + 1}</h2>
                <div style={{display: "flex", justifyContent: "space-around"}}>
                <input type="text" style={{width: "35%"}} value={user.skillCategory} placeholder="Skill Category" onChange={(e) => handleInputChange("skillCategory", e.target.value, index)}/>
                <input type="text" style={{width: "50%"}} value={user.skillDescription} placeholder="Brief Description" onChange={(e) => handleInputChange("skillDescription", e.target.value, index)}/>
                </div>
                </form>
            ))}
        </main>
        <footer style={{paddingTop: "20px", position: "relative"}}>
            <button className="btnText" onClick={handleAddTargetUser} style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontSize: "larger", margin: "0 auto", marginBottom: "20px"}}><GrAdd size={25}/> Add skill</button>
            <div style={{display: "flex", justifyContent: "space-between",}}>
                <button onClick={onClose} className="btnUnfilled" style={{borderRadius: "4px", width: "35%", padding: "8px", fontSize: "larger"}}>
                    Cancel</button>
                <button onClick={handleSubmit} type='submit' style={{borderRadius: "4px", width: "35%", padding: "8px", fontSize: "larger", color: "white", boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}}>
                    Submit</button>
            </div>
        </footer>
        </Modal>
    </div>
    )
}