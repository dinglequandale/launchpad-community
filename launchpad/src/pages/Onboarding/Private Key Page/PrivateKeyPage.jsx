import toast, { Toaster } from "react-hot-toast";
import SecurityCodeInput from "../../../components/Security Key/SecurityInput";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { auth, db } from "../../../firebase/firebaseConfig";
import { Navigate, useNavigate } from "react-router-dom";
// import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuth } from "../../../contexts/auth/AuthContext";

export default function PrivateKeyPage() {
    let schoolId, schoolDisplayName;
    const navigate = useNavigate();
    const {userLoggedIn} = useAuth();
    const today = (new Date()).toLocaleDateString('en-US');

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

            const codeData = querySnapshot.docs[0].data();
            
            // expiration date in timestamp on Firestore
            if (codeData.expiration_date.toDate && new Date() > codeData.expiration_date.toDate()) {
                toast.error("This code has expired. Please request a new one!");
                return;
            }
            
            if((codeData.usages_threshold <= codeData.usages_count) || codeData.daily_usages_threshold <= codeData.daily_usage_tracker[today]){
                toast.error("Code usages limit reached. Please contact us at launchpadhelpline@gmail.com for help.");
                await updateDoc(doc(db, "school_configs", schoolId), {threshold_breached: true});
                return;
            }
                        
            schoolId = querySnapshot.docs[0].id;
            schoolDisplayName = querySnapshot.docs[0].data().display_name;
            
            toast.success('We found your school!', { id: loadingToast });

            localStorage.setItem("tempSchoolInfo", JSON.stringify({schoolId, schoolDisplayName}));

            await updateDoc(
                doc(db, "school_configs", schoolId), 
                {
                    last_used: new Date(), 
                    usages_count: codeData.usages_count + 1, 
                    daily_usage_tracker: {...codeData.daily_usage_tracker, [today]: codeData.daily_usage_tracker[today] ? codeData.daily_usage_tracker[today] + 1 : 1}
                }
            );
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