import React, { useState } from 'react';
import { parseUnits, formatUnits, hexlify } from 'ethers/lib/utils';
import { useEthers } from '@usedapp/core';
import { usePresaleContract } from '../hooks/usePresaleContract';
import { Button, TextField, Box, Container, Typography, LinearProgress, Paper } from '@mui/material';
import useCountdown from './useCountdown';


export const WhitelistPresale = () => {
    const { account } = useEthers();
    const { state, send, tokenPriceInCRO, allocations, publicSaleSold } = usePresaleContract();
    const [mintAmount, setMintAmount] = useState(1);
    const totalTokens = 3000000;
    const saleProgress = publicSaleSold ? (parseFloat(formatUnits(publicSaleSold, 18)) / totalTokens) * 100 : 0;
    const price = tokenPriceInCRO ? (parseFloat(formatUnits(tokenPriceInCRO, 18))) : 0.009737;

    const [days, hours, minutes, seconds] = useCountdown('2024-03-03T20:00:00Z');


    const handleMint = async () => {
        if (!account) return;


        // If the proof is valid, proceed with the minting process
        const options = {
            gasLimit: hexlify(100000), // Example gas limit, adjust based on needs
        };

        send(options)
            .then((tx) => tx.wait()) // Wait for transaction to be mined
            .then(() => alert("Tokens Claimed!"))
            .catch((error) => console.error(error));


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
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'white', textDecoration: "overline underline", textShadow: "2px  2px 4px #000000" }}>
                SDABS Token Launch
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 'medium', mb: 2, textAlign: 'center' }}>
                {`Launch in: ${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`}
            </Typography>


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
                <Button variant="contained" onClick={handleMint} disabled={!account || state.status === 'Mining'}>
                    Claim
                </Button>
                {state.errorMessage && <Typography color="error">{state.errorMessage}</Typography>}
            </Box>
        </Container>
    );
};    