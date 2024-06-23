import LandingPage from "./pages/landing_page/LandingPage";
import { User, useAuth0 } from "@auth0/auth0-react";
import Home from "./pages/Homepage/Home";
import EditProfilePage from "./pages/Editprofilepage/EditProfilePage";

function App() {
  const {isAuthenticated, loginWithRedirect} = useAuth0();
  return (
    <EditProfilePage/>
  )
}

export default App;
