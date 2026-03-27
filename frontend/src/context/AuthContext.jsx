import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const currencyConfig = {
        INR: { symbol: '₹', locale: 'en-IN', code: 'INR' }
    };

    const currency = 'INR';

    useEffect(() => {
        // Check if user is logged in
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
            const parsedUser = JSON.parse(cachedUser);
            setUser(parsedUser);
            
            // Fetch fresh user data from server to ensure role/session is current
            const fetchProfile = async () => {
                try {
                    const res = await api.get('/auth/me');
                    if (res.data) {
                        const updatedUser = { ...parsedUser, ...res.data };
                        localStorage.setItem('user', JSON.stringify(updatedUser)); // Keep tokens
                        setUser(updatedUser);
                    }
                } catch (err) {
                    console.error('Session expired or profile fetch failed', err);
                    if (err.response?.status === 401) {
                        logout(); // Clear invalid session
                    }
                }
            };
            fetchProfile();
        }
        
        setLoading(false);
    }, []);

    const changeCurrency = () => {
        // Disabled as per requirements
    };

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        if (res.data) {
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
        }
    };

    const register = async (email, password) => {
        const res = await api.post('/auth/register', { email, password });
        // Don't auto-set user here to force them to login as per requirements
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ 
            user, login, register, logout, loading,
            currency, currencySymbol: currencyConfig[currency].symbol,
            currencyConfig: currencyConfig[currency],
            changeCurrency 
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
