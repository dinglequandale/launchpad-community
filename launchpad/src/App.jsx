import LandingPage from "./pages/landing_page/LandingPage";
import { useAuth0 } from "@auth0/auth0-react";
import UserNetwork from "./pages/Network/UserNetwork"

function App() {
  const {isAuthenticated, loginWithRedirect} = useAuth0();
  return (
    <UserNetwork/>
  )
}

export default App;
