import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';

export const SettingModal = ({ isOpen, onClose }) => {
  const [gasSpeed, setGasSpeed] = useState('Standard');
  const [slippage, setSlippage] = useState('');
  const [deadline, setDeadline] = useState('');

  return (
    <Dialog open={isOpen} onClose={onClose}>
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
          <TextField
            type="number"
            value={slippage}
            onChange={e => setSlippage(e.target.value)}
            placeholder="Enter slippage..."
            fullWidth
          />
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
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
