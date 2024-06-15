import { useAuth0 } from "@auth0/auth0-react";
import './loginbutton.css';

export default function LogoutButton() {
    const {logout, isAuthenticated, isLoading} = useAuth0();

    return(
        <>
            {isAuthenticated && isLoading &&
                <h>Loading...</h>}

            {isAuthenticated && !isLoading &&
                <button onClick={() => logout()} className="logoutButton">
                    Sign out
                </button>}
        </>
    );
  }