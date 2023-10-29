import React, { useState } from 'react';
import {
  IconButton,
  Box,
  Button,
  TextField,
  Container,
  FormControl,
  InputAdornment,
  Grid,
  Typography,
} from '@mui/material';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
import Settings from '@mui/icons-material/Settings';
import { useEthers, useContractFunction, useTokenBalance } from '@usedapp/core';
import { Contract } from '@ethersproject/contracts';
import { MAINNET_ID, addresses, abis } from 'contracts';
import TokenDialog from './tokenDialog';
import { SettingModal } from './settingsModal';
import { utils } from 'ethers';

function Swap() {
  const { account, library } = useEthers();
  const [tokenA, setTokenA] = useState('ETH');
  const [tokenB, setTokenB] = useState('');
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedTokenField, setSelectedTokenField] = useState(null);

  const tokenABalance = useTokenBalance(addresses[MAINNET_ID].tokens[tokenA], account);

  const routerContract = new Contract(addresses[MAINNET_ID].router02, abis.router02, library);
  const { state, send } = useContractFunction(routerContract, 'swapExactTokensForTokens', { transactionName: 'Swap' });

  const handlePercentageClick = (percentage) => {
    if (tokenABalance) {
      const newAmount = tokenABalance.mul(percentage).div(100);
      setAmountIn(utils.formatUnits(newAmount, 18));
    }
  };

  const handleMaxClick = () => {
    if (tokenABalance) {
      setAmountIn(utils.formatUnits(tokenABalance, 18));
    }
  };

  const handleSwap = () => {
    if (tokenA && tokenB && amountIn && amountOut) {
      const args = [
        amountIn,
        amountOut,
        [addresses[MAINNET_ID].tokens[tokenA], addresses[MAINNET_ID].tokens[tokenB]],
        account,
        Math.floor(Date.now() / 1000) + 60 * 20,
      ];
      send(...args);
    }
  };

  const openTokenDialog = (field) => {
    setSelectedTokenField(field);
    setIsDialogOpen(true);
  };

  const handleTokenSelect = (token) => {
    if (selectedTokenField === 'A') {
      setTokenA(token);
    } else {
      setTokenB(token);
    }
    setIsDialogOpen(false);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        mt: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={10}>
          <Typography variant="h6">Swap</Typography>
        </Grid>
        <Grid item xs={2}>
          <IconButton onClick={() => setSettingsOpen(true)}>
            <Settings />
          </IconButton>
        </Grid>
        <Grid item xs={12}>
          <FormControl variant="outlined" fullWidth>
            <TextField
              label="From"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Box display="flex" alignItems="center">
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handlePercentageClick(100)}
                      >
                        Max
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handlePercentageClick(25)}
                      >
                        25%
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handlePercentageClick(50)}
                      >
                        50%
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handlePercentageClick(75)}
                      >
                        75%
                      </Button>
                      <IconButton onClick={() => openTokenDialog('A')}>
                        <ArrowDropDownCircleIcon />
                      </IconButton>
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl variant="outlined" fullWidth>
            <TextField
              label="To"
              value={amountOut}
              onChange={(e) => setAmountOut(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => openTokenDialog('B')}>
                      <ArrowDropDownCircleIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleSwap}>
            Swap
          </Button>
        </Grid>
      </Grid>

      <TokenDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSelect={handleTokenSelect} />

      <SettingModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

    </Container>
  );
}

export default Swap;
