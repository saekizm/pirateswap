import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, DialogActions, Button, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';

export const SettingModal = ({ isOpen, onClose, onSettingsChange }) => {
  const [gasSpeed, setGasSpeed] = useState('Standard');
  const [slippage, setSlippage] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleClose = () => {
    onSettingsChange({ gasSpeed, slippage, deadline });
    onClose();
    console.log("settings: " + gasSpeed, slippage, deadline)
  };


  const handleSlippageChange = (_, newSlippage) => {
    setSlippage(newSlippage);
  };




  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <div>
          <h5>Gas Speed</h5>
          <ToggleButtonGroup
            value={gasSpeed}
            exclusive
            onChange={(_, value) => setGasSpeed(value)}
            aria-label="gas speed"
          >
            {['Standard', 'Fast', 'Instant'].map(speed => (
              <ToggleButton key={speed} value={speed} sx={{ margin: '0 5px' }}>
                {speed}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
        <div>
          <h5>Slippage Tolerance</h5>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={slippage}
              exclusive
              onChange={handleSlippageChange}
              aria-label="slippage tolerance"
            >
              {['0.1', '0.5', '1.0'].map(value => (
                <ToggleButton key={value} value={value} sx={{ width: '50px' }}>
                  {`${value}%`}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <TextField
              size="small"
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              placeholder="Custom"
              sx={{ width: '100px' }}
            />
          </Box>
        </div>
        <div>
          <h5>Transaction Deadline</h5>
          <TextField
            type="number"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            placeholder="Enter deadline in minutes..."
            fullWidth
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
