import React from 'react';
import Typography from '@mui/material/Typography';
import { Container, Grid, Paper } from '@mui/material';
import Header from './Header';
import './styles/About.css';

function FeatureCard({ title, description }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Paper elevation={3} className="feature-card">
        <div className="feature-content">
          <Typography variant="h5" className="feature-title" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body1">{description}</Typography>
        </div>
      </Paper>
    </Grid>
  );
}

function About() {
  return (
    <div>
      <Header />
      <Container className="about" maxWidth="md">
        <Typography variant="h4" className='aboutTitle' align="center" gutterBottom>
          About Me and the Website
        </Typography>
        <Typography variant="body1" paragraph align="center">
          Welcome to Animeta! This website is dedicated to providing anime and manga enthusiasts with a dynamic platform
          to explore and keep track of trending titles. As a passionate anime lover, I created this website to share my love for
          anime and manga with the world. Feel free to browse through the extensive library of animated content and
          discover new and exciting series!
        </Typography>
        <Typography variant="h4" className='keyFeaturesTitle' align="center" gutterBottom>
          Key Features
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          <FeatureCard
            title="Bookmarking Favorites"
            description="Easily bookmark your favorite anime and manga titles, making it convenient to access them later."
          />
          <FeatureCard
            title="Tracking/Managing Time"
            description="Effortlessly keep track of the time you spend reading manga or watching anime episodes."
          />
          <FeatureCard
            title="Writing Notes"
            description="Post your thoughts and opinions by writing notes on your favorite animated titles."
          />
        </Grid>
      </Container>
    </div>
  );
}

export default About;
