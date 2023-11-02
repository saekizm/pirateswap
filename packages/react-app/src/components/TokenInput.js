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
              {tokenContract ? symbol : 'Select token'}
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
