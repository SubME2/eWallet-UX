// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Container, Box, Alert, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
// Removed direct import of authService, now handled via useAuth
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

const schema = yup.object().shape({
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
});

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, loadingAuth } = useAuth(); // Get login function, isAuthenticated, loadingAuth from useAuth
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // New state for form submission loading

    // Effect to redirect if already authenticated
    useEffect(() => {
        if (!loadingAuth && isAuthenticated) {
            navigate('/dashboard', { replace: true }); // Use replace to prevent going back to login
        }
    }, [isAuthenticated, loadingAuth, navigate]);

    const onSubmit = async (data) => {
        setError('');
        setIsSubmitting(true); // Start submission loading
        try {
            await login(data.username, data.password);
            // The useEffect above will handle redirection upon successful login (isAuthenticated change)
        } catch (err) {
            setError(err); // Display error message from the backend or default
        } finally {
            setIsSubmitting(false); // Stop submission loading
        }
    };

    // If authentication status is still being determined, show a full-page loader
    if (loadingAuth) {
        return (
            <Container maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    // If already authenticated, this component should not render beyond the useEffect redirect.
    // However, as a fallback, if for some reason it renders while authenticated:
    if (isAuthenticated) {
        return null; // Or show a brief message before redirection
    }

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Login to E-Wallet
                </Typography>
                {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        {...register('username')}
                        error={!!errors.username}
                        helperText={errors.username?.message}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        {...register('password')}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={isSubmitting} // Disable button while submitting
                    >
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate('/register')}
                        disabled={isSubmitting}
                    >
                        Register
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default LoginPage;