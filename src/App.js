import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { firebase } from './firebase';
import AnimeList from './components/AnimeList';
import Header from './components/Header';
import SearchResults from './components/SearchResults';
import SummaryPage from './components/SummaryPage';
import About from './components/About';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ProfilePage from './components/ProfilePage';
import BookmarksPage from './components/Bookmarks';
import Scheduler from './components/Scheduler';
import './assets/css/main.css';

// Import Sentry
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

const queryClient = new QueryClient();

// Initialize Sentry
Sentry.init({
  dsn: "https://8fe8f4944ab4589980074ab1e4cf7ae1@o4508027505016832.ingest.us.sentry.io/4508027507507200",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for changes in authentication state
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // Unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

  if (loading) {
    // You can show a loading indicator while checking the authentication state
    return <div>Loading...</div>;
  }

  return (
    <Sentry.ErrorBoundary fallback={<div>An error has occurred</div>}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<AnimeList />} />
            <Route path="/search-results" element={<SearchResults />} />
            <Route path="/summary/:malId" element={<SummaryPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Only show these routes if the user is logged in */}
            {user && (
              <>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/bookmarks" element={<BookmarksPage />} />
                <Route path="/scheduler" element={<Scheduler />} />
              </>
            )}
          </Routes>
        </Router>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
}

export default App;
