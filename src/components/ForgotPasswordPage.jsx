import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebase } from '../firebase';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import videoBackground from '../assets/videos/tired-anime.mp4';
import posterImage from '../assets/images/tired-anime-girl.jpg';
import './styles/ForgotPasswordPage.css';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordReset = async () => {
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (error) {
      setMessage('Error sending password reset email. Please try again.');
      console.error('Error sending password reset email:', error);
    }
  };

  const navigateToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="forgot-password-page">
      <div className="video-background">
        <video autoPlay muted loop id="video-bg" preload="auto" poster={posterImage}>
          <source src={videoBackground} type="video/mp4" />
        </video>
      </div>
      <div className="reset-content">
        <Paper elevation={3} className="forgot-pass-menu">
          <Typography variant="h5" className="forgot-password-heading">
            Forgot Your Password?
          </Typography>
          <Typography
            variant="body2"
            className="custom-paragraph"
            style={{ padding: '5px' }}
          >
            Please enter your email to receive a notification to reset your password
          </Typography>
          <div className="ResetForm">
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="button-container">
              <Button
                variant="contained"
                color="primary"
                onClick={handlePasswordReset}
              >
                Reset Password
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={navigateToLogin}
                className="back-to-login-button"
              >
                Back to Login
              </Button>
            </div>
            {message && <p className="reset-message">{message}</p>}
          </div>
        </Paper>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
