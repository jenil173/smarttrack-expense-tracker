import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Download, Mail, FileText, FileSpreadsheet } from 'lucide-react';
import { formatCurrency as formatINR } from '../utils/currencyFormatter';

const Reports = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await api.get('/expenses/summary');
                setSummary(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    const showMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleDownloadPDF = async () => {
        setActionLoading(true);
        try {
            const res = await api.post('/reports/export-pdf', {}, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'financial_report.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            showMessage('PDF downloaded successfully!');
        } catch (error) {
            showMessage('Failed to download PDF.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEmailPDF = async () => {
        setActionLoading(true);
        try {
            await api.post('/reports/email-report');
            showMessage('Report emailed successfully!');
        } catch (error) {
            showMessage('Failed to email report.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDownloadCSV = async () => {
        setActionLoading(true);
        try {
            const res = await api.get('/reports/export-csv', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'financial_data.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            showMessage('CSV downloaded successfully!');
        } catch (error) {
            showMessage('Failed to download CSV.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Financial Reports">
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Financial Reports">
            {message && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 flex items-center shadow-sm border border-green-100">
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Summary Box */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                        <FileText className="mr-3 text-primary" /> Monthly Summary
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-500">Total Income</span>
                            <span className="font-bold text-green-600">{formatINR(summary?.totalIncome)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-500">Total Expense</span>
                            <span className="font-bold text-red-500">{formatINR(summary?.totalExpense)}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="text-gray-500">Net Savings</span>
                            <span className="font-bold text-blue-600">{formatINR(summary?.savings)}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                            <span className="text-gray-500 font-bold">Health Score</span>
                            <span className="font-bold text-purple-600">{summary?.healthScore} / 100</span>
                        </div>
                    </div>
                </div>

                {/* Export Actions Box */}
                <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 p-8 rounded-2xl shadow-sm border border-primary/10 flex flex-col justify-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Export Options</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={handleDownloadPDF} disabled={actionLoading}
                            className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center disabled:opacity-50">
                            <FileText size={18} className="mr-2" /> PDF
                        </button>
                        <button
                            onClick={handleEmailPDF} disabled={actionLoading}
                            className="bg-primary hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center disabled:opacity-50">
                            <Mail size={18} className="mr-2" /> Email PDF
                        </button>
                        <button
                            onClick={handleDownloadCSV} disabled={actionLoading}
                            className="bg-white hover:bg-green-50 text-green-600 border border-green-200 font-bold py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center sm:col-span-2 disabled:opacity-50">
                            <FileSpreadsheet size={18} className="mr-2" /> Download CSV / Excel
                        </button>
                    </div>
                </div>
            </div>

            {/* Category Breakdown Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">Category Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount Spent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {summary?.categoryData && Object.entries(summary.categoryData).map(([cat, amt]) => (
                                <tr key={cat} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{cat}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right">{formatINR(amt)}</td>
                                </tr>
                            ))}
                            {(!summary?.categoryData || Object.keys(summary.categoryData).length === 0) && (
                                <tr>
                                    <td colSpan="2" className="px-6 py-8 text-center text-gray-500">No category data available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default Reports;
