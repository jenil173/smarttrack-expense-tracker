import React, { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Users, Plus, IndianRupee, Clock, CheckCircle2, AlertCircle, Share2, ArrowUpRight, ArrowDownLeft, Trash2, Mail } from 'lucide-react';
import { formatCurrency as formatINR } from '../utils/currencyFormatter';
import toast from 'react-hot-toast';
import SplitExpenseForm from '../components/SplitExpenseForm';

const SplitExpenses = () => {
    const { user } = useContext(AuthContext);
    const [splits, setSplits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('all'); // all, paid_by_me, shared_with_me

    useEffect(() => {
        fetchSplits();
    }, []);

    const fetchSplits = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/splits');
            setSplits(res.data);
        } catch (error) {
            toast.error('Failed to fetch shared expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleSettle = async (splitId, participantId) => {
        if (!window.confirm("Mark this share as settled?")) return;
        try {
            await api.put(`/api/splits/${splitId}/settle`, { participantId });
            toast.success('Balance settled');
            fetchSplits();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Settlement failed');
        }
    };

    const calculateBalances = () => {
        let youOwe = 0;
        let owedToYou = 0;

        splits.forEach(split => {
            if (split.payer._id === user.id) {
                // You paid, others might owe you
                split.participants.forEach(p => {
                    if (p.status === 'pending') {
                        owedToYou += p.amount;
                    }
                });
            } else {
                // Someone else paid, you might owe them
                const myShare = split.participants.find(p => p.user?._id === user.id || p.email === user.email);
                if (myShare && myShare.status === 'pending') {
                    youOwe += myShare.amount;
                }
            }
        });

        return { youOwe, owedToYou };
    };

    const { youOwe, owedToYou } = calculateBalances();

    const filteredSplits = splits.filter(s => {
        if (filter === 'paid_by_me') return s.payer._id === user.id;
        if (filter === 'shared_with_me') return s.payer._id !== user.id;
        return true;
    });

    if (loading) {
        return (
            <Layout title="Smart Split Dashboard">
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Smart Split Expenses">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
                            <ArrowUpRight size={24} />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total You Owe</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-800">{formatINR(youOwe)}</h3>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-3 bg-green-50 text-green-500 rounded-2xl">
                            <ArrowDownLeft size={24} />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Owed to You</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-800">{formatINR(owedToYou)}</h3>
                </div>

                <button 
                    onClick={() => setShowForm(true)}
                    className="bg-primary hover:bg-purple-600 text-white p-6 rounded-3xl shadow-lg transition-all flex flex-col items-center justify-center space-y-2 group"
                >
                    <Plus size={32} className="group-hover:scale-110 transition-transform" />
                    <span className="font-black uppercase tracking-widest text-xs">New Split</span>
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2 mb-8 bg-gray-100/50 p-1.5 rounded-2xl w-fit">
                <button onClick={() => setFilter('all')} className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${filter === 'all' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>All Splits</button>
                <button onClick={() => setFilter('paid_by_me')} className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${filter === 'paid_by_me' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>Paid by Me</button>
                <button onClick={() => setFilter('shared_with_me')} className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm ${filter === 'shared_with_me' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>Shared with Me</button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredSplits.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                        <Share2 size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">No split expenses found</h3>
                        <p className="text-sm text-gray-400 mt-2 font-bold">Split bills with friends and link existing users automatically!</p>
                    </div>
                ) : (
                    filteredSplits.map(split => {
                        const amIPayer = split.payer._id === user.id;
                        return (
                            <div key={split._id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:border-primary/20 transition-all">
                                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start md:items-center gap-6">
                                        <div className={`p-4 rounded-2xl shrink-0 ${amIPayer ? 'bg-primary/10 text-primary' : 'bg-orange-100 text-orange-600'}`}>
                                            {amIPayer ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-black text-gray-800">{split.description}</h3>
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${split.status === 'settled' ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}`}>
                                                    {split.status}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                {amIPayer ? `You paid ${formatINR(split.totalAmount)}` : `${split.payer.name || split.payer.email} paid ${formatINR(split.totalAmount)}`}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Bill</p>
                                        <p className="text-xl font-black text-gray-800">{formatINR(split.totalAmount)}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 p-6 md:p-8 border-t border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Participants & Status</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {split.participants.map(p => {
                                            const isMe = p.user?._id === user.id || p.email === user.email;
                                            const canISettle = (amIPayer && !isMe) || (isMe && p.status === 'pending');
                                            
                                            return (
                                                <div key={p._id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center group">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-black text-gray-800">{isMe ? 'You' : (p.user?.name || p.email)}</p>
                                                            {!p.user && <Mail size={12} className="text-gray-400" title="External user notified by email" />}
                                                        </div>
                                                        <p className={`text-[10px] font-bold ${p.status === 'paid' ? 'text-green-500' : 'text-red-500'}`}>
                                                            {p.status === 'paid' ? 'SETTLED' : formatINR(p.amount)}
                                                        </p>
                                                    </div>
                                                    
                                                    {p.status === 'pending' && canISettle && (
                                                        <button 
                                                            onClick={() => handleSettle(split._id, p._id)}
                                                            className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap"
                                                        >
                                                            Mark as Paid
                                                        </button>
                                                    )}
                                                    
                                                    {p.status === 'paid' && (
                                                        <CheckCircle2 size={16} className="text-green-500" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowForm(false)}></div>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative p-8 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-gray-900">New Shared Expense</h3>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl"><Trash2 size={24} className="text-gray-400" /></button>
                        </div>
                        <SplitExpenseForm 
                            onSuccess={() => {
                                setShowForm(false);
                                fetchSplits();
                            }} 
                        />
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default SplitExpenses;
