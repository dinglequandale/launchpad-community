import LandingPage from "./pages/landing_page/LandingPage";
import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const {isAuthenticated, loginWithRedirect} = useAuth0();
  return (
    <LandingPage/>
  )
}

export default App;
