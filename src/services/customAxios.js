// src/services/customAxios.js
import axios from 'axios';

const customAxios = axios.create({
    baseURL: '', // Adjust if needed
    // Do not define a default Content-Type here so that the browser will set it automatically
});

export default customAxios;
