import axios from 'axios';
import { Article } from '@/types';

const API_URL = 'http://localhost:5000/api/articles';

const getToken = () => localStorage.getItem('token');
const getAuthHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

interface CreateArticleData {
    title: string;
    content: string;
}

/**
 * @desc    Create a new article
 * @route   POST /api/articles
 */
export const createArticle = async (data: CreateArticleData): Promise<Article> => {
    const response = await axios.post(API_URL, data, { headers: getAuthHeaders() });
    return response.data;
};

/**
 * @desc    Get all articles by a specific author
 * @route   GET /api/articles/author/:authorId
 */
export const getArticlesByAuthor = async (authorId: string): Promise<Article[]> => {
    const response = await axios.get(`${API_URL}/author/${authorId}`, { headers: getAuthHeaders() });
    return response.data;
};