// src/pages/RegisterPage.js
import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Container, Box, Alert, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

// Define the validation schema using Yup
const schema = yup.object().shape({
    username: yup.string()
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must not exceed 20 characters'),
    password: yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters')
        .max(40, 'Password must not exceed 40 characters'),
    confirmPassword: yup.string()
        .required('Confirm Password is required')
        .oneOf([yup.ref('password'), null], 'Passwords must match') // Ensures passwords match
});

const RegisterPage = () => {
    const navigate = useNavigate();
    // Get the 'register' function from useAuth, aliasing it to 'authRegister'
    // to avoid naming conflict with react-hook-form's 'register' function.
    const { register: authRegister, isAuthenticated, loadingAuth } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // State for tracking form submission loading

    // Effect to redirect if the user is already authenticated and auth status is confirmed
    useEffect(() => {
        if (!loadingAuth && isAuthenticated) {
            navigate('/dashboard', { replace: true }); // Redirect to dashboard, replacing the history entry
        }
    }, [isAuthenticated, loadingAuth, navigate]);

    const onSubmit = async (data) => {
        setError('');
        setSuccess('');
        setIsSubmitting(true); // Start submission loading
        try {
            await authRegister(data.username, data.password); // Call the authentication context's register function
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login'); // Redirect to login page after a short delay
            }, 2000);
        } catch (err) {
            setError(err); // Display any error message from the backend or a default message
        } finally {
            setIsSubmitting(false); // Stop submission loading
        }
    };

    // --- Conditional Rendering based on Authentication Status ---
    // If authentication status is still being determined, show a full-page loader
    if (loadingAuth) {
        return (
            <Container maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    // If already authenticated (and loading is done), this component should not render.
    // The useEffect above will handle the redirection.
    if (isAuthenticated) {
        return null;
    }

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Create New E-Wallet Account
                </Typography>

                {/* Display success or error messages */}
                {success && <Alert severity="success" sx={{ mt: 2, width: '100%' }}>{success}</Alert>}
                {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
                    {/* Username Input */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        {...register('username')} // Connects input to React Hook Form
                        error={!!errors.username} // Show error state if there's a validation error
                        helperText={errors.username?.message} // Display validation error message
                    />

                    {/* Password Input */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        {...register('password')}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />

                    {/* Confirm Password Input */}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        autoComplete="new-password"
                        {...register('confirmPassword')}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                    />

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={isSubmitting} // Disable button while submitting
                    >
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                    </Button>

                    {/* Link to Login Page */}
                    <Button
                        fullWidth
                        variant="text"
                        onClick={() => navigate('/login')}
                        disabled={isSubmitting} // Also disable this button during submission
                    >
                        Already have an account? Login
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default RegisterPage;