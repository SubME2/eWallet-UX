// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService'; // Your service for API calls (e.g., login, register)

// 1. Create the Auth Context
const AuthContext = createContext(null);

// 2. AuthProvider Component
// This component will wrap your entire application (or parts of it)
// and provide the authentication state and functions to its children.
export const AuthProvider = ({ children }) => {
    // State to hold authentication status: true if a valid token exists
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // State to hold user information (e.g., username).
    // In a real app, this might be populated by decoding the JWT or fetching user profile.
    const [user, setUser] = useState(null);

    // State to indicate if the initial authentication check is still in progress.
    // This is crucial to prevent rendering protected routes before knowing auth status.
    const [loadingAuth, setLoadingAuth] = useState(true);

    // Function to perform an initial check of the authentication status.
    // It looks for a JWT token in localStorage.
    const checkAuthStatus = useCallback(() => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            // In a production app, you might also:
            // 1. Decode the JWT to check its expiry (e.g., using jwt-decode library).
            // 2. Potentially make a lightweight API call to the backend to validate the token's active status.
            // For this E-Wallet example, the mere presence of a token indicates authentication.
            setIsAuthenticated(true);
            // Optional: Extract username from token if needed immediately
            // try {
            //   const decodedToken = JSON.parse(atob(token.split('.')[1]));
            //   setUser({ username: decodedToken.sub }); // 'sub' is a standard JWT claim for subject/username
            // } catch (e) {
            //   console.error("Failed to decode token:", e);
            //   // If decoding fails, perhaps the token is malformed, so treat as unauthenticated
            //   setIsAuthenticated(false);
            //   localStorage.removeItem('jwt_token');
            // }
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
        setLoadingAuth(false); // Authentication check is now complete
    }, []);

    // Run `checkAuthStatus` once when the `AuthProvider` component mounts.
    // This ensures that the application immediately tries to determine the user's logged-in status.
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]); // `checkAuthStatus` is stable due to `useCallback`, so this runs once.

    // Function to handle user login.
    const login = async (username, password) => {
        setLoadingAuth(true); // Indicate that an authentication operation is in progress
        try {
            const response = await authService.login(username, password);
            // Assuming your backend's login endpoint returns a JWT token (e.g., in `response.jwtToken`)
            if (response && response.jwtToken) {
                localStorage.setItem('jwt_token', response.jwtToken);
                setIsAuthenticated(true);
                // If your backend returns user details along with the token, set them here
                // setUser(response.user || { username: username });
                return response; // Return the full response for the calling component if needed
            } else {
                throw new Error("Login successful but no token received."); // Custom error if token is missing
            }
        } catch (error) {
            // On failed login, ensure no token is stored and authentication state is false
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('jwt_token');
            // Re-throw the error so the component calling login can handle and display it
            throw error.response?.data?.message || 'Login failed. Please check your credentials.';
        } finally {
            setLoadingAuth(false); // Authentication operation is complete
        }
    };

    // Function to handle user logout.
    const logout = () => {
        localStorage.removeItem('jwt_token'); // Remove the JWT token from client-side storage
        setIsAuthenticated(false); // Update authentication state
        setUser(null); // Clear user information
        // For JWTs, client-side removal is typically sufficient.
        // If you had stateful tokens or server-side session management, you might make an API call here to invalidate the token.
    };

    // Function to handle user registration.
    const register = async (username, password) => {
        setLoadingAuth(true); // Indicate that an authentication operation (registration) is in progress
        try {
            const response = await authService.register(username, password);
            // After successful registration, you might automatically log them in,
            // or simply return success and let them navigate to the login page.
            // For this flow, we're returning success and navigating to login page.
            return response;
        } catch (error) {
            // Re-throw the error for the calling component (RegisterPage) to handle and display
            throw error.response?.data?.message || 'Registration failed. Please try again.';
        } finally {
            setLoadingAuth(false); // Authentication operation is complete
        }
    };

    // The value provided to consumers of this context.
    // Any component that uses `useAuth()` will receive these values.
    const contextValue = {
        isAuthenticated, // Boolean: Is the user logged in?
        user,            // Object: Current user details (e.g., { username: 'testuser' })
        loadingAuth,     // Boolean: Is the initial authentication check or an auth operation in progress?
        login,           // Function: To log in a user
        logout,          // Function: To log out a user
        register,        // Function: To register a new user
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children} {/* Render all child components that need access to the auth context */}
        </AuthContext.Provider>
    );
};

// 3. Custom Hook to Consume the Context
// This hook makes it easy for any functional component to access the authentication context values.
export const useAuth = () => {
    const context = useContext(AuthContext);
    // Throw an error if `useAuth` is called outside of an `AuthProvider`
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};