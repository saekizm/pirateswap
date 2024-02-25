import React from 'react';
import { Box, Container } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faMediumM, faTelegramPlane } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'black', // Set the background color
        textAlign: 'center',
      }}
    >
      <Container maxWidth="sm">
        {/* Twitter Icon */}
        <a href="https://twitter.com/Cronosphere_" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faTwitter} style={{ color: 'white', margin: '0 10px' }} size="lg" />
        </a>
        
        {/* Medium Icon */}
        <a href="https://medium.com/@cronospheretoken" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faMediumM} style={{ color: 'white', margin: '0 10px' }} size="lg" />
        </a>
        
        {/* Telegram Icon */}
        <a href="https://t.me/Cronosphere" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faTelegramPlane} style={{ color: 'white', margin: '0 10px' }} size="lg" />
        </a>
      </Container>
    </Box>
  );
};

export default Footer;
