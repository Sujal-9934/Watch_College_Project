import axios from 'axios';

export const API_BASE_URL = (process.env.REACT_APP_API_URL || '/api').replace(/\/+$/, '');

axios.defaults.withCredentials = true;
