import React, { useEffect, useState } from 'react';
import { useEthers } from '@usedapp/core';
import { Button, Typography, Grid, Container, Divider, useTheme, useMediaQuery } from '@mui/material';
import TokenInput from './TokenInput';
import AddLiquidity from './AddLiquidity';
import RemoveLiquidity from './RemoveLiquidity'; // Make sure to import or create this component

const Liquidity = () => {
    const { account } = useEthers();
    const [liquidityPositions, setLiquidityPositions] = useState([]);
    const [view, setView] = useState('VIEW'); // Can be 'VIEW', 'ADD', or 'REMOVE'
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchLiquidityPositions = async () => {
            // Fetch the user's liquidity positions
            setLiquidityPositions([]); // Placeholder for now
        };

        if (account) {
            fetchLiquidityPositions();
        }
    }, [account]);
    
    let content;
    if (view === 'VIEW') {
        content = (
            <>
                <Typography variant={isSmallScreen ? "h5" : "h6"}>Your Liquidity Positions</Typography>
                {liquidityPositions.length === 0 && (
                    <Typography variant="body1">No liquidity positions found.</Typography>
                )}
                {liquidityPositions.map((position, index) => (
                    <React.Fragment key={position.id}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TokenInput
                                    amount={position.amountA}
                                    label={`Token ${position.tokenA}`}
                                    field={position.tokenA}
                                    handleOpenDialog={() => { }}
                                    symbol={position.tokenA}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TokenInput
                                    amount={position.amountB}
                                    label={`Token ${position.tokenB}`}
                                    field={position.tokenB}
                                    handleOpenDialog={() => { }}
                                    symbol={position.tokenB}
                                />
                            </Grid>
                        </Grid>
                        {index !== liquidityPositions.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        {liquidityPositions.length > 0 && (
                            <Button variant="outlined" fullWidth color="primary" onClick={() => setView('REMOVE')}>
                                Remove Liquidity
                            </Button>
                        )}
                        <Button variant="outlined" fullWidth color="primary" onClick={() => setView('ADD')}>
                            Add Liquidity
                        </Button>
                    </Grid>
                </Grid>
            </>
        );
    } else if (view === 'ADD') {
        content = <AddLiquidity onClose={() => setView('VIEW')} />;
    } else if (view === 'REMOVE') {
        content = <RemoveLiquidity onClose={() => setView('VIEW')} />;
    }

    return (
        <Container
      maxWidth="sm"
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        mt: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
            {content}
        </Container>
    );
}

export default Liquidity;