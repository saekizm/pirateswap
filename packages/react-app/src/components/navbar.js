import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Link,
  Hidden,
  Drawer,
  List,
  ListItem,
} from "@mui/material";
import { useEthers } from "@usedapp/core";
import logoround from "../logoround.jpg";
import MenuIcon from "@mui/icons-material/Menu";
import { shortenAddress } from "@usedapp/core";

function Navbar() {
  const { account, activateBrowserWallet, deactivate, chainId } = useEthers();
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  const DrawerContent = () => (
    <List sx={{ color: "white" }}>
      <ListItem>
        <Link
          href="/swap"
          color="inherit"
          underline="none"
          sx={{ marginLeft: 2, marginRight: 2 }}
        >
          Swap
        </Link>
      </ListItem>
      <ListItem>
        <Link
          href="/liquidity"
          color="inherit"
          underline="none"
          sx={{ marginLeft: 2, marginRight: 2 }}
        >
          Liquidity
        </Link>
      </ListItem>
      <ListItem>
        <Link
          href="/sdabs"
          color="inherit"
          underline="none"
          sx={{ marginLeft: 2, marginRight: 2 }}
        >
          SDABS
        </Link>
      </ListItem>
      <ListItem>
        <Link
          href="/farms"
          color="inherit"
          underline="none"
          sx={{ marginLeft: 2, marginRight: 2 }}
        >
          Farms
        </Link>
      </ListItem>
      <ListItem>
        <Link
          href="/pools"
          color="inherit"
          underline="none"
          sx={{ marginLeft: 2, marginRight: 2 }}
        >
          Pools
        </Link>
      </ListItem>
      <ListItem>
        {account ? (
          <>
            <Link
              href="/nufts"
              color="inherit"
              underline="none"
              sx={{ marginLeft: 2, marginRight: 2 }}
            >
              {shortenAddress(account)}
            </Link>
            <Button color="inherit" onClick={deactivate}>
              Disconnect
            </Button>
          </>
        ) : (
          <Button color="inherit" onClick={activateBrowserWallet}>
            Connect Wallet
          </Button>
        )}
      </ListItem>
    </List>
  );

  return (
    <AppBar position="static" style={{ background: "black" }}>
      <Toolbar>
        <Hidden smDown>
          {" "}
          {/* Hide on small screens and down */}
          <IconButton edge="start" color="inherit" aria-label="home" href="/">
            <img
              src={logoround}
              alt="Space Pirates Finance Logo"
              style={{ width: "70px", borderRadius: "50%" }}
            />
          </IconButton>
        </Hidden>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Space Pirates Finance
        </Typography>

        {/* Desktop view */}
        <Hidden smDown>
          <Link
            href="/swap"
            color="inherit"
            underline="none"
            sx={{ marginLeft: 2, marginRight: 2 }}
          >
            Swap
          </Link>
          <Link
            href="/liquidity"
            color="inherit"
            underline="none"
            sx={{ marginLeft: 2, marginRight: 2 }}
          >
            Liquidity
          </Link>
          <Link
            href="/sdabs"
            color="inherit"
            underline="none"
            sx={{ marginLeft: 2, marginRight: 2 }}
          >
            SDABS
          </Link>
          <Link
            href="/farms"
            color="inherit"
            underline="none"
            sx={{ marginLeft: 2, marginRight: 2 }}
          >
            Farms
          </Link>
          <Link
            href="/pools"
            color="inherit"
            underline="none"
            sx={{ marginLeft: 2, marginRight: 2 }}
          >
            Pools
          </Link>
          {account ? (
            <>
              <Link
                href="/nufts"
                color="inherit"
                underline="none"
                sx={{ marginLeft: 2, marginRight: 2 }}
              >
                {shortenAddress(account)}
              </Link>
              <Button color="inherit" onClick={deactivate}>
                Disconnect
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={activateBrowserWallet}>
              Connect Wallet
            </Button>
          )}
        </Hidden>

        {/* Mobile view */}
        <Hidden mdUp>
          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
      </Toolbar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={handleDrawerToggle}
        PaperProps={{ style: { backgroundColor: "black" } }}
      >
        <DrawerContent />
      </Drawer>
    </AppBar>
  );
}

export default Navbar;
