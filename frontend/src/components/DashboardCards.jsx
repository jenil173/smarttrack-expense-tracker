import React, { useContext } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Activity, PiggyBank } from 'lucide-react';
import { formatCurrency } from '../utils/currencyFormatter';
import { AuthContext } from '../context/AuthContext';

const DashboardCards = ({ income, expense, balance, savings, healthScore }) => {
    const { currencyConfig } = useContext(AuthContext);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Balance Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center shadow-primary/5">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <Wallet className="text-primary" size={24} />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Balance</p>
                    <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(balance, currencyConfig)}</h3>
                </div>
            </div>

            {/* Income Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center shadow-green-500/5">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                    <ArrowUpCircle className="text-green-500" size={24} />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Income</p>
                    <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(income, currencyConfig)}</h3>
                </div>
            </div>

            {/* Expense Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center shadow-red-500/5">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                    <ArrowDownCircle className="text-red-500" size={24} />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Expense</p>
                    <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(expense, currencyConfig)}</h3>
                </div>
            </div>

            {/* Savings Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center shadow-blue-500/5">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <PiggyBank className="text-blue-500" size={24} />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Savings (This Month)</p>
                    <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(savings, currencyConfig)}</h3>
                </div>
            </div>

            {/* Health Score Card */}
            <div className="bg-gradient-to-br from-primary to-purple-500 rounded-2xl p-6 shadow-md flex items-center text-white">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mr-4 backdrop-blur-sm">
                    <Activity size={24} />
                </div>
                <div>
                    <p className="text-sm font-medium text-white/80 mb-1">Health Score</p>
                    <div className="flex items-baseline space-x-1">
                        <h3 className="text-2xl font-bold">{healthScore || 0}</h3>
                        <span className="text-sm text-white/70">/ 100</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardCards;
