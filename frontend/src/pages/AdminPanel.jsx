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
    const [searchTerm, setSearchTerm] = useState('');
    const [recentActivity, setRecentActivity] = useState([]);
    const [filters, setFilters] = useState({ type: '', category: '' });

    useEffect(() => {
        fetchAdminData();
    }, [filters]);

    const fetchAdminData = async () => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const [statsRes, transRes, analyticsRes, usersRes] = await Promise.all([
                api.get('/admin/system-stats'),
                api.get(`/admin/all-transactions?${queryParams}`),
                api.get('/admin/analytics'),
                api.get('/admin/users')
            ]);
            setStats(statsRes.data.stats);
            setRecentActivity(statsRes.data.recentActivity);
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

    const handleDeleteTransaction = async (id, type) => {
        if (window.confirm("Delete this transaction from the system? This action is permanent.")) {
            try {
                await api.delete(`/admin/transactions/${id}?type=${type}`);
                toast.success('Transaction removed');
                fetchAdminData();
            } catch (error) {
                toast.error('Failed to delete transaction');
            }
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
            <div className="flex space-x-2 md:space-x-4 mb-8 bg-gray-100/50 p-1.5 rounded-2xl w-fit overflow-x-auto">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center px-4 md:px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 font-bold'}`}
                >
                    <LayoutDashboard size={18} className="mr-2" /> Overview
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center px-4 md:px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 font-bold'}`}
                >
                    <Users size={18} className="mr-2" /> Users
                </button>
                <button
                    onClick={() => setActiveTab('transactions')}
                    className={`flex items-center px-4 md:px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'transactions' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 font-bold'}`}
                >
                    <List size={18} className="mr-2" /> Transactions
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center px-4 md:px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'analytics' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 font-bold'}`}
                >
                    <BarChart3 size={18} className="mr-2" /> System Growth
                </button>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} color="blue" />
                            <StatCard icon={TrendingUp} label="Avg Savings Rate" value={`${stats?.avgSavingsRate || 0}%`} color="orange" />
                            <StatCard icon={DollarSign} label="Gross Income" value={formatINR(stats?.totalIncome)} color="green" />
                            <StatCard icon={Activity} label="Total Spending" value={formatINR(stats?.totalExpenses)} color="red" />
                        </div>
                        
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center">
                                <Activity size={24} className="mr-3 text-primary" /> System Performance
                            </h3>
                            <div className="h-64">
                                <Line data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false } } } }} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 flex flex-col h-fit">
                        <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center">
                            <BarChart3 size={24} className="mr-3 text-primary" /> Activity Feed
                        </h3>
                        <div className="space-y-6">
                            {recentActivity.map((activity, idx) => (
                                <div key={idx} className="flex items-start group">
                                    <div className={`mt-1 h-3 w-3 rounded-full shrink-0 mr-4 ${activity.type === 'user' ? 'bg-blue-500' : activity.type === 'expense' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                    <div className="flex-1 border-b border-gray-50 pb-4 group-last:border-0">
                                        <p className="text-sm font-black text-gray-800">{activity.title}</p>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(activity.time).toLocaleString()}</p>
                                            {activity.amount && (
                                                <span className={`text-xs font-black ${activity.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                                                    {activity.type === 'expense' ? '-' : '+'}{formatINR(activity.amount)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-xl font-black text-gray-800">User Management</h3>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search by email..." 
                                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-bold w-full md:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Activity className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                    </div>
                    <div className="overflow-x-auto text-sm font-bold">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-400">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] tracking-widest uppercase">EMAIL</th>
                                    <th className="px-8 py-5 text-[10px] tracking-widest uppercase">ROLE</th>
                                    <th className="px-8 py-5 text-[10px] tracking-widest uppercase">JOINED</th>
                                    <th className="px-8 py-5 text-right text-[10px] tracking-widest uppercase">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedUser(u)}>
                                        <td className="px-8 py-5 text-gray-800">{u.email}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-gray-400 font-bold">{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td className="px-8 py-5 flex justify-end space-x-3" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => handleRoleChange(u._id, u.role, u.email)} className="p-2.5 text-gray-400 hover:bg-white hover:text-blue-500 rounded-xl shadow-sm transition-all border border-transparent hover:border-blue-100"><Edit size={16} /></button>
                                            <button onClick={() => handleDeleteUser(u._id)} className="p-2.5 text-gray-400 hover:bg-white hover:text-red-500 rounded-xl shadow-sm transition-all border border-transparent hover:border-red-100"><Trash2 size={16} /></button>
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
                    <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <h3 className="text-xl font-black text-gray-800">Global Transactions</h3>
                        <div className="flex flex-wrap gap-4">
                            <select 
                                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-black outline-none focus:ring-2 focus:ring-primary/20"
                                value={filters.type}
                                onChange={(e) => setFilters({...filters, type: e.target.value})}
                            >
                                <option value="">All Types</option>
                                <option value="income">Income Only</option>
                                <option value="expense">Expense Only</option>
                            </select>
                            <select 
                                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-black outline-none focus:ring-2 focus:ring-primary/20"
                                value={filters.category}
                                onChange={(e) => setFilters({...filters, category: e.target.value})}
                            >
                                <option value="">All Categories</option>
                                <option value="Food">Food</option>
                                <option value="Travel">Travel</option>
                                <option value="Shopping">Shopping</option>
                                <option value="Bills">Bills</option>
                                <option value="Entertainment">Entertainment</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto text-sm font-bold">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-400">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] tracking-widest uppercase">USER</th>
                                    <th className="px-8 py-5 text-[10px] tracking-widest uppercase">TITLE</th>
                                    <th className="px-8 py-5 text-[10px] tracking-widest uppercase text-center">CATEGORY</th>
                                    <th className="px-8 py-5 text-right text-[10px] tracking-widest uppercase">AMOUNT</th>
                                    <th className="px-8 py-5 text-right text-[10px] tracking-widest uppercase">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.map(t => (
                                    <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 text-gray-500 font-bold">{t.user?.email || 'System'}</td>
                                        <td className="px-8 py-5 text-gray-800">{t.title}</td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="bg-gray-100 px-3 py-1 rounded-lg text-[10px] uppercase font-black text-gray-500">
                                                {t.category || t.source || 'Other'}
                                            </span>
                                        </td>
                                        <td className={`px-8 py-5 text-right font-black ${t.type === 'expense' || !t.source ? 'text-red-500' : 'text-green-500'}`}>
                                            {(t.type === 'expense' || !t.source) ? '-' : '+'}{formatINR(t.amount)}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button 
                                                onClick={() => handleDeleteTransaction(t._id, (t.type === 'expense' || !t.source) ? 'expense' : 'income')}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete suspicious transaction"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="space-y-8">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center">
                            <TrendingUp size={28} className="mr-4 text-primary" /> System Growth & Adoption
                        </h3>
                        <div className="h-[500px]">
                            <Line 
                                data={chartData} 
                                options={{ 
                                    maintainAspectRatio: false, 
                                    plugins: { 
                                        legend: { 
                                            position: 'top',
                                            labels: { font: { weight: 'bold', size: 12 } }
                                        } 
                                    }, 
                                    scales: { 
                                        y: { grid: { color: '#f3f4f6' }, ticks: { font: { weight: 'bold' }, callback: (v) => formatINR(v) } }, 
                                        x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } } 
                                    } 
                                }} 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm shadow-inner" onClick={() => setSelectedUser(null)}></div>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative p-10 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 mb-1">User Details</h3>
                                <p className="text-gray-500 font-bold">{selectedUser.email}</p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest ${selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                {selectedUser.role.toUpperCase()}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Joined</p>
                                <p className="text-sm font-black text-gray-800">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Plan</p>
                                <p className="text-sm font-black text-gray-800">FREE TIER</p>
                            </div>
                        </div>

                        <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 mb-8">
                            <p className="text-xs font-black text-primary uppercase tracking-widest mb-4">Financial Pulse</p>
                            <div className="space-y-4">
                                <div className="flex justify-between font-bold text-sm">
                                    <span className="text-gray-500">Manual Budget</span>
                                    <span className="text-gray-900 font-black">{formatINR(selectedUser.monthlyBudget || 0)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-sm">
                                    <span className="text-gray-500">Transactions</span>
                                    <span className="text-gray-900 font-black">--</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setSelectedUser(null)}
                            className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95"
                        >
                            Close Details
                        </button>
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
