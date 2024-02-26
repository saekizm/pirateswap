// src/components/LandingPage.js

import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  root: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundImage: "url('/background.webp')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative', // Needed to position the pseudo-element
    "&::before": { // Pseudo-element for the black fade-out effect
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'black',
      animation: 'fadeOutBlack 7s ease-out forwards', // Use forwards to keep the end state
    }
  },
  link: {
    textDecoration: 'none',
  },
});



const LandingPage = () => {
  const classes = useStyles();

  return (
    <Container className={classes.root} maxWidth={false}>
      <Link to="/swap" className={classes.link}>
        <Button variant="contained" color="primary">
          Enter App
        </Button>
      </Link>
    </Container>
  );
};

export default LandingPage;
