// src/services/api.js
import axios from "axios";

// Create axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api", // ✅ Your backend URL
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request interceptor -> attach token from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// ✅ Response interceptor -> handle expired/invalid tokens
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Response error:", error);

    if (error.response?.status === 401) {
      // Token invalid or expired
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login"; // force re-login
    }

    return Promise.reject(error);
  }
);

export default API;
