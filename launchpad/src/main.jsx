import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import {Auth0Provider} from '@auth0/auth0-react';
import UserNetwork from './pages/Network/UserNetwork.jsx';
import UserSchool from './pages/Onboarding/Initialphase/Userschool/UserSchool.jsx';
import Organizations from './pages/Organizationspage/Organizations.jsx';
import EditProfilePage from './pages/Editprofilepage/EditProfilePage.jsx';
import Home from './pages/Homepage/Home.jsx';
import { AuthProvider } from './contexts/auth/AuthContext.jsx';
import SignUp from './pages/Authentication/Signup.jsx';

const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const domain = import.meta.env.VITE_AUTH0_DOMAIN;

const router = createBrowserRouter([
  {
  path: '/',
  element: <App/>,
  errorElement: <div>Sorry pookie! We got an error on our hands ... Try reload!</div>
},
{
  path: '/Signup',
  element: <SignUp/>,
  errorElement: <div>Sorry pookie! We got an error on our hands ... Try reload!</div>
},
{
  path: 'Home',
  element: <Home/>,
  errorElement: <div>Sorry pookie! We got an error on our hands ... Try reload!</div>,
},
{
  path: '/UserNetwork',
  element: <UserNetwork/>,
  errorElement: <div>Sorry pookie! We got an error on our hands ... Try reload!</div>
},
{
  path: '/UserSchool',
  element: <UserSchool/>,
  errorElement: <div>Sorry pookie! We got an error on our hands ... Try reload!</div>
},
{
  path: '/Organizations',
  element: <Organizations/>,
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
}
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Auth0Provider 
      domain = {domain}
      clientId={clientId}
      redirectUri = {window.location.origin}>
        <RouterProvider router = {router} /> 
      </Auth0Provider>
    </AuthProvider>
  </React.StrictMode>,
)