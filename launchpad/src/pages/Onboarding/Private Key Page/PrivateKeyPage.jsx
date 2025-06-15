import toast, { Toaster } from "react-hot-toast";
import SecurityCodeInput from "../../../components/Security Key/SecurityInput";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../../firebase/firebaseConfig";
import { Navigate, useNavigate } from "react-router-dom";
// import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuth } from "../../../contexts/auth/AuthContext";

export default function PrivateKeyPage() {
    let schoolId, schoolDisplayName;
    const navigate = useNavigate();
    const {userLoggedIn} = useAuth();

    const onSubmit = async (key) => {
        const loadingToast = toast.loading('Verifying your code...');
        
        try {
            const schoolsRef = collection(db, "school_configs");
            const q = query(schoolsRef, where("secret_key", "==", key));
            const querySnapshot = await getDocs(q);
            if(querySnapshot.empty){
                toast.error(`Invalid code!`, { id: loadingToast });
                return;
            }
            schoolId = querySnapshot.docs[0].id;
            schoolDisplayName = querySnapshot.docs[0].data().display_name;
            
            toast.success('We found your school!', { id: loadingToast });

            localStorage.setItem("tempSchoolInfo", JSON.stringify({schoolId, schoolDisplayName}));
            
            // Redirect to Login instead of Onboarding
            navigate("/Login", {state: {schoolId, schoolDisplayName}});
        } catch (error) {
            console.error('Error changing:', error);
            toast.error('An error occurred while verifying your code', { id: loadingToast });
        }
    }

    return(
    <>
    <Toaster position="bottom-right" reverseOrder={false} />
    {localStorage.getItem("tempSchoolInfo") && <Navigate to="/Login"/>}
    <div className="onboarding-container">
        <div className="onboarding-body">
            <div style={{textAlign: "center", paddingBottom: "8px"}}></div>
            <div style={{background: "var(--accent)", borderRadius: "25px", boxShadow: "var(--shadowColor)",
                display: "flex", justifyContent: "center", alignItems: "center", height: "100px"}}>
                <img src="/assets/launchpad_logo.png" alt="Logo" style={{width: "100%"}}/>
            </div>
            <div style={{textAlign: "center", fontWeight: "350"}}>
                <h2>School Security Key</h2>
            </div>
            <div style={{textAlign: "center"}}>
                <SecurityCodeInput onSubmit={onSubmit}/>
            </div>
        </div>
    </div>
    </>
    )
}