import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor to add the token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        let message = "An unexpected error occurred.";
        
        if (error.response) {
            // Server responded with a status code
            const status = error.response.status;
            const data = error.response.data;
            
            if (status === 401) {
                message = "Session expired. Please log in again.";
                // Optional: redirect to login or logout
            } else if (status === 500) {
                message = "Server error. Please try again later.";
            } else if (data && data.message) {
                message = data.message;
            }
        } else if (error.request) {
            // Request was made but no response received
            message = "Unable to connect to server. Please check your internet connection.";
        }

        // Attach user-friendly message to error object
        error.friendlyMessage = message;
        return Promise.reject(error);
    }
);

export default api;
