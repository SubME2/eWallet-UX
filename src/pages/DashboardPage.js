// src/pages/DashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography, Container, Box, Button, Grid, Paper, Alert, CircularProgress, AppBar, Toolbar
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import HistoryIcon from '@mui/icons-material/History';

import walletService from '../services/walletService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

const DashboardPage = () => {
    const navigate = useNavigate();
    const { logout, isAuthenticated, loadingAuth } = useAuth(); // Get logout function, isAuthenticated, loadingAuth from useAuth

    const [balance, setBalance] = useState(null);
    const [loadingBalance, setLoadingBalance] = useState(true); // Renamed to avoid confusion with loadingAuth
    const [error, setError] = useState('');

    // Function to fetch the user's balance
    const fetchBalance = useCallback(async () => {
        setLoadingBalance(true);
        setError('');
        try {
            const currentBalance = await walletService.getBalance();
            setBalance(currentBalance);
        } catch (err) {
            setError(err); // Set error message from API
        } finally {
            setLoadingBalance(false);
        }
    }, []); // No dependencies, as balance is fetched for the current authenticated user

    // Fetch balance on component mount IF authenticated and auth status is no longer loading
    useEffect(() => {
        // Only attempt to fetch balance if authentication check is complete AND user is authenticated
        if (!loadingAuth && isAuthenticated) {
            fetchBalance();
        }
        // No need for a redirect here, as PrivateRoute already handles unauthenticated access
    }, [fetchBalance, isAuthenticated, loadingAuth]);


    // Helper to format currency
    const formatCurrency = (amount) => {
        if (amount === null || typeof amount === 'undefined') return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const handleLogout = () => {
        logout(); // Call the logout function from AuthContext
        navigate('/login', { replace: true }); // Redirect to login page and replace history entry
    };

    // --- Conditional Rendering based on Authentication Status from AuthContext ---
    // If authentication status is still being determined by AuthContext, show a full-page loader.
    // This is a redundant check if PrivateRoute is correctly implemented, but adds robustness.
    if (loadingAuth) {
        return (
            <Container maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    // If the user is NOT authenticated (and loadingAuth is false), they should be redirected
    // by the PrivateRoute component that wraps the DashboardPage. This block acts as a final safeguard.
    if (!isAuthenticated) {
        navigate('/login', { replace: true }); // Redirect to login, replacing current history entry
        return null; // Don't render anything from this component
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" color="primary">
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" component="div">
                        E-Wallet Dashboard
                    </Typography>
                    <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                    <Typography component="h2" variant="h5" gutterBottom>
                        Your Current Balance
                    </Typography>
                    <Paper elevation={6} sx={{ p: 4, borderRadius: 2, bgcolor: 'primary.light', color: 'white', minWidth: 250, textAlign: 'center' }}>
                        {loadingBalance ? ( // Use loadingBalance for just the balance fetch status
                            <CircularProgress color="inherit" />
                        ) : error ? (
                            <Typography variant="h6">{error}</Typography>
                        ) : (
                            <>
                                <AccountBalanceWalletIcon sx={{ fontSize: 40, mb: 1 }} />
                                <Typography variant="h4" component="p" sx={{ fontWeight: 'bold' }}>
                                    {formatCurrency(balance)}
                                </Typography>
                            </>
                        )}
                    </Paper>
                </Box>

                <Typography component="h3" variant="h6" align="center" sx={{ mb: 3 }}>
                    Quick Actions
                </Typography>
                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ p: 2 }}
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={() => navigate('/deposit')}
                        >
                            Deposit
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ p: 2 }}
                            startIcon={<RemoveCircleOutlineIcon />}
                            onClick={() => navigate('/withdraw')}
                        >
                            Withdraw
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ p: 2 }}
                            startIcon={<SwapHorizIcon />}
                            onClick={() => navigate('/transfer')}
                        >
                            Transfer
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Button
                            variant="outlined"
                            fullWidth
                            sx={{ p: 2 }}
                            startIcon={<HistoryIcon />}
                            onClick={() => navigate('/history')}
                        >
                            Transaction History
                        </Button>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default DashboardPage;