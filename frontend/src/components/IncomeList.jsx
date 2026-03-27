import React from 'react';
import { Trash2, Calendar } from 'lucide-react';
import { formatCurrency as formatINR } from '../utils/currencyFormatter';

const IncomeList = ({ incomes, onDelete }) => {
    if (!incomes || incomes.length === 0) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                <p className="text-gray-500">No incomes recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {incomes.map((income) => (
                            <tr key={income._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="text-sm font-medium text-gray-800">{income.title}</p>
                                    {income.note && <p className="text-xs text-gray-500 truncate max-w-xs">{income.note}</p>}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                        {income.source || 'Other'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 flex items-center">
                                    <Calendar size={14} className="mr-2 text-gray-400" />
                                    {new Date(income.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-green-600 text-right">
                                    {formatINR(income.amount)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => onDelete(income._id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IncomeList;
