import React, { useState } from 'react';
import { parseUnits, formatUnits, hexlify } from 'ethers/lib/utils';
import { useEthers } from '@usedapp/core';
import { usePresaleContract } from '../hooks/usePresaleContract';
import { Button, TextField, Box, Container, Typography, LinearProgress } from '@mui/material';

export const WhitelistPresale = () => {
    const { account } = useEthers();
    const { state, send, tokenPriceInCRO, allocations, publicSaleSold } = usePresaleContract();
    const [mintAmount, setMintAmount] = useState(1);
    const totalTokens = 3000000;
    const saleProgress = publicSaleSold ? (parseFloat(formatUnits(publicSaleSold, 18)) / totalTokens) * 100 : 0;
    const price = tokenPriceInCRO ? (parseFloat(formatUnits(tokenPriceInCRO, 18))) : 0.009737;

    const handleMint = async () => {
        if (!account) return;


        // If the proof is valid, proceed with the minting process
        const options = {
            value: parseUnits(mintAmount.toString(), 'ether'),
            gasLimit: hexlify(100000), // Example gas limit, adjust based on needs
        };

        send(options);
    };



    return (
        <Container maxWidth="sm" sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            mt: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
        }}>
            <Typography variant="h6" component="h2" marginBottom={2}>
                Pirates Presale
            </Typography>
            <Typography variant="body1">
                Price per token: {price} CRO
            </Typography>
            <Box width="100%" mb={2}>
                <Typography variant="body2">Sale Progress</Typography>
                <LinearProgress variant="determinate" value={saleProgress} />
                <Typography variant="body2" align="right">
                    {publicSaleSold ? formatUnits(publicSaleSold, 18) : '0'} / {totalTokens} sold
                </Typography>
            </Box>
            <Box sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
            }}>
                <Typography variant="body2">
                    Your tokens: {allocations ? formatUnits(allocations, 18) : '0'} will be claimable at launch.
                </Typography>
                <TextField
                    fullWidth
                    label="Enter CRO Amount"
                    type="number"
                    variant="outlined"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(Number(e.target.value))}
                />
                <Button variant="contained" onClick={handleMint} disabled={!account || state.status === 'Mining'}>
                    Buy
                </Button>
                {state.errorMessage && <Typography color="error">{state.errorMessage}</Typography>}
            </Box>
        </Container>
    );
};    