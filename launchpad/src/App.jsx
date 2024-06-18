import LandingPage from "./pages/landing_page/LandingPage";
import { User, useAuth0 } from "@auth0/auth0-react";
import UserNetwork from "./pages/Network/UserNetwork";
import ContentFilter from "./components/Contentfilter/ContentFilter";

function App() {
  const {isAuthenticated, loginWithRedirect} = useAuth0();
  return (
    <LandingPage/>
  )
}

export default App;
