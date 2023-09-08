import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Link } from '@mui/material';
import { useEthers } from '@usedapp/core';
import logoround from '../logoround.jpg';

function Navbar() {
  const { account, activateBrowserWallet, deactivate, chainId } = useEthers();

  return (
    <AppBar position="static" style={{ background: 'black' }}>
      <Toolbar>
        {/* Logo and Home Link */}
        <IconButton edge="start" color="inherit" aria-label="home" href="/">
          <img 
            src={logoround} 
            alt="Space Pirates Finance Logo" 
            style={{ width: '70px', borderRadius: '50%' }} // Increase width and set rounded edges 
          />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, color: 'white' }}>
          Space Pirates Finance
        </Typography>

        

        {/* Navigation Links */}
        <Link href="/swap" color="inherit" underline="none" sx={{ marginLeft: 2, marginRight: 2 }}>
          Swap
        </Link>
        <Link href="/liquidity" color="inherit" underline="none" sx={{ marginLeft: 2 }}>
          Liquidity
        </Link>
        
        {/* Wallet Connection */}
        {account ? (
          <>
            <Typography variant="body1" sx={{ marginRight: 2, color: 'white' }}>
              {account.slice(0, 6) + '...'}
            </Typography>
            <Button color="inherit" onClick={deactivate}>
              Disconnect
            </Button>
          </>
        ) : (
          <Button color="inherit" onClick={activateBrowserWallet}>
            Connect Wallet
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
