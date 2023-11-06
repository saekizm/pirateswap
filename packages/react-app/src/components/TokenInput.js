import React from 'react';
import {
  Button,
  Box,
  FormControl,
  InputAdornment,
  IconButton,
  OutlinedInput,
  FormHelperText,
  InputLabel,
  Grid,
  Typography
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const TokenInput = ({
  amount,
  setAmountA, 
  setAmountB, 
  label,
  field,
  getAmount,
  handlePercentage,
  handleOpenDialog,
  symbol
}) => {
  // Function to decide which amount setter to use
  const handleAmountChange = async (e) => {
    console.log("input");
    const value = e.target.value; // Extract the value once to avoid event pooling issues
    console.log(value); // Check what the value is when you hit backspace
  
    if (!value) {
      // Handle empty input case by resetting the amounts
      setAmountA('');
      setAmountB('');
      return; // Exit early
    }
  
    try {
      const amounts = await getAmount(value, field);
      setAmountA(amounts.amountA);
      setAmountB(amounts.amountB);
    } catch (error) {
      console.error(`Failed to get amounts for field ${field}`, error);
      // Handle the error state appropriately
      // Maybe reset the amounts or provide feedback to the user
    }
  };
  
  
  
  return (
    <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
      <InputLabel htmlFor={`outlined-adornment-amount-${field}`}>{label}</InputLabel>
      <OutlinedInput
        id={`outlined-adornment-amount-${field}`}
        value={amount}
        onChange={handleAmountChange}
        label={label}
      />
      <Box sx={{ mt: 1 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Grid container spacing={1}>
              {[25, 50, 75, 100].map((percentage, index) => (
                <Grid item xs={3} key={index}>
                  <Button fullWidth variant="outlined" onClick={() => handlePercentage(field, percentage)}>
                    {percentage === 100 ? 'Max' : `${percentage}%`}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
            {symbol}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(field)}
            >
              <ArrowDropDownIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
    </FormControl>
  );
};

export default TokenInput;
