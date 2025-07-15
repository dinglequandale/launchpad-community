import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
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
import ParentVerificationPage from './pages/ParentVerificationPage.jsx';
import UnsubscribePage from './pages/UnsubscribePage.jsx';
import LandingPageRevamped from './pages/landing_page/LandingPageRevamped.jsx';
import UserType from './pages/Onboarding/UserType.jsx';
import { ModalProvider } from './contexts/ModalContext.jsx';
import { ConnectionProvider } from './contexts/ConnectionContext';

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

// Create a Root component that wraps the router content with providers
const Root = () => {
  return (
    <ConnectionProvider>
      <ReportProvider>
        <ModalProvider>
          <ReportModal />
          <Outlet />
        </ModalProvider>
      </ReportProvider>
    </ConnectionProvider>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage/>,
    children: [
      {
        index: true,
        element: <App/>
      },
      {
        path: '/parent-verify',
        element: <ParentVerificationPage />
      },
      {
        path: '/unsubscribe',
        element: <UnsubscribePage />
      },
      {
        path: '/Landing',
        element: <LandingPageRevamped/>
      },
      {
        path: '/about-us',
        element: <AboutUs/>
      },
      {
        path: '/faqs',
        element: <FAQs/>
      },
      {
        path: '/highschoolers',
        element: <LandingPage/>
      },
      {
        path: '/professionals',
        element: <Professional_LandingPage/>
      },
      {
        path: '/undergrads',
        element: <Alumni_LandingPage/>
      },
      {
        path: '/user-type',
        element: <UserType/>
      },
      {
        path: '/Signup',
        element: <SignUp/>
      },
      {
        path: '/Login',
        element: <Login/>
      },
      {
        path: '/privacy',
        element: <PrivacyPolicy/>
      },
      {
        path: '/terms',
        element: <Terms/>
      },
      {
        path: '/school-signup',
        element: <PrivateKeyPage/>
      },
      {
        path: '/Onboarding',
        element: <Onboarding/>
      },
      {
        element: <GlobalAuthWrapper/>,
        children: [
          {
            path: '/Home',
            element: <Home/>
          },
          {
            path: '/network',
            element: <UserNetwork/>
          },
          {
            path: '/messages',
            element: <InitializeStream/>
          },
          {
            path: '/Organizations',
            element: <Organizations/>
          },
          {
            path: '/profile',
            element: <EditProfilePage/>
          },
          {
            path: '/settings',
            element: <SettingsPage/>
          }
        ]
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)