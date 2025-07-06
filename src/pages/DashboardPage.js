// src/pages/DashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography, Container, Box, Button, TextField, Paper, Grid,
    CircularProgress, Alert, AppBar, Toolbar, IconButton,
    List, ListItem, ListItemText, Divider, Chip
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import RefreshIcon from '@mui/icons-material/Refresh';

import walletService from '../services/walletService';
import ledgerService from '../services/ledgerService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { logout, isAuthenticated, loadingAuth, user } = useAuth();
    const currentUsername = user?.username;

    const [balance, setBalance] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState('');
    const [message, setMessage] = useState('');
    const [selectedAction, setSelectedAction] = useState('transfer');
    const [loadingContent, setLoadingContent] = useState(true);

    const formatCurrency = (value) => {
        if (value === null || typeof value === 'undefined') return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    };

    const fetchDashboardData = useCallback(async () => {
        if (!isAuthenticated || loadingAuth) {
            setLoadingContent(false);
            return;
        }

        setLoadingContent(true);
        setMessage('');
        try {
            const currentBalance = await walletService.getBalance();
            setBalance(currentBalance);

            const allTransactions = await ledgerService.getLedgerEntriesForCurrentUser();
            setTransactions(allTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setMessage(`Failed to load data: ${err.message || 'Network Error'}`);
        } finally {
            setLoadingContent(false);
        }
    }, [isAuthenticated, loadingAuth]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Async function for processing transactions (remains unchanged)
    const processTransaction = async (actionType, transactionAmount, recipientUsername) => {
        if (actionType === 'transfer' && !recipientUsername.trim()) {
            return { success: false, message: 'Recipient is required for transfer.' };
        }

        let response;
        try {
            switch (actionType) {
                case 'deposit':
                    response = await walletService.deposit(transactionAmount);
                    break;
                case 'withdraw':
                    response = await walletService.withdraw(transactionAmount);
                    break;
                case 'transfer':
                    response = await walletService.transfer(recipientUsername.trim(), transactionAmount);
                    break;
                default:
                    response = { success: false, message: 'Invalid action selected.' };
                    break;
            }
        } catch (error) {
            console.error("Error in processTransaction:", error);
            response = { success: false, message: error.response?.data?.message || error.message || 'Server error during transaction.' };
        }
        return response;
    };

    const handleTransaction = async (e) => {
        e.preventDefault();
        const transactionAmount = parseFloat(amount);

        if (isNaN(transactionAmount) || transactionAmount <= 0) {
            setMessage('Please enter a valid amount.');
            return;
        }

        setLoadingContent(true);
        setMessage('');

        try {
            const response = await processTransaction(selectedAction, transactionAmount, recipient);

            if (response && response.success) {
                setMessage(`${selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)} successful!`);
                setAmount('');
                setRecipient('');
                await fetchDashboardData();
            } else {
                setMessage(`Transaction failed: ${response?.message || 'Unknown error.'}`);
            }
        } catch (error) {
            console.error("Unexpected error in handleTransaction:", error);
            setMessage(`An unexpected error occurred: ${error.message || 'Please try again.'}`);
        } finally {
            setLoadingContent(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    if (loadingAuth) {
        return (
            <Container maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!isAuthenticated) {
        navigate('/login', { replace: true });
        return null;
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#f0f2f5',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 2, sm: 3, md: 4 },
            }}
        >
            <AppBar position="static" sx={{ bgcolor: 'primary.main', mb: { xs: 2, sm: 4 }, width: '100%' }}>
                <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 'md', width: '100%', mx: 'auto' }}>
                    <Typography variant="h6" component="div" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        E-Wallet App
                    </Typography>
                    <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 0, mb: 0, p: 0 }}>
                <Paper
                    elevation={6}
                    sx={{
                        p: { xs: 3, sm: 4, lg: 5 },
                        borderRadius: 3,
                        width: '100%',
                        // Reverted layout: Two main columns for large screens, stacking for small
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                        gap: { xs: 3, md: 5 },
                        bgcolor: 'white',
                        boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    {/* Left Column Content (Dashboard Info, Balance, Recent Transactions) */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>
                        <Typography variant="h4" component="h1" color="primary.dark" sx={{ fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2.5rem' } }}>
                            eWallet Dashboard
                        </Typography>

                        {currentUsername && (
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Logged in as:</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: { xs: '0.7rem', sm: '0.8rem' }, wordBreak: 'break-all', ml: 1 }}>{currentUsername}</Typography>
                            </Paper>
                        )}

                        {/* Balance Card */}
                        <Paper
                            elevation={8}
                            sx={{
                                p: { xs: 3, sm: 4 },
                                borderRadius: 2,
                                background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                                color: 'white',
                                textAlign: 'center',
                                position: 'relative',
                                boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.2)',
                                minHeight: { xs: 150, sm: 180 }
                            }}
                        >
                            <IconButton
                                onClick={fetchDashboardData}
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    color: 'rgba(255,255,255,0.7)',
                                    '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                                aria-label="refresh balance"
                                disabled={loadingContent}
                            >
                                <RefreshIcon />
                            </IconButton>
                            <Typography variant="body1" sx={{ opacity: 0.9, fontSize: { xs: '0.85rem', sm: '1rem' } }}>Current Balance</Typography>
                            {loadingContent ? (
                                <CircularProgress color="inherit" size={30} sx={{ mt: 2 }} />
                            ) : (
                                <Typography variant="h3" component="p" sx={{ fontWeight: 'bold', mt: 1, fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' } }}>
                                    {formatCurrency(balance)}
                                </Typography>
                            )}
                            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                                Last updated: {balance !== null ? new Date().toLocaleDateString() : 'N/A'}
                            </Typography>
                        </Paper>

                        {/* Recent Transactions */}
                        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
                            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 'medium', mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Recent Transactions</Typography>
                            {loadingContent ? (
                                <Box sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                                    <CircularProgress size={20} />
                                    <Typography sx={{ mt: 1 }}>Loading transactions...</Typography>
                                </Box>
                            ) : transactions.length === 0 ? (
                                <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>No transactions yet.</Typography>
                            ) : (
                                <List sx={{ p: 0 }}>
                                    {transactions.slice(0, 5).map((tx, index) => (
                                        <React.Fragment key={tx.id}>
                                            <ListItem sx={{ py: 1.5, px: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                                                        {tx.type === 'TRANSFER_SENT'
                                                            ? `Sent to ${tx.receiverUsername || 'N/A'}`
                                                            : tx.type === 'TRANSFER_RECEIVED'
                                                                ? `Received from ${tx.senderUsername || 'N/A'}`
                                                                : tx.type.replace('_', ' ')
                                                        }
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                                                        {new Date(tx.timestamp).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        fontWeight: 'semibold',
                                                        color: tx.type === 'TRANSFER_SENT' || tx.type === 'WITHDRAWAL' ? 'error.main' : 'success.main',
                                                        fontSize: { xs: '0.9rem', sm: '1.1rem' }
                                                    }}
                                                >
                                                    {tx.type === 'TRANSFER_SENT' || tx.type === 'WITHDRAWAL' ? '-' : '+'}{formatCurrency(tx.amount)}
                                                </Typography>
                                            </ListItem>
                                            {index < transactions.slice(0, 5).length - 1 && <Divider component="li" sx={{ my: 0.5 }} />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                            <Button
                                onClick={() => navigate('/history')}
                                variant="text"
                                fullWidth
                                sx={{ mt: 3, bgcolor: 'primary.light', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' } }}
                            >
                                View All Transactions
                            </Button>
                        </Paper>
                    </Box>

                    {/* Right Column Content (Perform Transaction, More Features Placeholder) */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>
                        <Typography variant="h4" component="h3" color="primary.dark" sx={{ fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2.5rem' } }}>
                            Perform Transaction
                        </Typography>

                        {message && (
                            <Alert severity={message.includes('success') ? 'success' : 'info'} sx={{ borderRadius: 1 }}>
                                {message}
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 1, sm: 2 } }}>
                            <Button
                                variant={selectedAction === 'deposit' ? 'contained' : 'outlined'}
                                onClick={() => setSelectedAction('deposit')}
                                sx={{ flexGrow: 1, py: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.75rem', sm: '0.9rem' } }}
                            >
                                <AddCircleOutlineIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }} /> Deposit
                            </Button>
                            <Button
                                variant={selectedAction === 'withdraw' ? 'contained' : 'outlined'}
                                onClick={() => setSelectedAction('withdraw')}
                                sx={{ flexGrow: 1, py: { xs: 1, sm: 1.5 }, fontSize: { xs: '1rem', sm: '1.25rem' } }}
                            >
                                <RemoveCircleOutlineIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }} /> Withdraw
                            </Button>
                            <Button
                                variant={selectedAction === 'transfer' ? 'contained' : 'outlined'}
                                onClick={() => setSelectedAction('transfer')}
                                sx={{ flexGrow: 1, py: { xs: 1, sm: 1.5 }, fontSize: { xs: '1rem', sm: '1.25rem' } }}
                            >
                                <SwapHorizIcon sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }} /> Transfer
                            </Button>
                        </Box>

                        <Paper component="form" onSubmit={handleTransaction} elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Amount"
                                type="number"
                                fullWidth
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                inputProps={{ step: "0.01", min: "0.01" }}
                                required
                                variant="outlined"
                                size="small"
                            />
                            {selectedAction === 'transfer' && (
                                <TextField
                                    label="Recipient Username"
                                    type="text"
                                    fullWidth
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    required
                                    variant="outlined"
                                    size="small"
                                />
                            )}
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
                                sx={{ py: { xs: 1.5, sm: 2 }, fontSize: { xs: '1rem', sm: '1.15rem' }, fontWeight: 'bold' }}
                                disabled={loadingContent}
                            >
                                {loadingContent ? <CircularProgress size={24} color="inherit" /> : selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)}
                            </Button>
                        </Paper>

                        <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, textAlign: 'center', color: 'text.secondary' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>More Features Coming Soon!</Typography>
                            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>Such as transaction details, profile settings, and more.</Typography>
                        </Paper>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default DashboardPage;