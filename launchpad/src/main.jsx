import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Signup from './pages/authentication/signup/Signup.jsx'
import {Auth0Provider} from '@auth0/auth0-react';
import authConfig from '/auth_config.json';


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
  element: <Signup/>,
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
