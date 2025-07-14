// API Configuration - reads from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export default API_BASE_URL;
