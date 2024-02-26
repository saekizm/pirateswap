// src/components/LandingPage.js

import React from 'react';
import { Container, Typography } from '@mui/material';
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

const Pools = () => {
    const classes = useStyles();

    return (
        <Container className={classes.root} maxWidth={false}>

            <Typography variant='h1' color={'white'}>
                Coming Soon!
            </Typography>
        </Container>
    );
};

export default Pools;
