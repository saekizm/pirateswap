import React, { useState, useEffect } from 'react';
import { useEthers, useContractFunction } from '@usedapp/core';
import { Contract } from '@ethersproject/contracts';
import { Button, Typography, Grid, Container } from '@mui/material';
import { MAINNET_ID, addresses, abis } from "./contracts";
import TokenInput from "./TokenInput";

const RemoveLiquidity = () => {
    const { library: provider, account } = useEthers();
    const [amount, setAmount] = useState(''); // Amount of LP tokens to remove

    // Create a contract instance of the pair the user wants to remove liquidity from
    const pairContract = new Contract(addresses[MAINNET_ID].pair, abis.pair, provider.getSigner());
    
    // Setup for removing liquidity
    const uniswapV2RouterContract = new Contract(addresses[MAINNET_ID].router02, abis.router02);
    const { send: removeLiquidity, state: removeLiquidityState } = useContractFunction(uniswapV2RouterContract, 'removeLiquidity', {
        transactionName: 'Remove Liquidity',
    });

    const handleRemoveLiquidity = async () => {
        // This method should also consider minAmounts for tokens and other relevant parameters
        await removeLiquidity(
            // Parameters here: tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline
            // You'll need to provide these parameters accurately based on the context and user's selection
        );
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h6">Remove Liquidity</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TokenInput
                        amount={amount}
                        setAmount={setAmount}
                        label="LP Tokens"
                        field="LP"
                        // For simplicity, handlePercentage is not included. You may want to modify this based on your requirements.
                        handleOpenDialog={() => {}}
                        tokenContract={pairContract}
                        symbol="LP"
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleRemoveLiquidity}
                        disabled={!account || removeLiquidityState.status === 'Mining'}
                    >
                        Remove Liquidity
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
}

export default RemoveLiquidity;
