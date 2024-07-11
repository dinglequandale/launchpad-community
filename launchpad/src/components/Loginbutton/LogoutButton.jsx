import { useAuth0 } from "@auth0/auth0-react";
import './loginbutton.css';
import { FiLogOut } from "react-icons/fi";
import { useAuth } from "../../contexts/auth/AuthContext";
import { doSignOut } from "../../firebase/auth";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
    const {userLoggedIn } = useAuth();
    const navigate = useNavigate();
    return(
        <>
            {userLoggedIn &&
                <FiLogOut onClick={()=>(doSignOut().then(()=>navigate("/Signup")))} className="logoutButton"/>}
        </>
    );
  }