import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth
import { Auth0Provider } from '@auth0/auth0-react';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Pages
import Dashboard from './containers/Dashboard';
import QuestJournal from './containers/QuestJournal';
import Marketplace from './containers/Marketplace';
import GuildHall from './containers/GuildHall';
import StatsRoom from './containers/StatsRoom';
import Profile from './containers/Profile';
import LoginPage from './containers/LoginPage';
import RegisterPage from './containers/RegisterPage';
import OnboardingPage from './containers/OnboardingPage';
import SettingsPage from './containers/SettingsPage';
import NotFoundPage from './containers/NotFoundPage';

// Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingScreen from './components/common/LoadingScreen';

// Redux actions
import { loadUser, updateFcmToken } from './redux/slices/authSlice';
import { setTheme } from './redux/slices/uiSlice';
import { addNotification } from './redux/slices/notificationSlice';

// Config
import { auth0Config, firebaseConfig } from './config';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector(state => state.auth);
  const { theme: themeMode } = useSelector(state => state.ui);
  const [initializing, setInitializing] = useState(true);

  // Create theme based on user preference
  const theme = createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: '#7e57c2', // Purple
      },
      secondary: {
        main: '#66bb6a', // Green
      },
      background: {
        default: themeMode === 'dark' ? '#121212' : '#f5f5f5',
        paper: themeMode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 600,
      },
      h3: {
        fontWeight: 600,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: themeMode === 'dark' 
              ? '0 8px 16px rgba(0, 0, 0, 0.4)' 
              : '0 8px 16px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  });

  // Load user data on app start
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(loadUser());
    } else {
      setInitializing(false);
    }
  }, [isAuthenticated, dispatch]);

  // Set theme from user preferences
  useEffect(() => {
    if (user?.preferences?.theme) {
      const userTheme = user.preferences.theme;
      if (userTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        dispatch(setTheme(systemTheme));
      } else {
        dispatch(setTheme(userTheme));
      }
    }
  }, [user, dispatch]);

  // Initialize push notifications
  useEffect(() => {
    if (isAuthenticated && user && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          getToken(messaging, { vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY })
            .then(token => {
              dispatch(updateFcmToken(token));
            })
            .catch(err => console.error('Failed to get FCM token:', err));
        }
      });

      // Handle notifications when app is open
      const unsubscribe = onMessage(messaging, payload => {
        dispatch(addNotification({
          id: Date.now().toString(),
          title: payload.notification.title,
          message: payload.notification.body,
          type: 'info',
          read: false,
          createdAt: new Date().toISOString()
        }));
      });

      return () => unsubscribe();
    }
  }, [isAuthenticated, user, dispatch]);

  // Update initializing state when user data is loaded
  useEffect(() => {
    if (!loading && isAuthenticated) {
      setInitializing(false);
    }
  }, [loading, isAuthenticated]);

  if (initializing) {
    return <LoadingScreen />;
  }

  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      redirectUri={window.location.origin}
      audience={auth0Config.audience}
      scope="openid profile email"
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <ToastContainer position="bottom-right" theme={themeMode} />
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="quests" element={<QuestJournal />} />
              <Route path="marketplace" element={<Marketplace />} />
              <Route path="guild" element={<GuildHall />} />
              <Route path="stats" element={<StatsRoom />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Auth0Provider>
  );
};

export default App;