import React, { useState } from 'react';
import { TOKENS } from '../tokens';
import TokenDialog from './tokenDialog';
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
    InputAdornment
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
        setTokenField(field);  // 'A' or 'B'
        setOpenDialog(true);
    };

    const handleCloseDialog = (token) => {
        if (tokenField === 'A') {
            setTokenA(token.symbol);  // Update to use the symbol property of the selected token
        } else {
            setTokenB(token.symbol);  // Update to use the symbol property of the selected token
        }
        setOpenDialog(false);
    };


    const TokenInput = ({ token, setToken, amount, setAmount, label, field }) => (
        <FormControl variant="outlined" fullWidth>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Button onClick={() => setAmount('max')}>Max</Button>
                <TextField
                    label={label}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    variant="outlined"
                    style={{ flex: 1 }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <Box display="flex" alignItems="center">
                                    <Typography variant="body1">{token}</Typography>
                                    <IconButton onClick={() => handleOpenDialog(field)}>  {/* pass field prop here */}
                                        <ArrowDropDownIcon />
                                    </IconButton>
                                </Box>
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>
        </FormControl>
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
                        field="A"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TokenInput
                        token={tokenB}
                        setToken={setTokenB}
                        amount={amountB}
                        setAmount={setAmountB}
                        label="Token B Amount"
                        field="B"
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" fullWidth onClick={handleAddLiquidity}>
                        Add Liquidity
                    </Button>
                </Grid>
            </Grid>
            <TokenDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onSelect={handleCloseDialog}
            />
        </Container>
    );
}

export default Liquidity;
