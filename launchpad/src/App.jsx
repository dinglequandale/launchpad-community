// import LandingPage from "./pages/landing_page/LandingPage";
import Home from "./pages/Homepage/Home";
import EditProfilePage from "./pages/Editprofilepage/EditProfilePage";
import SignUp from "./pages/Authentication/Signup";
import { StreamChat } from 'stream-chat';
import { useEffect, useState } from 'react';
import { useAuth } from "./contexts/auth/AuthContext";
import MobileBlocker from "./contexts/MobileBlocker";
import LegalityFooter from "./components/Legality Footer/LegalityFooter";
import LandingPageRevamped from "./pages/landing_page/LandingPageRevamped";
import HSFSLandingPage from "./pages/Societies/HSFS/HSFSLandingPage";
import { useSociety } from "./contexts/SocietyContext";
// import { ConnectionProvider } from "./contexts/ConnectionContext";

function App() {
  const { currentSociety } = useSociety();

  if (currentSociety === 'hsfs') {
    return <HSFSLandingPage />;
  }

  return (
    // <MobileBlocker>
      <LandingPageRevamped/>
    // </MobileBlocker>
  )
}

export default App;
