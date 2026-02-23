// ============================================================
// services/api.js — Centralized API Layer
// ============================================================
//
// WHY A SEPARATE API SERVICE FILE?
// 1. Single place to change the base URL (dev vs production)
// 2. Add interceptors once (auth tokens, logging) — affects all calls
// 3. Route handlers don't need to know HOW the API is called
// 4. Easy to mock in tests: jest.mock('./services/api')
//
// WHY AXIOS OVER FETCH?
// - Automatic JSON parsing (fetch requires .json() call)
// - Automatic request/response interceptors
// - Better error objects (fetch resolves on 4xx/5xx, axios throws)
// - Request cancellation support (CancelToken)
// - Works in both browser and Node.js
// ============================================================

import axios from 'axios';

// When package.json has "proxy": "http://localhost:5000", CRA
// dev server forwards /api/* requests to Express automatically.
// In production, set REACT_APP_API_URL to your deployed backend URL.
const BASE_URL = process.env.REACT_APP_API_URL || '';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,  // 60 second timeout — OpenAI can be slow
  headers: {
    'Content-Type': 'application/json'
  }
});

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================
// Runs on EVERY response before it reaches your component.
// Here we can:
// - Log responses for debugging
// - Handle 401 (redirect to login) globally
// - Transform error messages into user-friendly format
// ============================================================
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize error message from multiple possible locations
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    // Attach normalized message so components don't have to dig
    error.userMessage = message;
    return Promise.reject(error);
  }
);

export const analyzeResume = async (resume, jobDescription) => {
  const response = await apiClient.post('/api/analyze', {
    resume,
    jobDescription
  });
  return response.data;
};

export default apiClient;
