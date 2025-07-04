// src/pages/TransactionHistoryPage.js
import React, { useState, useEffect, useCallback } from 'react';
import {
    Typography, Container, Box, Alert, CircularProgress,
    List, ListItem, ListItemText, Divider, Paper, Grid, TextField, Button
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs'; // Ensure dayjs is installed: npm install dayjs
import ledgerService from '../services/ledgerService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

const TransactionHistoryPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loadingAuth } = useAuth(); // Get auth states from context

    const [ledgerEntries, setLedgerEntries] = useState([]);
    const [error, setError] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(true); // Specific loading for history fetch
    const [startDate, setStartDate] = useState(null); // dayjs object or null
    const [endDate, setEndDate] = useState(dayjs()); // default to today

    // Fetch ledger entries based on date range
    const fetchLedgerEntries = useCallback(async () => {
        // Only attempt to fetch if authentication is confirmed
        if (!isAuthenticated || loadingAuth) {
            setLoadingHistory(false); // Ensure loading is off if not authenticated/still loading auth
            return;
        }

        setLoadingHistory(true);
        setError('');
        try {
            let data;
            if (startDate && endDate) {
                // Format dates to YYYY-MM-DD for the backend API
                const formattedStartDate = startDate.format('YYYY-MM-DD');
                const formattedEndDate = endDate.format('YYYY-MM-DD');
                data = await ledgerService.getLedgerEntriesForCurrentUserByDateRange(formattedStartDate, formattedEndDate);
            } else {
                data = await ledgerService.getLedgerEntriesForCurrentUser();
            }
            setLedgerEntries(data);
        } catch (err) {
            setError(err); // Display error message from the backend or default
            setLedgerEntries([]); // Clear previous entries on error
        } finally {
            setLoadingHistory(false);
        }
    }, [startDate, endDate, isAuthenticated, loadingAuth]); // Dependencies for useCallback

    // Trigger data fetch on component mount or when filters/auth status changes
    useEffect(() => {
        fetchLedgerEntries();
    }, [fetchLedgerEntries]); // Re-fetch when fetchLedgerEntries changes (due to its dependencies)

    // Helper to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    // Helper to get color for amount (green for deposit/received, red for withdrawal/sent)
    const getAmountColor = (type, amount) => {
        if (type === 'DEPOSIT' || type === 'TRANSFER_RECEIVED') {
            return 'green';
        } else if (type === 'WITHDRAWAL' || type === 'TRANSFER_SENT') {
            return 'red';
        }
        return 'black'; // Default or other types
    };

    // --- Conditional Rendering based on Authentication Status or Component Loading ---
    // If authentication status is still being determined (should be handled by PrivateRoute, but good for robustness)
    if (loadingAuth) {
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
                            maxDate={endDate || dayjs()} // Start date cannot be after end date or today
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                            minDate={startDate || null} // End date cannot be before start date
                            maxDate={dayjs()} // End date cannot be in the future
                        />
                    </Grid>
                </Grid>
            </LocalizationProvider>

            {/* Loading, Error, or Data Display */}
            {loadingHistory ? ( // Use loadingHistory for this component's data fetch
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>
            ) : ledgerEntries.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2, width: '100%' }}>No transactions found for the selected period.</Alert>
            ) : (
                <Paper elevation={3} sx={{ p: 2 }}>
                    <List>
                        {ledgerEntries.map((entry, index) => (
                            <React.Fragment key={entry.id}>
                                <ListItem alignItems="flex-start">
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body1" component="span" fontWeight="bold">
                                                    {entry.transactionType.replace('_', ' ')} {/* Format type string */}
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    component="span"
                                                    sx={{ color: getAmountColor(entry.transactionType, entry.amount), fontWeight: 'bold' }}
                                                >
                                                    {formatCurrency(entry.amount)}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <>
                                                <Typography sx={{ display: 'block' }} component="span" variant="body2" color="text.secondary">
                                                    **Wallet Balance:** {formatCurrency(entry.preTransactionBalance)} &rarr; {formatCurrency(entry.postTransactionBalance)}
                                                </Typography>
                                                <Typography sx={{ display: 'block' }} component="span" variant="body2" color="text.secondary">
                                                    **Related Party:** {entry.relatedPartyUsername || 'N/A'}
                                                </Typography>
                                                <Typography sx={{ display: 'block' }} component="span" variant="body2" color="text.secondary">
                                                    **Date:** {dayjs(entry.entryTimestamp).format('MMM DD, YYYY hh:mm:ss A')}
                                                </Typography>
                                                <Typography sx={{ display: 'block' }} component="span" variant="body2" color="text.secondary">
                                                    **Transaction ID:** {entry.transaction?.id || 'N/A'}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                                {index < ledgerEntries.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}
        </Container>
    );
};

export default TransactionHistoryPage;