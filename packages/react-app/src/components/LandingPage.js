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
    backgroundColor: '#000',
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
