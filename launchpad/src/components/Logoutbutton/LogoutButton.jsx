import './logoutbutton.css';
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../contexts/auth/AuthContext";
import { doSignOut } from "../../firebase/auth";
import { useNavigate } from "react-router-dom";
import { disconnectFromStream } from '../../Streamchat/chatFunctions/setUpUser';
import { useState } from 'react';
import LogoutVerificationModal from './LogoutVerificationModal';

export default function LogoutButton() {
    const {userLoggedIn } = useAuth();

    const [logoutModalVisibility, setLogoutModalVisibility] = useState(false);
    const navigate = useNavigate();
    const handleLogout = () => {
        doSignOut().then(() => {
            // clear any auth-related local storage
            localStorage.removeItem('authToken');
            
            // replace the current history entry
            window.history.replaceState(null, '', '/Landing');
            
            // redirect to login page
            navigate('/Landing', { replace: true });
            localStorage.clear();
            
            // unmount user from Stream
            disconnectFromStream();
            }
        )
    }
    return(
        <>
            {logoutModalVisibility && <LogoutVerificationModal visibility={logoutModalVisibility} onVerify={() => handleLogout()} onCancel={() => setLogoutModalVisibility(false)}/>}
            {userLoggedIn &&
                <div className='logoutGroup' style={{display: "flex", alignItems: "center", justifyContent: "center"}} onClick={() => setLogoutModalVisibility(true)}>
                    <FiLogOut size={25} className="logoutButton"/>
                </div>}
        </>
    );
  }