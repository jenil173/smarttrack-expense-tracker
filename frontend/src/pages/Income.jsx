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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <IncomeForm onIncomeAdded={handleIncomeAdded} />
                </div>

                <div className="lg:col-span-2">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Income</h3>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <IncomeList incomes={incomes} onDelete={handleDelete} />
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default IncomePage;
