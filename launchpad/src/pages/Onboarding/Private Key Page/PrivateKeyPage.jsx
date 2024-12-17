import toast, { Toaster } from "react-hot-toast";
import SecurityCodeInput from "../../../components/Security Key/SecurityInput";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../../firebase/firebaseConfig";
import { Navigate, useNavigate } from "react-router-dom";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuth } from "../../../contexts/auth/AuthContext";

export default function PrivateKeyPage() {

    let schoolId, schoolDisplayName;

    const navigate = useNavigate();

    const user = auth.currentUser;
    const {userLoggedIn} = useAuth();

    const onSubmit = async (key) => {
        const loadingToast = toast.loading('Verifying your code...');
        
        try {
            // await editUserData({linkedinLink: newLinkedinLink}, currentUser, userData);
            const schoolsRef = collection(db, "school_configs");
            const q = query(schoolsRef, where("secret_key", "==", key));
            const querySnapshot = await getDocs(q);
            if(querySnapshot.empty){
                toast.error(`Invalid code!`, { id: loadingToast });
                return;
            }
            schoolId = querySnapshot.docs[0].id;
            schoolDisplayName = querySnapshot.docs[0].data().display_name;
            console.log("school:", schoolId, schoolDisplayName);
            toast.success('We found your school!', { id: loadingToast });
            
            const functions = getFunctions();
            const createSchoolClaim = httpsCallable(functions, 'createSchoolClaim');
            
            const result = await createSchoolClaim({ schoolId });

            await user.getIdToken(true);

            new Promise( res => setTimeout(res, 700) );

            

            navigate("/Onboarding", {state: {schoolId, schoolDisplayName}});
            localStorage.setItem("tempSchoolInfo", JSON.stringify({schoolId, schoolDisplayName}));

        } catch (error) {

            console.error('Error changing:', error);
        }
    }

    return(
    <>
    <Toaster position="bottom-right" reverseOrder={false} />
    {localStorage.getItem("tempSchoolInfo") && <Navigate to="/Onboarding"/>}
    {!userLoggedIn && <Navigate to="/Login"/>}
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