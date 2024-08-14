import './logoutbutton.css';
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../contexts/auth/AuthContext";
import { doSignOut } from "../../firebase/auth";
import { useNavigate } from "react-router-dom";
import { disconnectFromStream } from '../../Streamchat/chatFunctions/setUpUser';

export default function LogoutButton() {
    const {userLoggedIn } = useAuth();
    const navigate = useNavigate();
    const handleLogout = (e) => {
        e.preventDefault();
        doSignOut().then(() => {
            // clear any auth-related local storage
            localStorage.removeItem('authToken');
            
            // replace the current history entry
            window.history.replaceState(null, '', '/Landing');
            
            // redirect to login page
            navigate('/Landing', { replace: true });
            
            // unmount user from Stream
            disconnectFromStream();
            }
        )
    }
    return(
        <>
            {userLoggedIn &&
                <div className='logoutGroup' style={{display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}} onClick={(e) => handleLogout(e)}>
                    <FiLogOut size={19} className="logoutButton"/>
                    <span className='txtLogout' style={{fontSize: "16px"}}>Logout</span>
                </div>}
        </>
    );
  }