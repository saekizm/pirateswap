import React, { useState } from 'react';
import { Button, Grid, IconButton, Container, FormControl, InputAdornment, InputLabel, Typography, Select, MenuItem, Box } from '@mui/material';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';

const Liquidity = () => {
    const [tokenA, setTokenA] = useState('');
    const [tokenB, setTokenB] = useState('');

    const handleAddLiquidity = () => {
        // Logic to interact with Uniswap contracts for adding liquidity
    };

    return (
        <Container maxWidth="sm" style={{ marginTop: '50px', padding: '20px', borderRadius: '15px', backgroundColor: '#f5f5f5', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h6">Add Liquidity</Typography>
                </Grid>
                <Grid item xs={12}>
                    <FormControl variant="outlined" fullWidth>
                        <InputLabel id="tokenA-select-label">Token A</InputLabel>
                        <Select
                            labelId="tokenA-select-label"
                            id="tokenA-select"
                            value={tokenA}
                            onChange={(e) => setTokenA(e.target.value)}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton>
                                        <ArrowDropDownCircleIcon />
                                    </IconButton>
                                </InputAdornment>
                            }
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            <MenuItem value="ETH">ETH</MenuItem>
                            <MenuItem value="USDT">USDT</MenuItem>
                            <MenuItem value="DAI">DAI</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControl variant="outlined" fullWidth>
                        <InputLabel id="tokenB-select-label">Token B</InputLabel>
                        <Select
                            labelId="tokenB-select-label"
                            id="tokenB-select"
                            value={tokenB}
                            onChange={(e) => setTokenB(e.target.value)}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton>
                                        <ArrowDropDownCircleIcon />
                                    </IconButton>
                                </InputAdornment>
                            }
                        >
                            <MenuItem value="">
                                <em>None</em>
                            </MenuItem>
                            <MenuItem value="ETH">ETH</MenuItem>
                            <MenuItem value="USDT">USDT</MenuItem>
                            <MenuItem value="DAI">DAI</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" fullWidth onClick={handleAddLiquidity}>
                        Add Liquidity
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
}

export default Liquidity;
