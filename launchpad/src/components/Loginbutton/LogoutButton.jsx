import { useAuth0 } from "@auth0/auth0-react";
import './loginbutton.css';

export default function LogoutButton() {
    const {logoutWithRedirect, isAuthenticated} = useAuth0();

    return(
        isAuthenticated && (
            <button onClick={() => logoutWithRedirect()}>
                Sign out
            </button>
        )
    );
  }