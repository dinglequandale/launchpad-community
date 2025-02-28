import LandingPage from "./pages/landing_page/LandingPage";
import Home from "./pages/Homepage/Home";
import EditProfilePage from "./pages/Editprofilepage/EditProfilePage";
import SignUp from "./pages/Authentication/Signup";
import { StreamChat } from 'stream-chat';
import { useEffect, useState } from 'react';
import { useAuth } from "./contexts/auth/AuthContext";
import MobileBlocker from "./contexts/MobileBlocker";
import LegalityFooter from "./components/Legality Footer/LegalityFooter";

function App() {
  // TODO: later input logic for this boolean to check whether user finished onboarding

  return (
    <>
    <MobileBlocker>
      <LandingPage/>
    </MobileBlocker>
    </>
  )
}

export default App;
