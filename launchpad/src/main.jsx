import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import UserNetwork from './pages/Network/UserNetwork.jsx';
import Onboarding from './pages/Onboarding/Onboarding.jsx';
import Organizations from './pages/Organizationspage/Organizations.jsx';
import EditProfilePage from './pages/Editprofilepage/EditProfilePage.jsx';
import Home from './pages/Homepage/Home.jsx';
import { AuthProvider } from './contexts/auth/AuthContext.jsx';
import SignUp from './pages/Authentication/Signup.jsx';
import Login from './pages/Authentication/Login.jsx';
import LandingPage from './pages/landing_page/LandingPage.jsx';
import InitializeStream from './Streamchat/streamChatConfig.jsx';
import GlobalAuthWrapper from './contexts/GlobalAuthWrapper.jsx';
import Professional_LandingPage from './pages/landing_page/Professional_LandPage.jsx';
import Alumni_LandingPage from './pages/landing_page/Alumni_LandingPage.jsx';
import PrivacyPolicy from './pages/Policies/PrivacyPolicy.jsx';
import Terms from './pages/Policies/Terms.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    errorElement: <div>Sorry! We’ve got an error on our hands ... Try to reload! If the issue persists, email us at launchpadhelpline@gmail.com.</div>
  },
  {
    path: '/Landing',
    element: <LandingPage/>,
    errorElement: <div>Sorry! We’ve got an error on our hands ... Try to reload! If the issue persists, email us at launchpadhelpline@gmail.com.</div>
  },
  {
    path: '/highschoolers',
    element: <LandingPage/>,
    errorElement: <div>Sorry! We’ve got an error on our hands ... Try to reload! If the issue persists, email us at launchpadhelpline@gmail.com.</div>
  },
  {
    path: '/professionals',
    element: <Professional_LandingPage/>,
    errorElement: <div>Sorry! We’ve got an error on our hands ... Try to reload! If the issue persists, email us at launchpadhelpline@gmail.com.</div>
  },
  {
    path: '/undergrads',
    element: <Alumni_LandingPage/>,
    errorElement: <div>Sorry! We’ve got an error on our hands ... Try to reload! If the issue persists, email us at launchpadhelpline@gmail.com.</div>
  },
  {
    path: '/Signup',
    element: <SignUp/>,
    errorElement: <div>Sorry! We’ve got an error on our hands ... Try to reload! If the issue persists, email us at launchpadhelpline@gmail.com.</div>
  },
  {
    path: '/Login',
    element: <Login/>,
    errorElement:<div>Sorry! We’ve got an error on our hands ... Try to reload! If the issue persists, email us at launchpadhelpline@gmail.com.</div>
  },
  {
    path: '/Onboarding',
    element: <Onboarding/>,
    errorElement:<div>Sorry! We’ve got an error on our hands ... Try to reload! If the issue persists, email us at launchpadhelpline@gmail.com.</div>
  },
  {
    path: '/privacy',
    element: <PrivacyPolicy/>,
    errorElement:<div>Sorry! We’ve got an error on our hands ... Try to reload! If the issue persists, email us at launchpadhelpline@gmail.com.</div>
  },
  {
    path: '/terms',
    element: <Terms/>,
    errorElement:<div>Sorry! We’ve got an error on our hands ... Try to reload! If the issue persists, email us at launchpadhelpline@gmail.com.</div>
  },
  {
    element: <GlobalAuthWrapper/>,
    children: [
    {
      path: '/Home',
      element: <Home/>,
      errorElement:<div>Sorry! We’ve got an error on our hands ... Try to reload! If the issue persists, email us at launchpadhelpline@gmail.com.</div>,
    },
    {
      path: '/UserNetwork',
      element: <UserNetwork/>,
      errorElement:<div>Sorry! We’ve got an error on our hands ... Try to reload! If the issue persists, email us at launchpadhelpline@gmail.com.</div>
    },
    {
      path: '/messages',
      element: <InitializeStream/>,
      errorElement:<div>Sorry! We’ve got an error on our hands ... Try to reload! If the issue persists, email us at launchpadhelpline@gmail.com.</div>
    },
    {
      path: '/Organizations',
      element: <Organizations/>,
      errorElement:<div>Sorry! We’ve got an error on our hands ... Try to reload! If the issue persists, email us at launchpadhelpline@gmail.com.</div>
    },
    {
      path: '/MyProfile',
      element: <EditProfilePage/>,
      errorElement:<div>Sorry! We’ve got an error on our hands ... Try to reload! If the issue persists, email us at launchpadhelpline@gmail.com.</div>
    },
]
}
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
        <RouterProvider router = {router} /> 
    </AuthProvider>
  </React.StrictMode>,
)