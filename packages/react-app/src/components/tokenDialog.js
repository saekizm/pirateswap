import React from 'react';
import { Dialog, List, ListItem, ListItemText, TextField } from '@mui/material';
import { MAINNET_ID, addresses } from '@uniswap-v2-app/contracts'; // Adjust the path

function TokenDialog({ open, onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredTokens = Object.keys(addresses[MAINNET_ID].tokens).filter((token) =>
    token.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <List>
        {filteredTokens.map((token) => (
          <ListItem button key={token} onClick={() => onSelect(token)}>
            <ListItemText primary={token} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}

export default TokenDialog;
