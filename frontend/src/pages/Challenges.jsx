import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Trophy, Target, Calendar, AlertCircle, Plus } from 'lucide-react';
import { formatCurrency as formatINR } from '../utils/currencyFormatter';
import toast from 'react-hot-toast';

const Challenges = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'Savings',
        targetAmount: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
    });

    const fetchChallenges = async () => {
        try {
            const res = await api.get('/challenges');
            setChallenges(res.data);
        } catch (err) {
            toast.error('Failed to fetch challenges');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChallenges();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/challenges', {
                ...formData,
                targetAmount: Number(formData.targetAmount)
            });
            toast.success('Challenge created!');
            setShowCreate(false);
            fetchChallenges();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create challenge');
        }
    };

    const updateProgress = async (id) => {
        try {
            await api.put(`/challenges/${id}/progress`);
            toast.success('Progress updated!');
            fetchChallenges();
        } catch (err) {
            toast.error('Failed to update progress');
        }
    };

    if (loading) {
        return (
            <Layout title="Financial Challenges">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Financial Challenges">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Your Challenges</h2>
                    <p className="text-sm text-gray-500">Gamify your savings and reach your goals faster.</p>
                </div>
                <button 
                    onClick={() => setShowCreate(!showCreate)}
                    className="bg-primary hover:bg-purple-600 text-white px-4 py-2 rounded-xl font-bold flex items-center transition-all"
                >
                    <Plus size={18} className="mr-2" />
                    {showCreate ? 'Cancel' : 'New Challenge'}
                </button>
            </div>

            {showCreate && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 animate-in slide-in-from-top duration-300">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Create New Challenge</h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input 
                                required 
                                type="text" 
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none" 
                                placeholder="e.g., Save for New Laptop"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select 
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value})}
                            >
                                <option value="Savings">Savings Goal</option>
                                <option value="No Shopping">No Shopping Period</option>
                            </select>
                        </div>
                        {formData.type === 'Savings' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                                <input 
                                    required 
                                    type="number" 
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none" 
                                    placeholder="5000"
                                    value={formData.targetAmount}
                                    onChange={e => setFormData({...formData, targetAmount: e.target.value})}
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input 
                                required 
                                type="date" 
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none" 
                                value={formData.startDate}
                                onChange={e => setFormData({...formData, startDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input 
                                required 
                                type="date" 
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none" 
                                value={formData.endDate}
                                onChange={e => setFormData({...formData, endDate: e.target.value})}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" className="w-full bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-900 transition-all">
                                Start Challenge
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challenges.length > 0 ? (
                    challenges.map(c => {
                        const progress = c.type === 'Savings' ? Math.min(100, Math.round((c.currentAmount / c.targetAmount) * 100)) : 0;
                        const statusColors = {
                            active: 'bg-blue-100 text-blue-600',
                            completed: 'bg-green-100 text-green-600',
                            failed: 'bg-red-100 text-red-600'
                        };

                        return (
                            <div key={c._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${statusColors[c.status]}`}>
                                        <Trophy size={24} />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${statusColors[c.status]}`}>
                                        {c.status}
                                    </span>
                                </div>
                                
                                <h3 className="text-lg font-bold text-gray-800 mb-1">{c.title}</h3>
                                <p className="text-sm text-gray-500 mb-4">{c.description || `${c.type} Challenge`}</p>
                                
                                {c.type === 'Savings' && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-500">Progress</span>
                                            <span className="font-bold text-gray-700">{progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full transition-all duration-1000 ${progress >= 100 ? 'bg-green-500' : 'bg-primary'}`}
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs font-medium">
                                            <span className="text-gray-400">{formatINR(c.currentAmount)}</span>
                                            <span className="text-gray-400">Target: {formatINR(c.targetAmount)}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center text-xs text-gray-400 mb-6">
                                    <Calendar size={14} className="mr-1" />
                                    Ends on {new Date(c.endDate).toLocaleDateString()}
                                </div>

                                {c.status === 'active' && (
                                    <button 
                                        onClick={() => updateProgress(c._id)}
                                        className="w-full py-2 border-2 border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:border-primary hover:text-primary transition-all"
                                    >
                                        Update Progress
                                    </button>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-1 md:col-span-2 bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                        <div className="inline-block p-4 bg-white rounded-full text-gray-300 mb-4">
                            <Target size={48} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-400">No active challenges</h3>
                        <p className="text-gray-400 max-w-xs mx-auto mt-2">Start a new challenge to track your financial goals in a fun way!</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Challenges;
