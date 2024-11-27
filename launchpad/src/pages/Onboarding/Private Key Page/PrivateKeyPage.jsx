import toast, { Toaster } from "react-hot-toast";
import SecurityCodeInput from "../../../components/Security Key/SecurityInput";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

export default function PrivateKeyPage() {

    let schoolId;

    const onSubmit = async (key) => {
        const loadingToast = toast.loading('Verifying your code...');
        
        try {
            // await editUserData({linkedinLink: newLinkedinLink}, currentUser, userData);
            const schoolsRef = collection(db, "school_configs");
            const q = query(schoolsRef, where("secret_key", "==", key));
            const querySnapshot = await getDocs(q);
            if(querySnapshot.empty){
                toast.error(`Wrong code! Try again`, { id: loadingToast });
                return;
            }
            schoolId = querySnapshot.docs[0];
            toast.success('We found your school!', { id: loadingToast });
            
            new Promise( res => setTimeout(res, 500) );

            // TODO: logic for going to the next part of onboarding

        } catch (error) {

            console.error('Error changing:', error);
        }
    }

    return(
    <>
    <Toaster position="bottom-right" reverseOrder={false} />
    <div style={{margin: "0 auto", textAlign: "center"}}>
        <span style={{fontSize: "30px", fontWeight: "bolder", color: "var(--secondary)"}}>Security Key</span>
        <span className="onboardingQuestion" style={{color: "black"}}>Please enter the security code sent by your school.</span>
        <SecurityCodeInput onSubmit={onSubmit}/>
    </div>
    </>
    )
}