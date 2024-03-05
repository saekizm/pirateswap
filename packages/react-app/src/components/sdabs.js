import React from 'react';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import useCountdown from '../hooks/useCountdown';

const Sdabs = () => {
    const [nft_days, nft_hours, nft_minutes, nft_seconds] = useCountdown('2024-02-28T20:00:00Z');
    const [private_days, private_hours, private_minutes, private_seconds] = useCountdown('2024-02-29T20:00:00Z');
    const [public_days, public_hours, public_minutes, public_seconds] = useCountdown('2024-03-01T20:00:00Z');
    const [days, hours, minutes, seconds] = useCountdown('2024-03-03T20:00:00Z');

    // Common Box styling for sections
    const sectionStyle = {
        my: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
    };

    return (
        <Container maxWidth="md" sx={{
            position: "relative", // Changed from absolute for better responsiveness
            mt: 4, // Adjusted top margin
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', // Centers the content
            gap: 2, // Adds space between child components
        }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'white', textDecoration: "overline underline", textShadow : "2px  2px 4px #000000" }}>
                SDABS Token Launch
            </Typography>
            <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
                <Typography variant="h4" sx={{ fontWeight: 'medium', mb: 2, textAlign: 'center' }}>
                    {`Launch in: ${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`}
                </Typography>
                <Box sx={{ ...sectionStyle }}>
                    <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        NFT Holder Presale
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 1, textAlign: 'center' }}>
                        Starts in: {`${nft_days} days ${nft_hours} hours ${nft_minutes} minutes ${nft_seconds} seconds`}
                    </Typography>
                    <Typography variant="body1">
                        Exclusive early access for our NFT holders to participate in the SDABS token presale. 
                        To be eligible, you must hold an NFT by 27th of February latest. Buy <a href='https://app.ebisusbay.com/collection/pirates-of-the-cronosphere'>here.</a>
                    </Typography>
                </Box>
                <Box sx={{ ...sectionStyle }}>
                    <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        Private Sale
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 1, textAlign: 'center' }}>
                        Starts in: {`${private_days} days ${private_hours} hours ${private_minutes} minutes ${private_seconds} seconds`}
                    </Typography>
                    <Typography variant="body1">
                        An invitation-only sale for selected early backers and community leaders.
                    </Typography>
                </Box>
                <Box sx={{ ...sectionStyle }}>
                    <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                        Public Sale
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 1, textAlign: 'center' }}>
                        Starts in: {`${public_days} days ${public_hours} hours ${public_minutes} minutes ${public_seconds} seconds`}
                    </Typography>
                    <Typography variant="body1">
                        Open to the public, this is the final phase before our official launch.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}

export default Sdabs;
