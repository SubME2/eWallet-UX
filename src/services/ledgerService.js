// src/services/ledgerService.js
import api from './api'; // Assuming 'api.js' is configured with axios and JWT interceptor

const LEDGER_BASE_URL = '/wallet'; // Base URL for ledger-related endpoints

/**
 * Fetches all ledger entries for the currently authenticated user.
 * @returns {Promise<Array>} A promise that resolves to an array of ledger entries.
 * @throws {string} An error message if the API call fails.
 */
const getLedgerEntriesForCurrentUser = async () => {
    try {
        const response = await api.get(`${LEDGER_BASE_URL}/transactions`);
        return response.data; // Assuming response.data is an array of LedgerEntry objects
    } catch (error) {
        // Extract and throw the backend's error message, or a default one
        throw error.response?.data?.message || 'Failed to fetch all ledger entries.';
    }
};

/**
 * Fetches ledger entries for the currently authenticated user within a specified date range.
 * Dates should be in 'YYYY-MM-DD' format.
 * @param {string} startDate - The start date of the range (YYYY-MM-DD).
 * @param {string} endDate - The end date of the range (YYYY-MM-DD).
 * @returns {Promise<Array>} A promise that resolves to an array of ledger entries within the range.
 * @throws {string} An error message if the API call fails.
 */
const getLedgerEntriesForCurrentUserByDateRange = async (startDate, endDate) => {
    try {
        const response = await api.get(`${LEDGER_BASE_URL}/transactions/range`, {
            params: { startDate, endDate } // Send dates as query parameters
        });
        return response.data; // Assuming response.data is an array of LedgerEntry objects
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch ledger entries by date range.';
    }
};

export default {
    getLedgerEntriesForCurrentUser,
    getLedgerEntriesForCurrentUserByDateRange,
};