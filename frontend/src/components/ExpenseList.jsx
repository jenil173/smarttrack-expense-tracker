import React, { useContext } from 'react';
import { Trash2, Edit3, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/currencyFormatter';
import { AuthContext } from '../context/AuthContext';

const ExpenseList = ({ expenses, onDelete }) => {
    const { currencyConfig } = useContext(AuthContext);
    if (!expenses || expenses.length === 0) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                <p className="text-gray-500">No expenses recorded yet.</p>
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
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {expenses.map((expense) => (
                            <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="text-sm font-medium text-gray-800">{expense.title}</p>
                                    {expense.note && <p className="text-xs text-gray-500 truncate max-w-xs">{expense.note}</p>}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                        {expense.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 flex items-center">
                                    <Calendar size={14} className="mr-2 text-gray-400" />
                                    {new Date(expense.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right">
                                    {formatCurrency(expense.amount, currencyConfig)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => onDelete(expense._id)}
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

export default ExpenseList;
