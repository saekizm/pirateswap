import React, { useState } from 'react';
import { parseUnits, formatUnits } from 'ethers/lib/utils';
import { useEthers } from '@usedapp/core';
import { usePresaleContract } from '../hooks/usePresaleContract';
import { getMerkleProof } from '../utils/merkleTree';
import { Button, TextField, Box, Container, Typography, LinearProgress } from '@mui/material';

export const WhitelistPresale = () => {
    const { account } = useEthers();
    const { state, send, tokenPriceInCRO, nftSaleSold } = usePresaleContract();
    const [mintAmount, setMintAmount] = useState(1);
    const totalTokens = 2000000;
    const saleProgress = nftSaleSold ? (parseFloat(formatUnits(nftSaleSold, 18)) / totalTokens) * 100 : 0;
    const price = tokenPriceInCRO ? (parseFloat(formatUnits(tokenPriceInCRO, 18))) : 0.009737;

    const handleMint = async () => {
        if (!account) return;
        const merkleProof = getMerkleProof(account);
        send(merkleProof, {value: parseUnits(mintAmount.toString(), 'ether')});
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
                {nftSaleSold ? formatUnits(nftSaleSold, 18) : '0'} / {totalTokens} sold
                </Typography>
            </Box>
            <Box sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
            }}>
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