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

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    errorElement: <div>Sorry pookie! We got an error on our hands ... Try reload!</div>
  },
  {
    path: '/Landing',
    element: <LandingPage/>,
    errorElement: <div>Sorry pookie! We got an error on our hands ... Try reload!</div>
  },
  {
    path: '/Signup',
    element: <SignUp/>,
    errorElement: <div>Sorry pookie! We got an error on our hands ... Try reload!</div>
  },
  {
    path: '/Login',
    element: <Login/>,
    errorElement: <div>Sorry pookie! We got an error on our hands ... Try reload!</div>
  },
  {
    path: '/Onboarding',
    element: <Onboarding/>,
    errorElement: <div>Sorry pookie! We got an error on our hands ... Try reload!</div>
  },
  {
    element: <GlobalAuthWrapper/>,
    children: [
    {
      path: '/Home',
      element: <Home/>,
      errorElement: <div>Sorry pookie! We got an error on our hands ... Try reload!</div>,
    },
    {
      path: '/UserNetwork',
      element: <UserNetwork/>,
      errorElement: <div>Sorry pookie! We got an error on our hands ... Try reload!</div>
    },
    {
      path: '/messages',
      element: <InitializeStream/>,
      errorElement: <div>Sorry pookie! We got an error on our hands ... Try reload!</div>
    },
    {
      path: '/Organizations',
      element: <Organizations/>,
      errorElement: <div>Sorry pookie! We got an error on our hands ... Try reload!</div>
    },
    {
      path: '/MyProfile',
      element: <EditProfilePage/>,
      errorElement: <div>Sorry pookie! We got an error on our hands ... Try reload!</div>
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