import axios from 'axios';

// The base URL points to your backend server's expense routes
const API_BASE_URL = 'http://localhost:5000/api/expenses';

// Helper to get the auth token for secure requests
const getConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
});

// Define the data structure for a single transaction
export interface Expense {
    _id: string;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    category: string;
}

// Fetches all expense/income records for the logged-in user
export const getExpenses = async (): Promise<Expense[]> => {
    const response = await axios.get(API_BASE_URL, getConfig());
    return response.data;
};

// Adds a new expense/income record
export const addExpense = async (data: Omit<Expense, '_id'>): Promise<Expense> => {
    const response = await axios.post(API_BASE_URL, data, getConfig());
    return response.data;
};

// Deletes a specific transaction by its ID
export const deleteExpense = async (id: string): Promise<{ message: string }> => {
    const response = await axios.delete(`${API_BASE_URL}/${id}`, getConfig());
    return response.data;
};