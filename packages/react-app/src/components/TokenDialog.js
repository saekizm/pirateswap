import React from 'react';
import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, TextField, Box } from '@mui/material';
import { TOKENS } from '../tokens';  // Import TOKENS from tokens.js

function TokenDialog({ open, onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = React.useState('');

  // Adjust the filteredTokens logic to use TOKENS
  const filteredTokens = TOKENS.filter((token) =>
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select a token</DialogTitle>
      <Box p={2}>
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>
      <DialogContent dividers>
        <List>
          {filteredTokens.map((token) => (
            <ListItem button key={token.symbol} onClick={() => onSelect(token)}>
              <ListItemText primary={token.symbol} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}

export default TokenDialog;
