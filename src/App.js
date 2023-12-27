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

const queryClient = new QueryClient();

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
  );
}

export default App;
