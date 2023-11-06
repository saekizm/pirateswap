import React, { useState, useEffect } from 'react';
import { Slider, Typography, Grid, Button } from '@mui/material';
import { useContractFunction, useEthers } from '@usedapp/core';
import { Contract } from '@ethersproject/contracts';
import { parseUnits } from '@ethersproject/units';
import { BigNumber } from 'ethers';
import { addresses, abis, MAINNET_ID } from "./contracts";
import { TOKENS } from '../tokens';


const RemoveLiquidity = ({ pair }) => {
  const [sliderValue, setSliderValue] = useState(0); // Slider value in percentage
  const [tokenAmounts, setTokenAmounts] = useState({ tokenA: '0', tokenB: '0' });
  const { library: provider, account } = useEthers();
  const lpTokenContract = new Contract(pair.id, abis.pair, provider);
  const uniswapV2RouterContract = new Contract(addresses[MAINNET_ID].router02, abis.router02, provider);
  const cro = TOKENS.find(token => token.symbol === 'CRO')
 
  const { send: removeLiquidity } = useContractFunction(uniswapV2RouterContract, 'removeLiquidity', {
    transactionName: 'Remove Liquidity',
  });
  const { send: removeLiquidityETH, state: removeLiquidityETHState } = useContractFunction(uniswapV2RouterContract, 'removeLiquidityETH', {
    transactionName: 'Remove LiquidityETH',
  });

  

  const updateTokenAmounts = async (percentage) => {
    // Get the total supply of LP tokens
    const totalSupply = await lpTokenContract.totalSupply();
  
    // Get the reserves for token A and token B
    const [reserveA, reserveB] = await lpTokenContract.getReserves();
  
    // Get the user's balance of LP tokens
    const userLiquidity = await lpTokenContract.balanceOf(account);
  
    // Calculate the user's share of liquidity to remove based on the slider percentage
    const liquidityToRemove = userLiquidity.mul(percentage).div(100);
  
    // Calculate the amount of each token to remove based on the user's share
    const amountA = reserveA.mul(liquidityToRemove).div(totalSupply);
    const amountB = reserveB.mul(liquidityToRemove).div(totalSupply);
  
    // Update state with the calculated token amounts, formatted as strings
    setTokenAmounts({
      tokenA: amountA.toString(),
      tokenB: amountB.toString()
    });
  };
  
  useEffect(() => {
    updateTokenAmounts(sliderValue);
  }, [sliderValue]);

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
  };

  const handleRemoveLiquidity = async () => {
    if (!account) return;
  

    const deadline = Math.floor(Date.now() / 1000) + 20 * 60; // 20 minutes from now
  
    // Retrieve the LP token balance of the user
    const liquidity = await lpTokenContract.balanceOf(account);
  
    // Calculate the LP tokens to remove based on the slider percentage
    const liquidityToRemove = liquidity.mul(sliderValue).div(100);
  
    try {
      // If one of the tokens in the pair is WETH/ETH, use `removeLiquidityETH`
      // You would need to check if `pair.token0` or `pair.token1` is WETH/ETH
      if (pair.token0.id === cro.address || pair.token1.id === cro.address) {
        const tokenAddress = pair.token0.id === cro.address ? pair.token1.id : pair.token0.id;
  
        await removeLiquidityETH(tokenAddress, liquidityToRemove, 0, 0, account, deadline);
      } else {
        // If neither of the tokens is WETH/ETH, use `removeLiquidity`
        await removeLiquidity(pair.token0.id, pair.token1.id, liquidityToRemove, 0, 0, account, deadline);
      }
    } catch (error) {
      // Handle errors, such as rejection by user or transaction failure
      console.error('Failed to remove liquidity:', error);
    }
  };
  
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography gutterBottom>Remove Liquidity</Typography>
        <Slider value={sliderValue} onChange={handleSliderChange} aria-labelledby="liquidity-percentage-slider" />
        <Typography>{`You are removing ${sliderValue}% of your liquidity`}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>{`${pair.token0.symbol} Amount: ${tokenAmounts.tokenA}`}</Typography>
        <Typography>{`${pair.token1.symbol} Amount: ${tokenAmounts.tokenB}`}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" onClick={handleRemoveLiquidity}>
          Remove Liquidity
        </Button>
      </Grid>
    </Grid>
  );
};

export default RemoveLiquidity;
