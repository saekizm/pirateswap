import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  Grid,
  Typography,
  IconButton,
  InputAdornment
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { debounce } from 'lodash';

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
  // State to handle the local input value for debouncing
  const [inputValue, setInputValue] = useState(amount);
  const [isUserInput, setIsUserInput] = useState(true);


  useEffect(() => {
    setInputValue(amount); // Update local state when amount changes externally
  }, [amount]);

  const debouncedInputChange = useCallback(debounce(async (value) => {
    if (!value) {
      setAmountA('');
      setAmountB('');
      return;
    }
  
    try {
      const amounts = await getAmount(value, field);
      if (isUserInput) { // Check if the change was directly by the user
        if (field === 'A') {
          setAmountA(value);
          setAmountB(amounts.amountB);
        } else {
          setAmountA(amounts.amountA);
          setAmountB(value);
        }
        setIsUserInput(false); // Reset the flag after programmatic update
      }
    } catch (error) {
      console.error(`Failed to get amounts for field ${field}`, error);
    }
  }, 500), [getAmount, field, setAmountA, setAmountB, isUserInput]);
  

  useEffect(() => {
    if (inputValue && isUserInput) {
      debouncedInputChange(inputValue);
    }
    // No need to include `isUserInput` in the dependency array to avoid re-triggering when it changes.
  }, [inputValue, debouncedInputChange]);
  

  const handleChange = (e) => {
    const { value } = e.target;
    setInputValue(value); // Update local state with the input value for debouncing
    setIsUserInput(true); // Indicate this update is directly from user input
  };
  

  return (
    <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
      <InputLabel htmlFor={`outlined-adornment-amount-${field}`}>{label}</InputLabel>
      <OutlinedInput
        id={`outlined-adornment-amount-${field}`}
        value={inputValue}
        onChange={handleChange}
        label={label}
      />
      <Box sx={{ mt: 1 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Grid container spacing={1}>
              {[25, 50, 75, 100].map((percentage, index) => (
                <Grid item xs={3} key={index}>
                  <Button fullWidth variant="outlined" onClick={() => handlePercentage(field, percentage)}>
                    {percentage}% 
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
