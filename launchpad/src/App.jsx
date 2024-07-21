import LandingPage from "./pages/landing_page/LandingPage";
import Home from "./pages/Homepage/Home";
import EditProfilePage from "./pages/Editprofilepage/EditProfilePage";
import SignUp from "./pages/Authentication/Signup";
import { StreamChat } from 'stream-chat';
import { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";

const chatClient = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);

function App() {
  // TODO: later input logic for this boolean to check whether user finished onboarding
  const [clientReady, setClientReady] = useState(false);
  const {currentUser} = getAuth();

  useEffect(() => {
    if(!currentUser) return;
    
    const setupClient = async () => {
      try {
        if (!chatClient.userID) {
          await chatClient.connectUser(
            { id: 'user-id' },
            'user-token'
          );
        }
        setClientReady(true);
      } catch (error) {
        console.error('Failed to connect user', error);
      }
    };

    setupClient();

    return () => {
      chatClient.disconnectUser();
    };
  }, [currentUser,]);

  return (
    <>
    {/* {isAuthenticated && onBoarded ? <Home/> : <LandingPage/>} */}
    <LandingPage/>
    </>
  )
}

export default App;
