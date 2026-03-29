import React from 'react';
import { ShieldCheck, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { formatCurrency } from '../utils/currencyFormatter';

const FinancialHealthAudit = ({ income = 0, expense = 0, balance = 0 }) => {
    // 1. Savings Rate Calculation
    const savings = Math.max(0, income - expense);
    const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

    // 2. Survival Buffer (Emergency Fund Status)
    // How many months of current expenses are covered by current balance
    const survivalMonths = expense > 0 ? (balance / expense).toFixed(1) : (balance > 0 ? "Infinite" : "0");

    // 3. Grading Logic
    let grade = 'C';
    let gradeColor = 'text-red-500';
    let gradeBg = 'bg-red-50';
    let message = 'Your savings rate is low. Try auditing your recurring subscriptions.';

    if (savingsRate >= 40) {
        grade = 'A';
        gradeColor = 'text-green-500';
        gradeBg = 'bg-green-50';
        message = 'Exceptional financial discipline! You are on the fast track to wealth.';
    } else if (savingsRate >= 20) {
        grade = 'B';
        gradeColor = 'text-blue-500';
        gradeBg = 'bg-blue-50';
        message = 'Solid savings rate. Consider investing your surplus for long-term growth.';
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <ShieldCheck className="mr-2 text-primary" size={20} />
                    Financial Health Audit
                </h3>
                <div className={`${gradeBg} ${gradeColor} h-12 w-12 rounded-2xl flex items-center justify-center text-2xl font-black shadow-sm`}>
                    {grade}
                </div>
            </div>

            <div className="space-y-6 flex-1">
                <div>
                    <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                        <span>Savings Rate</span>
                        <span className={gradeColor}>{savingsRate}%</span>
                    </div>
                    <div className="w-full bg-gray-50 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className={`h-full ${grade === 'A' ? 'bg-green-500' : grade === 'B' ? 'bg-blue-500' : 'bg-red-500'} transition-all duration-1000`} 
                            style={{ width: `${Math.min(100, savingsRate)}%` }}
                        ></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Survival Buffer</p>
                        <p className="text-lg font-black text-gray-800">{survivalMonths} <span className="text-[10px] text-gray-400">Months</span></p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Net Surplus</p>
                        <p className="text-lg font-black text-gray-800">{formatCurrency(savings).split('.')[0]}</p>
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex items-start">
                    <Info size={16} className="text-primary mt-0.5 mr-3 shrink-0" />
                    <p className="text-xs font-bold text-gray-600 leading-relaxed italic">
                        "{message}"
                    </p>
                </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-dashed border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Data-Driven Wellness Score</p>
            </div>
        </div>
    );
};

export default FinancialHealthAudit;
