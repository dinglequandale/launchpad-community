import { useAuth0 } from "@auth0/auth0-react";
import './loginbutton.css';
import { FiLogOut } from "react-icons/fi";

export default function LogoutButton() {
    const {logout, isAuthenticated, isLoading} = useAuth0();

    return(
        <>
            {isAuthenticated && isLoading &&
                <h>Loading...</h>}

            {isAuthenticated && !isLoading &&
                <FiLogOut onClick={() => logout()} className="logoutButton"/>}
        </>
    );
  }