import LandingPage from "./pages/landing_page/LandingPage";
import { useAuth0 } from "@auth0/auth0-react";
import UserNetwork from "./pages/Network/UserNetwork"
import UserWheelView from "./components/Userwheel/UserWheelView";

function App() {
  const {isAuthenticated, loginWithRedirect} = useAuth0();
  return (
    <UserNetwork/>
  )
}

export default App;
