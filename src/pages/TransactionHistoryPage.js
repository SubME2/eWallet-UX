// src/pages/TransactionHistoryPage.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography, Container, Box, Alert, CircularProgress,
    List, ListItem, ListItemText, Divider, Paper, Grid, TextField, Button
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import ledgerService from '../services/ledgerService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook


const TransactionHistoryPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loadingAuth } = useAuth(); // Get auth states from context
    const currentUsername = "user?.username"; // Get the username of the logged-in user

    const [transactions, setTransactions] = useState([]); // Renamed from ledgerEntries to transactions
    const [error, setError] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(true); // Specific loading for history fetch
    const [startDate, setStartDate] = useState(null); // dayjs object or null
    const [endDate, setEndDate] = useState(dayjs()); // default to today

    // Fetch ledger entries based on date range
    const fetchTransactions =  useCallback(async () => {
        // Only attempt to fetch if authentication check is complete, user is authenticated,
        // and we have the current username.
        if (loadingAuth || !isAuthenticated || !currentUsername) {
            setLoadingHistory(false);
            return;
        }

        setLoadingHistory(true);
        setError('');
        try {
            let data;
            if (startDate && endDate) {
                const formattedStartDate = startDate.format('YYYY-MM-DD');
                const formattedEndDate = endDate.format('YYYY-MM-DD');
                // Assuming your ledgerService.getLedgerEntriesForCurrentUserByDateRange
                // now fetches a list of Transaction objects.
                data = await ledgerService.getLedgerEntriesForCurrentUserByDateRange(formattedStartDate, formattedEndDate);
            } else {
                // Assuming your ledgerService.getLedgerEntriesForCurrentUser
                // now fetches a list of Transaction objects.
                data = await ledgerService.getLedgerEntriesForCurrentUser();
            }
            setTransactions(data);
        } catch (err) {
            setError(err);
            setTransactions([]);
        } finally {
            setLoadingHistory(false);
        }
    }, [startDate, endDate, isAuthenticated, loadingAuth, currentUsername]); // Dependencies for useCallback




    // Trigger data fetch on component mount or when filters/auth status changes
    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Helper to format currency
    const formatCurrency = (amount) => {
        // Ensure amount is treated as a number and has 2 decimal places
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericAmount);
    };

    // Helper to get transaction details relative to the current user
    const getTransactionDetails = (transaction) => {
        const isSender = transaction.senderUsername === currentUsername;
        const isReceiver = transaction.receiverUsername === currentUsername;

        let displayType = transaction.type.replace('_', ' '); // Format the type string
        let relatedParty = 'N/A';
        let displayAmount = transaction.amount;
        let balanceBefore = transaction.preBalance;
        let balanceAfter = transaction.postBalance;
        let amountColor = 'black';

        // Logic to determine type and related party for the *current user*
        if (transaction.type === 'TRANSFER_SENT') {
            if (isSender) { // If current user sent it
                displayType = 'TRANSFER SENT';
                relatedParty = transaction.receiverUsername;
                amountColor = 'red';
                // Backend might send preBalance/postBalance relative to the transaction.
                // If these are YOUR balances, use them. If they are global, need adjustment.
                // Assuming for simplicity that preBalance/postBalance are the current user's balances.
            } else if (isReceiver) { // If current user received it (this should be TRANSFER_RECEIVED in a ledger, but handling raw transactions)
                displayType = 'TRANSFER RECEIVED';
                relatedParty = transaction.senderUsername;
                amountColor = 'green';
            }
        } else if (transaction.type === 'TRANSFER_RECEIVED') {
            if (isReceiver) { // If current user received it
                displayType = 'TRANSFER RECEIVED';
                relatedParty = transaction.senderUsername;
                amountColor = 'green';
            } else if (isSender) { // If current user sent it (this should be TRANSFER_SENT)
                displayType = 'TRANSFER SENT';
                relatedParty = transaction.receiverUsername;
                amountColor = 'red';
            }
        } else if (transaction.type === 'DEPOSIT') {
            // Deposits should only apply to the current user
            displayType = 'DEPOSIT';
            amountColor = 'green';
            // relatedParty remains N/A or perhaps 'Self'
        } else if (transaction.type === 'WITHDRAWAL') {
            // Withdrawals should only apply to the current user
            displayType = 'WITHDRAWAL';
            amountColor = 'red';
            // relatedParty remains N/A or perhaps 'Self'
        }

        return {
            displayType,
            displayAmount,
            balanceBefore,
            balanceAfter,
            relatedParty,
            amountColor
        };
    };

    // --- Conditional Rendering based on Authentication Status or Component Loading ---
    // If authentication status is still being determined (PrivateRoute should prevent this, but robust check)
    if (loadingAuth || !currentUsername) {
        return (
            <Container maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    // If not authenticated (should be redirected by PrivateRoute, but a fallback)
    if (!isAuthenticated) {
        navigate('/login', { replace: true });
        return null;
    }



    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Typography component="h1" variant="h4" gutterBottom>
                    Transaction History
                </Typography>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/dashboard')}
                    sx={{ mb: 2 }}
                >
                    Back to Dashboard
                </Button>
            </Box>

            {/* Date Range Filters */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                            maxDate={endDate || dayjs()}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                            minDate={startDate || null}
                            maxDate={dayjs()}
                        />
                    </Grid>
                </Grid>
            </LocalizationProvider>

            {/* Loading, Error, or Data Display */}
            {loadingHistory ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>
            ) : transactions.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2, width: '100%' }}>No transactions found for the selected period.</Alert>
            ) : (
                <Paper elevation={3} sx={{ p: 2 }}>
                    <List>
                        {transactions.map((transaction, index) => {
                            // Get details specific to the current user for this transaction
                            const details = getTransactionDetails(transaction);

                            return (
                                <React.Fragment key={transaction.id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography variant="body1" component="span" fontWeight="bold">
                                                        {details.displayType}
                                                    </Typography>
                                                    <Typography
                                                        variant="body1"
                                                        component="span"
                                                        sx={{ color: details.amountColor, fontWeight: 'bold' }}
                                                    >
                                                        {formatCurrency(details.displayAmount)}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <>
                                                    <Typography sx={{ display: 'block' }} component="span" variant="body2" color="text.secondary">
                                                        **Balance:** {formatCurrency(details.balanceBefore)} &rarr; {formatCurrency(details.balanceAfter)}
                                                    </Typography>
                                                    {details.relatedParty !== 'N/A' && (
                                                        <Typography sx={{ display: 'block' }} component="span" variant="body2" color="text.secondary">
                                                            **Related Party:** {details.relatedParty}
                                                        </Typography>
                                                    )}
                                                    <Typography sx={{ display: 'block' }} component="span" variant="body2" color="text.secondary">
                                                        **Date:** {dayjs(transaction.timestamp).format('MMM DD, YYYY hh:mm:ss A')}
                                                    </Typography>
                                                    <Typography sx={{ display: 'block' }} component="span" variant="body2" color="text.secondary">
                                                        **Transaction ID:** {transaction.id}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {index < transactions.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            );
                        })}
                    </List>
                </Paper>
            )}
        </Container>
    );
};

export default TransactionHistoryPage;