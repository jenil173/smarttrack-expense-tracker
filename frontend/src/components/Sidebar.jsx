import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, TrendingUp, Users, LogOut, BarChart, Target } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navClasses = ({ isActive }) =>
        `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive
            ? 'bg-primary text-white shadow-md shadow-primary/30'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        }`;

    return (
        <div className={`h-screen w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className="p-6 shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    SmartTrack
                </h1>
            </div>

            <div className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto scrollbar-hide">
                <NavLink to="/dashboard" onClick={onClose} className={navClasses}>
                    <LayoutDashboard size={20} />
                    <span className="font-medium">Dashboard</span>
                </NavLink>
                <NavLink to="/expenses" onClick={onClose} className={navClasses}>
                    <Receipt size={20} />
                    <span className="font-medium">Expenses</span>
                </NavLink>
                <NavLink to="/income" onClick={onClose} className={navClasses}>
                    <TrendingUp size={20} />
                    <span className="font-medium">Income</span>
                </NavLink>
                <NavLink to="/splits" onClick={onClose} className={navClasses}>
                    <Users size={20} />
                    <span className="font-medium">Split Expenses</span>
                </NavLink>

                <NavLink to="/reports" onClick={onClose} className={navClasses}>
                    <BarChart size={20} />
                    <span className="font-medium">Reports</span>
                </NavLink>
                <NavLink to="/challenges" onClick={onClose} className={navClasses}>
                    <Target size={20} />
                    <span className="font-medium">Challenges</span>
                </NavLink>

                {user?.role === 'admin' && (
                    <NavLink to="/admin" onClick={onClose} className={navClasses}>
                        <Users size={20} />
                        <span className="font-medium">Admin Panel</span>
                    </NavLink>
                )}
            </div>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
