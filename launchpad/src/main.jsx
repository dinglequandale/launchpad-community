import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import {Auth0Provider} from '@auth0/auth0-react';
import UserNetwork from './pages/Network/UserNetwork.jsx';
import HighSchooler from './pages/Onboarding/HighSchooler/HighSchooler.jsx';
import CollegeStudent from './pages/Onboarding/CollegeStudent/CollegeStudent.jsx';
import Organizations from './pages/Organizationspage/Organizations.jsx';
import EditProfilePage from './pages/Editprofilepage/EditProfilePage.jsx';

const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const domain = import.meta.env.VITE_AUTH0_DOMAIN;

const router = createBrowserRouter([
  {
  path: '/',
  element: <App/>,
  errorElement: <div>Sorry pookie! We got an error on our hands ... Try reload!</div>
},
{
  path: '/UserNetwork',
  element: <UserNetwork/>,
  errorElement: <div>Sorry pookie! We got an error on our hands ... Try reload!</div>
},
{
  path: '/HighSchooler',
  element: <HighSchooler/>,
  errorElement: <div>Sorry pookie! We got an error on our hands ... Try reload!</div>
},
{
  path: '/CollegeStudent',
  element: <CollegeStudent/>,
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
    <Auth0Provider 
    domain = {domain}
    clientId={clientId}
    redirectUri = {window.location.origin}>
      <RouterProvider router = {router} /> 
    </Auth0Provider>
  
  </React.StrictMode>,
)