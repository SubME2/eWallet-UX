// src/pages/DepositPage.js
import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Alert, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import walletService from '../services/walletService';
import { useNavigate } from 'react-router-dom';

// Define the validation schema for the deposit form
const schema = yup.object().shape({
    amount: yup.number()
        .typeError('Amount must be a number') // Custom error for non-numeric input
        .required('Deposit amount is required')
        .positive('Deposit amount must be positive')
        .min(0.01, 'Minimum deposit is 0.01'),
});

const DepositPage = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false); // Loading state for the deposit transaction

    const onSubmit = async (data) => {
        setError('');
        setSuccess('');
        setLoading(true); // Start loading spinner for the transaction
        try {
            // Call the deposit service from walletService
            const response = await walletService.deposit(data.amount);
            // Assuming response.balance is returned from the backend
            setSuccess(`Successfully deposited ${data.amount.toFixed(2)}. New balance: ${response.balance.toFixed(2)}`);
            // Optionally, you might want to reset the form after success
            // reset();
        } catch (err) {
            // Display error message from the backend or a default one
            setError(err);
        } finally {
            setLoading(false); // Stop loading spinner
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Deposit Funds
                </Typography>

                {/* Display success or error messages */}
                {success && <Alert severity="success" sx={{ mt: 2, width: '100%' }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
                    {/* Amount Input */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="amount"
                        label="Amount to Deposit"
                        name="amount"
                        type="number" // Set type to number for numeric keyboard on mobile
                        slotProps={{htmlInput: {step: "0.01"}}}
                        //inputProps={{ step: "0.01" }} // Allow decimal values for currency input
                        autoFocus
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
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Deposit'}
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

export default DepositPage;