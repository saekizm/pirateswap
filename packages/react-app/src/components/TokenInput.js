import React from 'react';
import { Button, Box, FormControl, TextField, InputAdornment, IconButton, OutlinedInput, FormHelperText, InputLabel } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const TokenInput = ({
  amount,
  setAmount,
  label,
  field,
  handlePercentage,
  handleOpenDialog,
  tokenContract,
  symbol
}) => {
  return (
    <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
      <InputLabel htmlFor={`outlined-adornment-amount-${field}`}>{label}</InputLabel>
      <OutlinedInput
        id={`outlined-adornment-amount-${field}`}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        endAdornment={
          <InputAdornment position="end">
            <Box display="flex" alignItems="center">
              <Button onClick={() => handlePercentage(field, 25)}>25%</Button>
              <Button onClick={() => handlePercentage(field, 50)}>50%</Button>
              <Button onClick={() => handlePercentage(field, 75)}>75%</Button>
              <Button onClick={() => handlePercentage(field, 100)}>Max</Button>
              <Box marginLeft={1} />
              {tokenContract ? (
                <FormHelperText id={`outlined-helper-text-${field}`} margin="dense">
                  {symbol}
                </FormHelperText>
              ) : (
                <FormHelperText id={`outlined-helper-text-${field}`} margin="dense">
                  Select token
                </FormHelperText>
              )}
              <IconButton
                size="small"
                onClick={() => handleOpenDialog(field)}
              >
                <ArrowDropDownIcon />
              </IconButton>
            </Box>
          </InputAdornment>
        }
        label={label}
      />
    </FormControl>
  );
};

export default TokenInput;