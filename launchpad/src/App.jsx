import LandingPage from "./pages/landing_page/LandingPage";
import { User, useAuth0 } from "@auth0/auth0-react";
import UserNetwork from "./pages/Network/UserNetwork";
import ContentFilter from "./components/Contentfilter/ContentFilter";
import OrganizationProfile from "./components/Organizationprofile/OrganizationProfile";
import Organizations from "./pages/Organizationspage/Organizations";
import Home from "./pages/Homepage/Home";

function App() {
  const {isAuthenticated, loginWithRedirect} = useAuth0();
  return (
    <Home/>
  )
}

export default App;
