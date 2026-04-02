import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import IncomeForm from '../components/IncomeForm';
import IncomeList from '../components/IncomeList';
import api from '../services/api';

const IncomePage = () => {
    const [incomes, setIncomes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchIncomes = async () => {
        try {
            const res = await api.get('/income');
            setIncomes(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncomes();
    }, []);

    const handleIncomeAdded = (newIncome) => {
        setIncomes([newIncome, ...incomes]);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this income?')) {
            try {
                await api.delete(`/income/${id}`);
                setIncomes(incomes.filter(inc => inc._id !== id));
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <Layout title="Income">
            <div className="flex flex-col lg:flex-row h-full overflow-hidden">
                {/* Left Pane - Entry Form */}
                <div className="w-full lg:w-[380px] xl:w-[420px] h-full overflow-y-auto p-4 md:p-8 scrollbar-hide border-r border-gray-100 bg-white/50">
                    <IncomeForm onIncomeAdded={handleIncomeAdded} />
                </div>

                {/* Right Pane - Transaction List */}
                <div className="flex-1 h-full overflow-y-auto p-4 md:p-8 text-center sm:text-left">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Recent Income</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Track your earnings and inflows</p>
                        </div>
                        
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading records...</p>
                            </div>
                        ) : (
                            <IncomeList incomes={incomes} onDelete={handleDelete} />
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default IncomePage;
