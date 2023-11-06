import React, { useEffect, useState } from 'react';
import { useEthers } from '@usedapp/core';
import { gql, useQuery } from '@apollo/client';
import { Button, Box, Typography, Grid, Container, Divider, useTheme, useMediaQuery } from '@mui/material';
import TokenInput from './TokenInput';
import AddLiquidity from './AddLiquidity';
import RemoveLiquidity from './RemoveLiquidity'; // Make sure to import or create this component

const GET_LIQUIDITY_POSITIONS = gql`
  query MyQuery {
    pairs {
      liquidityPositions {
        user {
          id
          liquidityPositions {
            pair {
              id
              token0 {
                id
                symbol
                decimals
              }
              token1 {
                id
                symbol
                decimals
              }
            }
            liquidityTokenBalance
          }
        }
      }
    }
  }
`;

const Liquidity = () => {
    const [selectedPair, setSelectedPair] = useState(null);
    const { account } = useEthers();
    const [liquidityPositions, setLiquidityPositions] = useState([]);
    const [view, setView] = useState('VIEW');
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const { loading, error, data } = useQuery(GET_LIQUIDITY_POSITIONS, {
        skip: !account, // Skip the query if there's no account
    });

    const handleSelectPair = (pair) => {
        setSelectedPair(pair);
        setView('VIEW'); // Reset view to default when selecting another pair
    };

    useEffect(() => {
        if (data && data.pairs) {
            const uniquePairs = new Map(); // Use a map to track unique pairs by their ID

            data.pairs.forEach(pairGroup => {
                pairGroup.liquidityPositions.forEach(position => {
                    if (position.user && position.user.id.toLowerCase() === account.toLowerCase()) {
                        position.user.liquidityPositions.forEach(userPosition => {
                            const pairId = userPosition.pair.id;
                            // Only add the pair if it hasn't been added before
                            if (!uniquePairs.has(pairId)) {
                                uniquePairs.set(pairId, {
                                    id: pairId,
                                    symbolPair: `${userPosition.pair.token0.symbol}/${userPosition.pair.token1.symbol}`,
                                    token0: userPosition.pair.token0,
                                    token1: userPosition.pair.token1
                                });
                            }
                        });
                    }
                });
            });

            setLiquidityPositions(Array.from(uniquePairs.values()));
        }
    }, [data, account]);

    const selectedStyle = {
        bgcolor: theme.palette.action.selected,
        color: theme.palette.primary.contrastText,
    };

    let content;
    if (view === 'VIEW') {
        content = (
            <>
                <Typography variant={isSmallScreen ? "h5" : "h6"}>Your Liquidity Positions</Typography>
                {liquidityPositions.length === 0 && (
                    <Typography variant="body1">No liquidity positions found.</Typography>
                )}
                <Grid container spacing={3}>
                    {liquidityPositions.map((position) => (
                        <Grid item xs={12} sm={6} md={4} key={position.id}>
                            <Button
                                variant="outlined"
                                sx={{
                                    width: '100%',
                                    height: '100px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    ...(selectedPair && selectedPair.id === position.id ? selectedStyle : {}),
                                }}
                                onClick={() => handleSelectPair(position)}
                            >
                                {position.symbolPair}
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            </>
        );
    } else {
        // We do not render the addRemoveButtons when in ADD or REMOVE view
        content = view === 'ADD' ? <AddLiquidity initialPair={selectedPair} onClose={() => setView('VIEW')} /> : <RemoveLiquidity pair={selectedPair} onClose={() => setView('VIEW')} />;
    }

    const addRemoveButtons = view === 'VIEW' && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-around' }}>
            <Button
                variant="contained"
                onClick={() => setView('ADD')}
            >
                Add
            </Button>
            <Button
                variant="contained"
                onClick={() => setView('REMOVE')}
            >
                Remove
            </Button>
        </Box>
    );

    

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
            {addRemoveButtons}

        </Container>
    );
}

export default Liquidity;