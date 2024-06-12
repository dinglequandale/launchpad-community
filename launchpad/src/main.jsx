import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Signup from './pages/authentication/signup/Signup.jsx'


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
    <RouterProvider router = {router} />
  </React.StrictMode>,
)
