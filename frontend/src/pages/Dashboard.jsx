import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import DashboardCards from '../components/DashboardCards';
import { ExpenseDoughnutChart, TrendLineChart, MoodCategoryBarChart } from '../components/Charts';
import SpendingHeatmap from '../components/SpendingHeatmap';
import FinancialHealthAudit from '../components/FinancialHealthAudit';
import api from '../services/api';
import { AlertCircle, Brain, Recycle, Sparkles, Wand2, Calendar, Activity, PieChart } from 'lucide-react';
import { formatCurrency } from '../utils/currencyFormatter';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [summary, setSummary] = useState(null);
    const [splits, setSplits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingBudget, setEditingBudget] = useState(false);
    const [newBudget, setNewBudget] = useState('');
    const [insights, setInsights] = useState(null);
    const [simulation, setSimulation] = useState({ reduction: 2000, result: null });

    const fetchData = async () => {
        try {
            const [summaryRes, analyticsRes, insightsRes, splitsRes] = await Promise.all([
                api.get('/expenses/summary'),
                api.get('/dashboard/analytics'),
                api.get('/dashboard/insights'),
                api.get('/api/splits') // New endpoint
            ]);

            setSummary(summaryRes.data);
            setAnalytics(analyticsRes.data);
            setInsights(insightsRes.data);
            setSplits(splitsRes.data);
            setNewBudget(summaryRes.data.monthlyBudget || '');
        } catch (err) {
            setError('Failed to fetch dashboard data');
            toast.error('Dashboard synchronization failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateBudget = async () => {
        try {
            await api.put('/auth/profile', { monthlyBudget: Number(newBudget) });
            setEditingBudget(false);
            toast.success('Monthly budget updated');
            fetchData();
        } catch (error) {
            toast.error('Failed to update budget');
        }
    };

    const handleSimulate = () => {
        if (!summary) return;
        const reduction = Number(simulation.reduction);
        const newTotalExpense = summary.totalExpense - reduction;
        const newSavings = summary.totalIncome - newTotalExpense;
        const newHealthScore = Math.min(100, Math.max(0, (newSavings / (summary.totalIncome || 1)) * 100));
        
        setSimulation({
            ...simulation,
            result: {
                yearlySavings: reduction * 12,
                newHealthScore: Math.round(newHealthScore)
            }
        });
    };

    if (loading) {
        return (
            <Layout title="Dashboard">
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </Layout>
        );
    }

    // Calculate budget progress
    const budget = summary?.monthlyBudget || 0;
    const expense = summary?.totalExpense || 0;
    const progress = budget > 0 ? Math.min((expense / budget) * 100, 100) : 0;
    let progressColor = 'bg-primary';
    if (progress >= 90) progressColor = 'bg-red-500';
    else if (progress >= 70) progressColor = 'bg-orange-500';

    const hasData = summary?.totalIncome > 0 || summary?.totalExpense > 0 || (analytics?.categoryExpenses && Object.keys(analytics.categoryExpenses).length > 0);

    return (
        <Layout title="Dashboard">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center shadow-sm border border-red-100">
                    <AlertCircle className="mr-3" size={24} />
                    {error}
                </div>
            )}

            {/* Stats Cards */}
            <DashboardCards
                income={summary?.totalIncome}
                expense={summary?.totalExpense}
                balance={summary?.balance}
                savings={summary?.savings}
                healthScore={summary?.healthScore}
            />

            {/* Split Balances Mini Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {(() => {
                    let youOwe = 0;
                    let owedToYou = 0;
                    splits.forEach(split => {
                        if (split.payer._id === user.id) {
                            split.participants.forEach(p => { if (p.status === 'pending') owedToYou += p.amount; });
                        } else {
                            const myShare = split.participants.find(p => p.user?._id === user.id || p.email === user.email);
                            if (myShare && myShare.status === 'pending') youOwe += myShare.amount;
                        }
                    });
                    return (
                        <>
                            <Link to="/splits" className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm flex flex-col hover:bg-red-50 transition-all">
                                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">You Owe</span>
                                <span className="text-lg font-black text-gray-800">₹{youOwe.toFixed(0)}</span>
                            </Link>
                            <Link to="/splits" className="bg-white p-4 rounded-2xl border border-green-100 shadow-sm flex flex-col hover:bg-green-50 transition-all">
                                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">They Owe You</span>
                                <span className="text-lg font-black text-gray-800">₹{owedToYou.toFixed(0)}</span>
                            </Link>
                        </>
                    );
                })()}
                <div className="hidden md:block col-span-2"></div>
            </div>

            {/* Budget Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="flex-1 w-full">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Monthly Budget</h3>
                            <p className="text-sm text-gray-500">
                                {budget > 0 ? `${formatCurrency(expense)} / ${formatCurrency(budget)} spent` : 'No budget set for this month'}
                            </p>
                        </div>
                        <span className="text-sm font-bold text-gray-700">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                        <div className={`h-3 rounded-full ${progressColor} transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="shrink-0">
                    {editingBudget ? (
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary text-sm font-bold"
                                value={newBudget}
                                onChange={(e) => setNewBudget(e.target.value)}
                                placeholder="Amount"
                            />
                            <button onClick={handleUpdateBudget} className="bg-primary hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all">Save</button>
                            <button onClick={() => setEditingBudget(false)} className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm transition-all">Cancel</button>
                        </div>
                    ) : (
                        <button onClick={() => setEditingBudget(true)} className="border border-gray-200 hover:border-primary text-primary px-4 py-2 rounded-xl text-sm font-bold transition-all hover:bg-primary/5">
                            {budget > 0 ? 'Edit Budget' : 'Set Budget'}
                        </button>
                    )}
                </div>
            </div>

            {/* Analytics Grid */}
            {!hasData ? (
                <div className="bg-white rounded-3xl p-12 shadow-sm border border-dashed border-gray-200 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mb-8 animate-pulse">
                        <Sparkles size={48} className="text-primary" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 mb-3 tracking-tight">Your Financial Journey Starts Here</h3>
                    <p className="text-gray-500 max-w-sm mb-10 leading-relaxed font-medium">Add your first income or expense entry to unlock personalized charts, spending habits, and AI-driven insights.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to="/income" className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-green-700 transition-all shadow-lg hover:shadow-green-200 flex items-center justify-center">Add Income</Link>
                        <Link to="/expenses" className="bg-primary text-white px-10 py-4 rounded-2xl font-black hover:bg-purple-700 transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center">Add Expense</Link>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                                <Activity className="mr-2 text-primary" size={20} />
                                Income & Expense Trend
                            </h3>
                            <TrendLineChart monthlyData={analytics?.monthlyData} />
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                                <PieChart className="mr-2 text-primary" size={20} />
                                Expense Breakdown
                            </h3>
                            <ExpenseDoughnutChart categoryData={analytics?.categoryExpenses} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        <div className="lg:col-span-1">
                            <FinancialHealthAudit 
                                income={summary?.totalIncome} 
                                expense={summary?.totalExpense} 
                                balance={summary?.balance} 
                            />
                        </div>

                        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Brain className="mr-2 text-indigo-600" size={20} />
                                Mood vs Spending Correlation
                            </h3>
                            <MoodCategoryBarChart moodData={insights?.moodStats} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Calendar className="mr-2 text-green-600" size={20} />
                                Spending Activity Heatmap
                            </h3>
                            <SpendingHeatmap data={insights?.heatmap} />
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <span className="mr-2">🧠</span> Habit Analyzer
                            </h3>
                            <div className="space-y-4">
                                {insights?.habits?.length > 0 ? (
                                    insights.habits.map((h, i) => (
                                        <div key={i} className="flex items-start p-3 bg-blue-50 rounded-xl border border-blue-100">
                                            <div className="mr-3 mt-1 text-blue-600">✨</div>
                                            <p className="text-sm text-blue-800">{h}</p>
                                        </div>
                                    ))
                                ) : insights?.needsMoreData ? (
                                    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <Activity className="text-gray-300 mb-2" size={32} />
                                        <p className="text-gray-500 text-sm font-bold text-center">Add at least 5 transactions to see spending habits</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm italic">Tracking more data to generate tips...</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 mt-6">
                        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-50/50 to-white rounded-2xl p-6 shadow-sm border border-indigo-100 overflow-hidden relative">
                             <Sparkles className="absolute -right-4 -top-4 text-indigo-100" size={120} />
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Sparkles className="mr-2 text-indigo-600" size={20} />
                                AI Financial Story
                            </h3>
                            <p className="text-gray-700 leading-relaxed italic text-sm md:text-md relative z-10">
                                {insights?.story || "Your financial story is being written. Keep tracking to get insights!"}
                            </p>

                            <div className="mt-6 flex items-end justify-between space-x-4 h-20 relative z-10">
                                {['Happy', 'Neutral', 'Stressed'].map(m => {
                                    const amount = insights?.moodStats?.[m] || 0;
                                    const total = Object.values(insights?.moodStats || {}).reduce((a, b) => a + b, 0) || 1;
                                    const pct = (amount / total) * 100;
                                    const color = m === 'Happy' ? 'bg-green-400' : m === 'Stressed' ? 'bg-red-400' : 'bg-indigo-400';
                                    
                                    return (
                                        <div key={m} className="flex-1 flex flex-col items-center group">
                                            <div className="relative w-full flex items-end justify-center mb-1 h-12">
                                                <div 
                                                    className={`${color} w-6 rounded-t-lg transition-all duration-700 ease-out`}
                                                    style={{ height: `${Math.max(15, pct)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase">{m}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Recycle className="mr-2 text-primary" size={20} />
                                Recurring detected
                            </h3>
                            <div className="space-y-3">
                                {insights?.recurring?.length > 0 ? (
                                    insights.recurring.map((r, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                            <div>
                                                <p className="font-bold text-sm text-gray-800">{r.title}</p>
                                                <p className="text-xs text-gray-500">{r.category} • {r.frequency}</p>
                                            </div>
                                            <span className="text-sm font-bold text-primary">{formatCurrency(r.amount)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-sm italic">No recurring patterns found yet.</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <Wand2 className="mr-2 text-purple-600" size={20} />
                                What-If Simulator
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">Plan for a better financial future.</p>
                            <div className="flex space-x-2 mb-4">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-2.5 text-gray-400 bg-white">₹</span>
                                    <input
                                        type="number"
                                        className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-primary font-bold text-sm"
                                        placeholder="Amount to reduce"
                                        value={simulation.reduction}
                                        onChange={(e) => setSimulation({ ...simulation, reduction: e.target.value })}
                                    />
                                </div>
                                <button onClick={handleSimulate} className="bg-primary hover:bg-purple-700 text-white font-bold px-6 py-2 rounded-xl transition-all shadow-sm">Simulate</button>
                            </div>

                            {simulation.result && (
                                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 animate-in fade-in zoom-in-95 duration-500">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] text-purple-600 font-black uppercase tracking-widest">Yearly Savings</p>
                                            <p className="text-xl font-black text-gray-800">{formatCurrency(simulation.result.yearlySavings)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-purple-600 font-black uppercase tracking-widest">Health Score</p>
                                            <p className="text-xl font-black text-gray-800">{simulation.result.newHealthScore}/100</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </Layout>
    );
};

export default Dashboard;
