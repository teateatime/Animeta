import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
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
import './styles/LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [userProfile, setUserProfile] = useState({
    username: '',
    favoriteAnime: '',
  });

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

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);

      // Get the current user's UID
      const user = firebase.auth().currentUser;

      // Retrieve the user's data from Firestore
      const userDoc = await firestore.collection("users").doc(user.uid).get();
      const userData = userDoc.data();

      // Update the local state with user data
      setUserProfile(userData);

      navigate('/');
    } catch (error) {
      console.error('Error signing in:', error);
      setErrorMessage('Invalid email or password. Please try again.');
    }
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEmailSignIn(e);
    }
  };

  return (
    <div className="login-page">
      <div className="video-background">
        <video autoPlay muted loop id="video-bg" preload="auto" poster={posterImage}>
          <source src={videoBackground} type="video/mp4" />
        </video>
      </div>
      <div className="login-content">
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
              Sign In
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
              onKeyDown={handleKeyDown} // Add keydown event listener
            />
            <TextField
              label="Password *"
              variant="outlined"
              fullWidth
              size="small"
              type={'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown} // Add keydown event listener
            />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
          <div className="button-container">
            <Button variant="contained" color="primary" onClick={handleEmailSignIn}>
              Login
            </Button>
            <Button 
              variant="outlined"
              className='signup-here-button' 
              onClick={handleSignUp}>
              Sign Up
            </Button>
          </div>
          <Button
            className="google-sign-in"
            variant="contained"
            onClick={handleGoogleSignIn}
            style={{ marginTop: '4px' }}
            startIcon={<img src={googleLogo} alt="Google Logo" width="18" height="18" />}
          >
            Sign in with Google
          </Button>
          <br></br>
          <Typography variant="body2" style={{marginTop: "15px"}}>
            <Link to="/forgot-password" className="forgot-password-link" style={{color: "#222"}}>
                Forgot Password?
            </Link>
          </Typography>
        </Paper>
      </div>
    </div>
  );
}

export default LoginPage;