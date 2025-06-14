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
import { ReportProvider } from './contexts/report/ReportContext.jsx';
import SignUp from './pages/Authentication/Signup.jsx';
import Login from './pages/Authentication/Login.jsx';
import LandingPage from './pages/landing_page/LandingPage.jsx';
import InitializeStream from './Streamchat/streamChatConfig.jsx';
// import GlobalAuthWrapper from './contexts/GlobalAuthWrapper.jsx';
import Professional_LandingPage from './pages/landing_page/Professional_LandPage.jsx';
import Alumni_LandingPage from './pages/landing_page/Alumni_LandingPage.jsx';
import PrivacyPolicy from './pages/Policies/PrivacyPolicy.jsx';
import Terms from './pages/Policies/Terms.jsx';
import PrivateKeyPage from './pages/Onboarding/Private Key Page/PrivateKeyPage.jsx';
import GlobalAuthWrapper from './contexts/GlobalAuthWrapper.jsx';
import AboutUs from './components/Legality Footer/AboutUs.jsx';
import FAQs from './components/Legality Footer/FAQs.jsx';
import SettingsPage from './pages/Settings/SettingsPage.jsx';
import ReportModal from './components/ReportModal/ReportModal.jsx';

const ErrorPage = () => {
  return (
    <div style={{
      height: '100vh',
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#f8f9fa'
    }}>
      <h1 style={{
        fontSize: '2rem',
        color: '#2c5282',
        marginBottom: '1rem'
      }}>Oops! Something went wrong</h1>
      
      <p style={{
        fontSize: '1.1rem',
        color: '#444',
        maxWidth: '600px',
        lineHeight: '1.6',
        marginBottom: '2rem'
      }}>
        We're sorry, but it seems we've encountered an error. Please try reloading the page.
        If the issue persists, don't hesitate to reach out to our support team.
      </p>

      <div style={{
        display: 'flex',
        gap: '1rem',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2c5282',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Reload Page
        </button>

        <a 
          href="mailto:launchpadhelpline@gmail.com"
          style={{
            color: '#2c5282',
            textDecoration: 'underline'
          }}
        >
          Contact Support
        </a>
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    errorElement: <ErrorPage/>
  },
  {
    path: '/Landing',
    element: <LandingPage/>,
    errorElement: <ErrorPage/>
  },
  {
    path: '/about-us',
    element: <AboutUs/>,
    errorElement: <ErrorPage/>
  },
  {
    path: '/faqs',
    element: <FAQs/>,
    errorElement: <ErrorPage/>,
  },
  {
    path: '/highschoolers',
    element: <LandingPage/>,
    errorElement: <ErrorPage/>
  },
  {
    path: '/professionals',
    element: <Professional_LandingPage/>,
    errorElement: <ErrorPage/>
  },
  {
    path: '/undergrads',
    element: <Alumni_LandingPage/>,
    errorElement: <ErrorPage/>
  },
  {
    path: '/Signup',
    element: <SignUp/>,
    errorElement: <ErrorPage/>
  },
  {
    path: '/Login',
    element: <Login/>,
    errorElement:<ErrorPage/>
  },
  {
    path: '/privacy',
    element: <PrivacyPolicy/>,
    errorElement:<ErrorPage/>
  },
  {
    path: '/terms',
    element: <Terms/>,
    errorElement:<ErrorPage/>
  },
  {
    path: '/school-signup',
    element: <PrivateKeyPage/>,
    errorElement:<ErrorPage/>
  },
  {
    path: '/Onboarding',
    element: <Onboarding/>,
    errorElement:<ErrorPage/>
  },
  {
    element: <GlobalAuthWrapper/>,
    children: [
    {
      path: '/Home',
      element: <Home/>,
      errorElement:<ErrorPage/>,
    },
    {
      path: '/network',
      element: <UserNetwork/>,
      errorElement:<ErrorPage/>
    },
    {
      path: '/messages',
      element: <InitializeStream/>,
      errorElement:<ErrorPage/>
    },
    {
      path: '/Organizations',
      element: <Organizations/>,
      errorElement:<ErrorPage/>
    },
    {
      path: '/profile',
      element: <EditProfilePage/>,
      errorElement:<ErrorPage/>
    },
    {
      path: '/settings',
      element: <SettingsPage/>,
      errorElement:<ErrorPage/>
    }
]
}
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ReportProvider>
        <RouterProvider router={router} />
        <ReportModal />
      </ReportProvider>
    </AuthProvider>
  </React.StrictMode>,
)