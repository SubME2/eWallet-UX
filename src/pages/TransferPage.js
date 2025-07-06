// src/pages/TransferPage.js
import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Alert, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import walletService from '../services/walletService';
import { useNavigate } from 'react-router-dom';

// Define the validation schema for the transfer form
const schema = yup.object().shape({
    receiverUsername: yup.string()
        .required('Recipient username is required')
        .min(3, 'Username must be at least 3 characters'),
    amount: yup.number()
        .typeError('Amount must be a number') // Custom error for non-numeric input
        .required('Transfer amount is required')
        .positive('Transfer amount must be positive')
        .min(0.01, 'Minimum transfer is 0.01'),
});

const TransferPage = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false); // Loading state for the transfer transaction

    const onSubmit = async (data) => {
        setError('');
        setSuccess('');
        setLoading(true); // Start loading spinner for the transaction
        try {
            // Call the transfer service from walletService
            await walletService.transfer(data.receiverUsername, data.amount);
            setSuccess(`Successfully transferred ${data.amount.toFixed(2)} to ${data.receiverUsername}.`);
            // Optionally, you might want to reset the form after success
            // reset();
        } catch (err) {
            // Display error message from the backend (e.g., "User not found", "Insufficient funds") or a default one
            setError(err);
        } finally {
            setLoading(false); // Stop loading spinner
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Transfer Funds
                </Typography>

                {/* Display success or error messages */}
                {success && <Alert severity="success" sx={{ mt: 2, width: '100%' }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
                    {/* Recipient Username Input */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="receiverUsername"
                        label="Recipient Username"
                        name="receiverUsername"
                        autoComplete="username" // Can suggest previous usernames
                        autoFocus
                        {...register('receiverUsername')}
                        error={!!errors.receiverUsername}
                        helperText={errors.receiverUsername?.message}
                    />

                    {/* Amount Input */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="amount"
                        label="Amount to Transfer"
                        name="amount"
                        type="number" // Set type to number for numeric keyboard on mobile
                        slotProps={{htmlInput: {step: "0.01"}}}
                        //inputProps={{ step: "0.01" }} // Allow decimal values for currency input
                        {...register('amount')}
                        error={!!errors.amount}
                        helperText={errors.amount?.message}
                    />

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading} // Disable button while the transaction is loading
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Transfer'}
                    </Button>

                    {/* Back to Dashboard Button */}
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate('/dashboard')}
                        disabled={loading} // Optionally disable during transaction to prevent early navigation
                    >
                        Back to Dashboard
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default TransferPage;