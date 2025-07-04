// src/services/walletService.js
import api from './api'; // Assuming 'api.js' is configured with axios and JWT interceptor

const WALLET_BASE_URL = '/wallet'; // Base URL for wallet-related endpoints

const getBalance = async () => {
    try {
        const response = await api.get(`${WALLET_BASE_URL}/balance`);
        // Assuming the backend returns an object like { balance: 123.45 }
        return response.data.balance;
    } catch (error) {
        // Extract and throw the backend's error message, or a default one
        throw error.response?.data?.message || 'Failed to fetch balance.';
    }
};

const deposit = async (amount) => {
    try {
        const response = await api.post(`${WALLET_BASE_URL}/deposit`, null, {
            params: { amount: amount } // Sending amount as a query parameter
        });
        // Assuming the backend returns an object with the new balance, e.g., { message: "Deposit successful", balance: 200.00 }
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Deposit failed. Please try again.';
    }
};

const withdraw = async (amount) => {
    try {
        const response = await api.post(`${WALLET_BASE_URL}/withdraw`, null, {
            params: { amount: amount } // Sending amount as a query parameter
        });
        // Assuming the backend returns an object with the new balance, e.g., { message: "Withdrawal successful", balance: 150.00 }
        return response.data;
    } catch (error) {
        // The backend should return specific messages like "Insufficient funds"
        throw error.response?.data?.message || 'Withdrawal failed. Please try again.';
    }
};

const transfer = async (receiverUsername, amount) => {
    try {
        const response = await api.post(`${WALLET_BASE_URL}/transfer`, null, {
            params: {
                receiverUsername: receiverUsername,
                amount: amount
            }
        });
        // Assuming the backend returns a success message or updated balances
        return response.data;
    } catch (error) {
        // The backend should return specific messages like "Recipient not found" or "Insufficient funds"
        throw error.response?.data?.message || 'Transfer failed. Please try again.';
    }
};

export default {
    getBalance,
    deposit,
    withdraw,
    transfer,
};