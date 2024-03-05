import React, { useState, useEffect } from 'react';
import { Slider, Typography, Grid, Button, Box } from '@mui/material';
import { useContractFunction, useEthers } from '@usedapp/core';
import { Contract } from '@ethersproject/contracts';
import { BigNumber, ethers } from 'ethers';
import { addresses, abis, MAINNET_ID } from "./contracts";
import { TOKENS } from '../tokens';
import { formatUnits } from 'ethers/lib/utils';


const RemoveLiquidity = ({ pair }) => {
  const [sliderValue, setSliderValue] = useState(0); // Slider value in percentage
  const [tokenAmounts, setTokenAmounts] = useState({ tokenA: '0', tokenB: '0' });
  const [isApproved, setIsApproved] = useState(false);
  const { library: provider, account } = useEthers();
  const lpTokenContract = new Contract(pair.id, abis.pair, provider);
  const uniswapV2RouterContract = new Contract(addresses[MAINNET_ID].router02, abis.router02, provider);
  const cro = TOKENS.find(token => token.symbol === 'CRO')
  const routerAddress = addresses[MAINNET_ID].router02;


  const { send: removeLiquidity } = useContractFunction(uniswapV2RouterContract, 'removeLiquidity', {
    transactionName: 'Remove Liquidity',
  });
  const { send: removeLiquidityETH, state: removeLiquidityETHState } = useContractFunction(uniswapV2RouterContract, 'removeLiquidityETH', {
    transactionName: 'Remove LiquidityETH',
  });
  const { state: approvalState, send: approve } = useContractFunction(lpTokenContract, 'approve', {
    transactionName: 'Approve LP Token',
  });

  useEffect(() => {
    const checkApproval = async () => {
      if (account && sliderValue > 0) {
        const liquidityBalance = await lpTokenContract.balanceOf(account);
        const liquidityToRemove = liquidityBalance.mul(sliderValue).div(100);
        const allowance = await lpTokenContract.allowance(account, routerAddress);
        setIsApproved(allowance.gte(liquidityToRemove));
      }
    };
  
    checkApproval();
  }, [account, lpTokenContract, routerAddress, sliderValue]); // Dependency on sliderValue ensures check runs when it changes.
  

  const handleApprove = () => {
    approve(routerAddress, ethers.constants.MaxUint256);
  };

  useEffect(() => {
    if (approvalState.status === 'Success') {
      setIsApproved(true);
    }
  }, [approvalState]);



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

    const formattedAmountA = parseFloat(formatUnits(amountA, 18)).toFixed(4);
    const formattedAmountB = parseFloat(formatUnits(amountB, 18)).toFixed(4);

    setTokenAmounts({
      tokenA: formattedAmountA,
      tokenB: formattedAmountB
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

    // Retrieve the LP token balance of the user as BigNumber
    const liquidity = await lpTokenContract.balanceOf(account);

    // Calculate the LP tokens to remove based on the slider percentage, ensuring BigNumber operations
    const liquidityToRemove = liquidity.mul(BigNumber.from(sliderValue)).div(100);
    console.log(formatUnits(liquidity, 18), formatUnits(liquidityToRemove, 18));

    try {
      if (pair.token0.id === cro.address || pair.token1.id === cro.address) {
        const tokenAddress = pair.token0.id === cro.address ? pair.token1.id : pair.token0.id;

        // Ensure 'liquidityToRemove' and other numeric values are passed as BigNumber
        // You might need to adjust 'amountAMin' and 'amountBMin' to appropriate minimum values you're willing to accept
        const amountAMin = BigNumber.from(0);
        const amountBMin = BigNumber.from(0);

        // Optionally specify gas limit if automatic estimation fails
        const options = { gasLimit: ethers.utils.hexlify(300000) }; // Example gas limit, adjust as needed

        await removeLiquidityETH(tokenAddress, liquidityToRemove, amountAMin, amountBMin, account, deadline, options);
      } else {
        const amountAMin = BigNumber.from(0);
        const amountBMin = BigNumber.from(0);

        // Optionally specify gas limit if automatic estimation fails
        const options = { gasLimit: ethers.utils.hexlify(300000) }; // Example gas limit, adjust as needed

        await removeLiquidity(pair.token0.id, pair.token1.id, liquidityToRemove, amountAMin, amountBMin, account, deadline, options);
      }
    } catch (error) {
      console.error('Failed to remove liquidity:', error);
    }
  };

  return (
    <Grid container spacing={2} justifyContent="center"> {/* Add justifyContent to center the items */}
      <Grid item xs={12}>
        <Typography gutterBottom>Remove Liquidity</Typography>
        <Slider value={sliderValue} onChange={handleSliderChange} aria-labelledby="liquidity-percentage-slider" />
        <Typography>{`You are removing ${sliderValue}% of your liquidity`}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>{`${pair.token0.symbol} Amount: ${tokenAmounts.tokenA}`}</Typography>
        <Typography>{`${pair.token1.symbol} Amount: ${tokenAmounts.tokenB}`}</Typography>
      </Grid>
      {/* Wrap the buttons in a Box for additional styling if needed */}
      <Box mt={2} display="flex" justifyContent="center" width="100%">
        <Button
          variant="contained"
          color="primary"
          onClick={handleApprove}
          disabled={isApproved}  // Disable the button if already approved
        >
          Approve
        </Button>
        {/* You might want to add some margin between the buttons */}
        <Box mx={2} /> {/* Adds margin on the x-axis between buttons */}
        <Button
          variant="contained"
          color="secondary"
          onClick={handleRemoveLiquidity}
          disabled={!isApproved}  // Only enable the button if it is approved
        >
          Remove Liquidity
        </Button>
      </Box>
    </Grid>
  );
};

export default RemoveLiquidity;
