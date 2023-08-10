import React, { useState } from 'react';
import { Button, TextField, Container, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const Liquidity = () => {
    const [tokenA, setTokenA] = useState('');
    const [tokenB, setTokenB] = useState('');

    const handleAddLiquidity = () => {
        // Logic to interact with Uniswap contracts for adding liquidity
        
    };

    return (
        <Container maxWidth="sm">
            <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel id="tokenA-select-label">Token A</InputLabel>
                <Select
                    labelId="tokenA-select-label"
                    id="tokenA-select"
                    value={tokenA}
                    onChange={(e) => setTokenB(e.target.value)}
                    label="Token A"
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value="ETH">ETH</MenuItem>
                    <MenuItem value="USDT">USDT</MenuItem>
                    <MenuItem value="DAI">DAI</MenuItem>
                </Select>
            </FormControl>
             <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel id="tokenB-select-label">Token B</InputLabel>
                <Select
                    labelId="tokenB-select-label"
                    id="tokenB-select"
                    value={tokenB}
                    onChange={(e) => setTokenB(e.target.value)}
                    label="Token B"
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value="ETH">ETH</MenuItem>
                    <MenuItem value="USDT">USDT</MenuItem>
                    <MenuItem value="DAI">DAI</MenuItem>
                </Select>
            </FormControl>
            <Button variant="contained" color="primary" onClick={handleAddLiquidity}>
                Add Liquidity
            </Button>
        </Container>
    );
}

export default Liquidity;
