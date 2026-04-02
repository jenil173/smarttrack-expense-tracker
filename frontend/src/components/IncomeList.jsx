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
                    <tbody className="divide-y divide-gray-100/50">
                        {incomes.map((income) => (
                            <tr key={income._id} className="hover:bg-gray-50/80 transition-all group/row">
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-gray-800 group-hover/row:text-primary transition-colors">{income.title}</span>
                                        {income.note && <span className="text-[10px] font-bold text-gray-400 mt-0.5 line-clamp-1 max-w-[200px]">{income.note}</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-700 border border-green-100">
                                        {income.source || 'Other'}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center text-xs font-bold text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg w-fit border border-gray-100">
                                        <Calendar size={12} className="mr-2 text-gray-400" />
                                        {new Date(income.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-sm font-black text-green-600 text-right tabular-nums">
                                    {formatINR(income.amount)}
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button
                                        onClick={() => onDelete(income._id)}
                                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all p-2.5 rounded-xl group/del"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} className="group-hover/del:scale-110 transition-transform" />
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
