import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Navbar = ({ title }) => {
    const { user, currency, changeCurrency } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();

        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    return (
        <header className="bg-white border-b border-gray-200 h-20 px-8 flex items-center justify-between sticky top-0 z-10 w-full">
            <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            </div>

            <div className="flex items-center space-x-6 relative" ref={dropdownRef}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="relative text-gray-500 hover:text-primary transition-colors focus:outline-none"
                >
                    <Bell size={24} />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full border-2 border-white flex justify-center items-center text-[8px] text-white font-bold">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {showDropdown && (
                    <div className="absolute top-10 right-20 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden text-sm">
                        <div className="p-4 border-b border-gray-100 font-bold text-gray-800 flex justify-between items-center bg-gray-50">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                                    {unreadCount} New
                                </span>
                            )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    No notifications yet.
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif._id}
                                            className={`p-4 hover:bg-gray-50 transition-colors flex items-start cursor-pointer ${!notif.isRead ? 'bg-primary/5' : ''}`}
                                            onClick={() => !notif.isRead && markAsRead(notif._id)}
                                        >
                                            <div className="mt-0.5 mr-3 shrink-0">
                                                {notif.type === 'warning' ? (
                                                    <AlertCircle className="text-orange-500" size={16} />
                                                ) : (
                                                    <CheckCircle2 className="text-gray-400" size={16} />
                                                )}
                                            </div>
                                            <div>
                                                <p className={`text-gray-800 font-medium ${!notif.isRead ? 'font-bold' : ''}`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                                                    {notif.message}
                                                </p>
                                                <p className="text-gray-400 text-[10px] mt-2 font-mono">
                                                    {new Date(notif.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                    <div className="h-10 w-10 bg-gradient-to-tr from-primary to-purple-400 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {(user?.name || user?.email)?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-semibold text-gray-700">{user?.name || user?.email}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
