import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, List, ListItem, ListItemText, InputAdornment } from '@mui/material';
import { useTokenBalance, useEthers, useSendTransaction, useContractFunction } from '@usedapp/core';
import { Contract } from '@ethersproject/contracts';
import { MAINNET_ID, addresses, abis } from '@uniswap-v2-app/contracts'; // Adjust the path

function Swap() {
  const { account, library } = useEthers();
  const [tokenA, setTokenA] = useState('ETH');
  const [tokenB, setTokenB] = useState(null);
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTokenField, setSelectedTokenField] = useState(null); // 'A' or 'B'

  const routerContract = new Contract(addresses[MAINNET_ID].router02, abis.router02, library);
  const { state, send } = useContractFunction(routerContract, 'swapExactTokensForTokens', { transactionName: 'Swap' });

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

  const selectToken = (token) => {
    if (selectedTokenField === 'A') {
      setTokenA(token);
    } else {
      setTokenB(token);
    }
    setIsDialogOpen(false);
  };

  return (
    <div>
      <TextField
        label="From"
        value={amountIn}
        onChange={(e) => setAmountIn(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" onClick={() => openTokenDialog('A')}>
              {tokenA || 'Select Token'}
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="To"
        value={amountOut}
        onChange={(e) => setAmountOut(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" onClick={() => openTokenDialog('B')}>
              {tokenB || 'Select Token'}
            </InputAdornment>
          ),
        }}
      />
      <Button variant="contained" color="primary" onClick={handleSwap}>
        Swap
      </Button>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <List>
          {Object.keys(addresses[MAINNET_ID].tokens).map((token) => (
            <ListItem button key={token} onClick={() => selectToken(token)}>
              <ListItemText primary={token} />
            </ListItem>
          ))}
        </List>
      </Dialog>
    </div>
  );
}

export default Swap;
