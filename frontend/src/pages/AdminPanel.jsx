import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Users, DollarSign, Activity, Trash2, Edit, TrendingUp, LayoutDashboard, List, BarChart3 } from 'lucide-react';
import { formatCurrency as formatINR } from '../utils/currencyFormatter';
import toast from 'react-hot-toast';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AdminPanel = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const [statsRes, transRes, analyticsRes, usersRes] = await Promise.all([
                api.get('/admin/system-stats'),
                api.get('/admin/all-transactions'),
                api.get('/admin/analytics'),
                api.get('/admin/users')
            ]);
            setStats(statsRes.data.stats);
            setTransactions(transRes.data);
            setAnalytics(analyticsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("Are you sure you want to delete this user? ALL their data will be lost.")) {
            try {
                await api.delete(`/admin/users/${id}`);
                setUsers(users.filter(u => u._id !== id));
                toast.success('User deleted successfully');
                fetchAdminData();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    const handleRoleChange = async (id, currentRole, email) => {
        if (email === 'admin@tracker.com') {
            return toast.error('Cannot change role of primary admin');
        }
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            await api.put(`/admin/users/${id}/role`, { role: newRole });
            setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
            toast.success(`Role updated to ${newRole}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update role');
        }
    };

    const chartData = {
        labels: analytics.map(d => d.month),
        datasets: [
            {
                label: 'System Income',
                data: analytics.map(d => d.income),
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'System Expenses',
                data: analytics.map(d => d.expense),
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4,
            }
        ],
    };

    if (loading) {
        return (
            <Layout title="Admin Command Center">
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Admin Command Center">
            {/* Tabs */}
            <div className="flex space-x-4 mb-8 bg-gray-100/50 p-1.5 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'overview' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <LayoutDashboard size={18} className="mr-2" /> Overview
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Users size={18} className="mr-2" /> Users
                </button>
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={`flex items-center px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'transactions' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <List size={18} className="mr-2" /> Transactions
                </button>
            </div>

            {activeTab === 'overview' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} color="blue" />
                        <StatCard icon={DollarSign} label="Gross Income" value={formatINR(stats?.totalIncome)} color="green" />
                        <StatCard icon={Activity} label="Total Spending" value={formatINR(stats?.totalExpenses)} color="red" />
                        <StatCard icon={TrendingUp} label="Hot Category" value={stats?.mostUsedCategory || 'N/A'} color="orange" />
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mb-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-gray-800 flex items-center">
                                <BarChart3 size={24} className="mr-3 text-primary" /> System Growth Trends
                            </h3>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center"><div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div> <span className="text-xs font-bold text-gray-500">Income</span></div>
                                <div className="flex items-center"><div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div> <span className="text-xs font-bold text-gray-500">Expense</span></div>
                            </div>
                        </div>
                        <div className="h-96">
                            <Line data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { display: false }, ticks: { font: { weight: 'bold' } } }, x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } } } }} />
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'users' && (
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100">
                        <h3 className="text-xl font-black text-gray-800">User Management</h3>
                    </div>
                    <div className="overflow-x-auto text-sm font-bold">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-400">
                                <tr>
                                    <th className="px-8 py-5">EMAIL</th>
                                    <th className="px-8 py-5">ROLE</th>
                                    <th className="px-8 py-5">JOINED</th>
                                    <th className="px-8 py-5 text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(u => (
                                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5 text-gray-800">{u.email}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td className="px-8 py-5 flex justify-end space-x-3">
                                            <button onClick={() => handleRoleChange(u._id, u.role, u.email)} className="p-2 text-gray-400 hover:bg-white hover:text-blue-500 rounded-lg shadow-sm transition-all"><Edit size={16} /></button>
                                            <button onClick={() => handleDeleteUser(u._id)} className="p-2 text-gray-400 hover:bg-white hover:text-red-500 rounded-lg shadow-sm transition-all"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'transactions' && (
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100">
                        <h3 className="text-xl font-black text-gray-800">Global Transactions</h3>
                    </div>
                    <div className="overflow-x-auto text-sm font-bold">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-400">
                                <tr>
                                    <th className="px-8 py-5">USER</th>
                                    <th className="px-8 py-5">TITLE</th>
                                    <th className="px-8 py-5">CATEGORY</th>
                                    <th className="px-8 py-5 text-right">AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.map(t => (
                                    <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 text-gray-500">{t.user?.email || 'Unknown'}</td>
                                        <td className="px-8 py-5 text-gray-800">{t.title}</td>
                                        <td className="px-8 py-5"><span className="bg-gray-100 px-3 py-1 rounded-lg text-xs">{t.category || 'Income'}</span></td>
                                        <td className={`px-8 py-5 text-right font-black ${t.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                                            {t.type === 'expense' ? '-' : '+'}{formatINR(t.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Layout>
    );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-500 border-blue-100',
        green: 'bg-green-50 text-green-500 border-green-100',
        red: 'bg-red-50 text-red-500 border-red-100',
        orange: 'bg-orange-50 text-orange-500 border-orange-100',
    };
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center">
            <div className={`h-14 w-14 ${colors[color]} rounded-2xl flex items-center justify-center mr-4 shadow-sm`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <h3 className="text-2xl font-black text-gray-800">{value}</h3>
            </div>
        </div>
    );
};

export default AdminPanel;
