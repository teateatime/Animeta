import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { firebase, firestore } from '../firebase';
import 'firebase/auth';
import googleLogo from '../assets/images/GoogleLogo.png';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import videoBackground from '../assets/videos/tired-anime.mp4';
import posterImage from '../assets/images/tired-anime-girl.jpg';
import './styles/SignUpPage.css';

function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setErrorMessage] = useState(null);
  const [userProfile, setUserProfile] = useState({
    username: '',
    favoriteAnime: '',
  });

  const handleSignUp = async () => {
    if (!isEmailValid(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Create a user profile document with default values
      await firestore.collection('users').doc(user.uid).set({
        username: '',
        favoriteAnime: '',
      });

      navigate('/');
    } catch (error) {
      console.error('Error signing up:', error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('The email address is already in use by another account.');
      } else {
        setErrorMessage('An error occurred while signing up. Please try again.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const userCredential = await firebase.auth().signInWithPopup(provider);
      const user = userCredential.user;
      
      // Check if the user document already exists
      const userDoc = await firestore.collection('users').doc(user.uid).get();
      
      if (!userDoc.exists) {
        // Create a user profile document with default values
        await firestore.collection('users').doc(user.uid).set({
          username: '',
          favoriteAnime: '',
        });
      }
  
      navigate('/');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSignUp(e);
    }
  };

  function isEmailValid(email) {
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  return (
    <div className="signup-page">
      <div className="video-background">
        <video autoPlay muted loop id="video-bg" preload="auto" poster={posterImage}>
          <source src={videoBackground} type="video/mp4" />
        </video>
      </div>
      <div className="signup-content">
        <Paper elevation={3} className="signup-menu">
          <div className="lock-icon">
            <Avatar
              className="lock-avatar"
              sx={{
                bgcolor: '#1976d2',
                width: 40,
                height: 40,
                margin: '0 auto',
              }}
            >
              <LockOutlinedIcon fontSize="medium" />
            </Avatar>
            <Typography variant="h5" className="sign-in-heading">
              Sign Up
            </Typography>
            <Typography variant="body2" className="custom-paragraph">
              Keep track of your favorite animes and manga
            </Typography>
          </div>
          <div className="LoginForm">
            <TextField
              label="Email *"
              variant="outlined"
              fullWidth
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password *"
              variant="outlined"
              fullWidth
              size="small"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {error && <p className="error-message">{error}</p>}
          </div>
          <div className="button-container">
            <Button variant="contained" color="primary" onClick={handleSignUp}>
              Sign Up
            </Button>
          </div>
          <div className="google-sign-in-container">
            <Button
              className="google-sign-in"
              variant="contained"
              onClick={handleGoogleSignIn}
              style={{ marginTop: '4px' }}
              startIcon={<img src={googleLogo} alt="Google Logo" width="18" height="18" />}
            >
              Sign up with Google
            </Button>
          </div>
          <div className="login-link">
            <Typography variant="body2" className="custom-paragraph">
              <p>Already have an account?</p>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                className='login-here-button'
              >
                Login Here
              </Button>
            </Typography>
          </div>
        </Paper>
      </div>
    </div>
  );
}

export default SignUpPage;
