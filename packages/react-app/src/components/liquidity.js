import React, { useState } from 'react';
import {
    Button,
    Grid,
    IconButton,
    Container,
    FormControl,
    Typography,
    TextField,
    Box,
    Dialog,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const Liquidity = () => {
    const [tokenA, setTokenA] = useState('');
    const [tokenB, setTokenB] = useState('');
    const [amountA, setAmountA] = useState('');
    const [amountB, setAmountB] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [tokenField, setTokenField] = useState('');

    const handleAddLiquidity = () => {
        // Logic to interact with Uniswap contracts for adding liquidity
    };

    const handleOpenDialog = (field) => {
        setTokenField(field);
        setOpenDialog(true);
    };

    const handleCloseDialog = (token) => {
        if (tokenField === 'A') {
            setTokenA(token);
        } else {
            setTokenB(token);
        }
        setOpenDialog(false);
    };

    const TokenInput = ({ token, setToken, amount, setAmount, label }) => (
        <FormControl variant="outlined" fullWidth>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Button onClick={() => setAmount('max')}>Max</Button>
                <TextField
                    label={label}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    variant="outlined"
                    style={{ flex: 1 }}
                />
                <IconButton onClick={() => handleOpenDialog(label)}>
                    <ArrowDropDownIcon />
                </IconButton>
            </Box>
        </FormControl>
    );

    const TokenDialog = () => (
        <Dialog onClose={() => setOpenDialog(false)} open={openDialog}>
            <DialogTitle>Select a token</DialogTitle>
            <List>
                {['ETH', 'USDT', 'DAI'].map((token) => (
                    <ListItem button onClick={() => handleCloseDialog(token)} key={token}>
                        <ListItemText primary={token} />
                    </ListItem>
                ))}
            </List>
        </Dialog>
    );

    return (
        <Container maxWidth="sm" style={{ marginTop: '50px', padding: '20px', borderRadius: '15px', backgroundColor: '#f5f5f5', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h6">Add Liquidity</Typography>
                </Grid>
                <Grid item xs={12}>
                    <TokenInput
                        token={tokenA}
                        setToken={setTokenA}
                        amount={amountA}
                        setAmount={setAmountA}
                        label="Token A Amount"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TokenInput
                        token={tokenB}
                        setToken={setTokenB}
                        amount={amountB}
                        setAmount={setAmountB}
                        label="Token B Amount"
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" fullWidth onClick={handleAddLiquidity}>
                        Add Liquidity
                    </Button>
                </Grid>
            </Grid>
            <TokenDialog />
        </Container>
    );
}

export default Liquidity;
