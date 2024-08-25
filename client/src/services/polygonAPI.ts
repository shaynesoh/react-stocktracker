import axios from 'axios';
import { createRateLimiter } from '../utils/rateLimiter';

const API_KEY = process.env.REACT_APP_POLYGON_API_KEY;
const API_SEARCH_URL = 'https://api.polygon.io/v3/reference/tickers';
const API_FETCH_URL = 'https://api.polygon.io/v2/aggs/ticker';

const rateLimiter = createRateLimiter();

export const searchStockNames = async (query: string) => {
    const url = `${API_SEARCH_URL}?search=${encodeURIComponent(query)}&limit=50&apiKey=${API_KEY}`;
    try {
        const response = await rateLimiter(() => axios.get(url));
        console.log(`Requested data from: ${url}`);
        return response.data.results;
    } catch (error) {
        console.error('Error searching for stock names:', error);
        throw error;
    }
};

export const fetchStockData = async (ticker: string, from: string, to: string) => {
    const url = `${API_FETCH_URL}/${ticker}/range/1/day/${from}/${to}?apiKey=${API_KEY}`;
    try {
        const response = await rateLimiter(() => axios.get(url));
        console.log(`Requested data from: ${url}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching stock data:', error);
        throw error;
    }
};
