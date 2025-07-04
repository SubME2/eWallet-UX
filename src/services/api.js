// src/services/api.js
import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    // Use the environment variable for the API base URL.
    // This allows you to easily switch between development and production backend URLs.
    // Make sure to have a .env file in your project root with REACT_APP_API_BASE_URL=http://localhost:8080/api
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json', // Default content type for requests
    },
});

// --- Request Interceptor ---
// This interceptor will be called before every request.
// It's used to add the JWT token to the 'Authorization' header if it exists in localStorage.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt_token'); // Get the token from localStorage
        if (token) {
            // If a token exists, add it to the Authorization header in 'Bearer' format
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config; // Return the modified config
    },
    (error) => {
        // Handle request errors (e.g., network issues before the request is even sent)
        return Promise.reject(error);
    }
);

// --- Response Interceptor ---
// This interceptor will be called for every response received from the API.
// It's useful for global error handling, especially for authentication errors.
api.interceptors.response.use(
    (response) => {
        // If the response is successful, just return it
        return response;
    },
    (error) => {
        // Check if the error response exists and has a status
        if (error.response) {
            // Handle 401 Unauthorized errors globally.
            // This often means the JWT token is missing, invalid, or expired.
            if (error.response.status === 401) {
                console.error("Unauthorized: Token might be invalid or expired. Redirecting to login.");
                // If an unauthorized error occurs, clear the token and redirect to login.
                // Importing AuthContext directly here can cause circular dependency issues.
                // A common pattern is to dispatch a global event or simply rely on
                // the AuthProvider's `checkAuthStatus` on next load, or a direct window redirect.
                localStorage.removeItem('jwt_token');
                // This is a direct redirect. In a production app, you might want to use
                // React Router's `Maps` (if you can get access to it outside components)
                // or a context-based logout function.
                window.location.href = '/login'; // Redirect to login page
            }
            // You can add more global error handling here for other status codes (e.g., 403 Forbidden, 500 Server Error)
        }
        // Re-throw the error so that individual components/services can catch and handle it as well
        return Promise.reject(error.response?.data?.message || 'An unexpected error occurred.');
    }
);

export default api;