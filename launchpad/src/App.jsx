import LandingPage from "./pages/landing_page/LandingPage";
import Home from "./pages/Homepage/Home";
import EditProfilePage from "./pages/Editprofilepage/EditProfilePage";
import SignUp from "./pages/Authentication/Signup";

function App() {
  // TODO: later input logic for this boolean to check whether user finished onboarding
  const onBoarded = false;
  return (
    <>
    {/* {isAuthenticated && onBoarded ? <Home/> : <LandingPage/>} */}
    <LandingPage/>
    </>
  )
}

export default App;
