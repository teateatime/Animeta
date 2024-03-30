import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { firebase } from '../firebase';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import { PersonOutline } from '@material-ui/icons';
import './styles/Header.css';

function Header() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [user, setUser] = useState(null);
  const [showSignOutPopup, setShowSignOutPopup] = useState(false);

  useEffect(() => {
    // Listen for changes in authentication state
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
    });

    // Unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Show sign out popup when user signs out
    if (showSignOutPopup) {
      const timeout = setTimeout(() => {
        setShowSignOutPopup(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [showSignOutPopup]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    const validCharsRegex = /^[a-zA-Z0-9#&:;',! -]+$/;
    
    if (!searchTerm.trim()) {
      setSearchError('Please enter a search term.');
      return;
    }
  
    if (!validCharsRegex.test(searchTerm)) {
      setSearchError('No results found. Please try a different search term.');
      return;
    }
  
    if (!/[a-zA-Z0-9]/.test(searchTerm[0])) {
      setSearchError('No results found. Please try a different search term.');
      return;
    }
  
    setSearchError('');
    navigate(`/search-results?search=${searchTerm}`);
  };

  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      setShowSignOutPopup(true); // Show sign out popup
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="header">
      <header>
        <Link to="/" className="title">
          <Typography id="top" variant="h6">
            Animeta
          </Typography>
        </Link>
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-container">
            <TextField
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search anime or manga"
              variant="outlined"
              className="search-input"
              sx={{ flex: 1 }}
            />
            {/* <SearchIcon className="search-icon" color="primary" onClick={handleSearch} /> */}
          </div>
          {searchError && <p className="search-error">{searchError}</p>}
        </form>
        <button className={`hamburger-menu ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
          ☰
        </button>
      </header>

      {isMenuOpen && (
        <div className="menu-overlay" onClick={closeMenu}>
          <div className="menu-content">
            {/* <button className="close-button" onClick={closeMenu}>
              X
            </button> */}
            {user ? (
              <Link to="/profile">
                <PersonOutline style={{ fontSize: '80px', marginRight: '5px', color: 'mintcream' }} />
                <Typography variant="h6" style={{ color: 'mintcream' }}>{user.username}</Typography>
              </Link>
            ) : (
              <>
                <PersonOutline style={{ fontSize: '80px', marginRight: '5px', color: 'mintcream' }} />
                <Typography variant="h6" style={{ color: 'mintcream' }}>Guest</Typography>
              </>
            )}
            <Link to="/about">
              <Typography variant="h6">About</Typography>
            </Link>
            {user && (
              <>
                <Link to="/profile">
                  <Typography variant="h6">Profile</Typography>
                </Link>
                <Link to="/bookmarks">
                  <Typography variant="h6">Bookmarks</Typography>
                </Link>
                <Link to="/scheduler">
                  <Typography variant="h6">Scheduler</Typography>
                </Link>
              </>
            )}
            {user ? (
              <Link to="/" onClick={handleLogout}>
                <Typography variant="h6">Sign Out</Typography>
              </Link>
            ) : (
              <Link to="/login">
                <Typography variant="h6">Sign In</Typography>
              </Link>
            )}
          </div>
        </div>
      )}
      {showSignOutPopup && (
        <div className="sign-out-popup">
          <p>Successfully signed out</p>
        </div>
      )}
    </div>
  );
}

export default Header;
