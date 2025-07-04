// src/services/authService.js
import api from './api'; // Assuming 'api.js' is configured with axios

const AUTH_BASE_URL = '/auth'; // Base URL for authentication-related endpoints

/**
 * Sends a registration request to the backend.
 * @param {string} username - The desired username for the new account.
 * @param {string} password - The password for the new account.
 * @returns {Promise<Object>} A promise that resolves to the response data from the backend (e.g., success message).
 * @throws {string} An error message if the registration fails (e.g., username already taken).
 */
const register = async (username, password) => {
    try {
        const response = await api.post(`${AUTH_BASE_URL}/register`, {
            username,
            password,
        });
        return response.data; // Backend might return a success message or user info
    } catch (error) {
        // Extract and throw the backend's error message, or a default one
        throw error.response?.data?.message || 'Registration failed. Please try again.';
    }
};

/**
 * Sends a login request to the backend.
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} A promise that resolves to the response data, typically containing a JWT token.
 * @throws {string} An error message if the login fails (e.g., invalid credentials).
 */
const login = async (username, password) => {
    try {
        const response = await api.post(`${AUTH_BASE_URL}/login`, {
            username,
            password,
        });
        // Assuming your backend returns the JWT token directly in the response data,
        // e.g., { jwtToken: "..." }
        return response.data;
    } catch (error) {
        // The backend should return specific messages like "Invalid credentials"
        throw error.response?.data?.message || 'Login failed. Please check your username and password.';
    }
};

export default {
    register,
    login,
};