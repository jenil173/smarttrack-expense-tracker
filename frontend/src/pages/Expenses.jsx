import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import api from '../services/api';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('All');

    const defaultCategories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];

    const fetchExpenses = async () => {
        try {
            const res = await api.get('/expenses');
            setExpenses(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleExpenseAdded = (newExpense) => {
        setExpenses([newExpense, ...expenses]);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await api.delete(`/expenses/${id}`);
                setExpenses(expenses.filter(exp => exp._id !== id));
            } catch (error) {
                console.error(error);
            }
        }
    };

    const filteredExpenses = filterCategory === 'All'
        ? expenses
        : expenses.filter(exp => exp.category === filterCategory);

    return (
        <Layout title="Expenses">
            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
                {/* Left Pane - Entry Form */}
                <div className="w-full lg:w-[380px] xl:w-[420px] h-full overflow-y-auto p-4 md:p-8 scrollbar-hide border-r border-gray-100 bg-white/50">
                    <ExpenseForm onExpenseAdded={handleExpenseAdded} />
                </div>

                {/* Right Pane - Transaction List */}
                <div className="flex-1 h-full overflow-y-auto p-4 md:p-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-gray-800 tracking-tight">Recent Expenses</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Manage and track your spending</p>
                            </div>

                            <div className="flex items-center space-x-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Filter:</span>
                                <select
                                    className="pl-3 pr-8 py-2 rounded-xl border-none bg-gray-50 text-sm font-black text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    <option value="All">All Categories</option>
                                    {defaultCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading transactions...</p>
                            </div>
                        ) : (
                            <ExpenseList expenses={filteredExpenses} onDelete={handleDelete} />
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Expenses;
