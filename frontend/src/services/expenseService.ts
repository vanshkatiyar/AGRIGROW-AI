import api from '@/api/axios';

// Assuming you have an Expense type
export interface Expense {
  _id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
}

export interface FinanceSummary {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    expenseBreakdown: Record<string, number>;
    monthlyRevenue: { name: string; revenue: number }[];
}

export const getExpenses = async (): Promise<Expense[]> => {
  const { data } = await api.get('/expenses');
  return data;
};

export const addExpense = async (expenseData: Omit<Expense, '_id'>): Promise<Expense> => {
  const { data } = await api.post('/expenses', expenseData);
  return data;
};

export const deleteExpense = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.delete(`/expenses/${id}`);
  return data;
};

// --- NEW FUNCTION ---
export const getFinanceSummary = async (): Promise<FinanceSummary> => {
  const { data } = await api.get('/expenses/summary');
  return data;
};