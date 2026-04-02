import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { Download, Mail, FileText, FileSpreadsheet, Plus, X, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency as formatINR } from '../utils/currencyFormatter';

const Reports = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [recipients, setRecipients] = useState([]); // Array of { email, name, isUser }
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
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

    const handleSearch = async (val) => {
        setSearchQuery(val);
        if (val.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }
        try {
            const res = await api.get(`/auth/search?q=${val}`);
            setSearchResults(res.data);
            setShowResults(true);
        } catch (error) {
            console.error('Search failed', error);
        }
    };

    const addRecipient = (email, name = null, isUser = false) => {
        const cleanEmail = email.toLowerCase().trim();
        if (!cleanEmail) return;
        
        // Basic email validation
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(cleanEmail)) {
            toast.error('Invalid email format');
            return;
        }

        // Duplicate check
        if (recipients.some(r => r.email === cleanEmail)) {
            toast.error('Email already added');
            setSearchQuery('');
            setShowResults(false);
            return;
        }

        setRecipients([...recipients, { email: cleanEmail, name, isUser }]);
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
    };

    const removeRecipient = (email) => {
        setRecipients(recipients.filter(r => r.email !== email));
    };

    const handleEmailPDF = async () => {
        const emailList = recipients.map(r => r.email);
        
        // If list is empty, it will default to sending to current user in backend
        
        setActionLoading(true);
        try {
            await api.post('/reports/email-report', { recipients: emailList });
            showMessage(emailList.length > 0 ? `Report sent to ${emailList.join(', ')}` : 'Report sent to your email!');
            setRecipients([]);
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
                    
                    {/* Smart Recipients Input */}
                    <div className="mb-6">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Send to Recipients (Optional)</label>
                        
                        {/* Selected Tags */}
                        {recipients.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {recipients.map(r => (
                                    <div key={r.email} className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl border text-xs font-bold transition-all ${r.isUser ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                                        <span className="flex items-center gap-1.5">
                                            {r.name || r.email.split('@')[0]}
                                            {r.isUser && <CheckCircle2 size={12} className="text-indigo-500" title="Registered SmartTrack User" />}
                                        </span>
                                        <button 
                                            onClick={() => removeRecipient(r.email)}
                                            className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="relative">
                            <input 
                                type="text"
                                placeholder="Type a name or email..."
                                className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-sm font-bold bg-white/80 backdrop-blur-sm"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        addRecipient(searchQuery);
                                    }
                                }}
                                autoComplete="off"
                            />
                            {showResults && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    {searchResults.map(res => (
                                        <button
                                            key={res._id}
                                            onClick={() => addRecipient(res.email, res.name, true)}
                                            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-primary/5 transition-all text-left border-b border-gray-50 last:border-0 group"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-800 group-hover:text-primary transition-colors">{res.name}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{res.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md uppercase tracking-tighter">Existing Account</span>
                                                <Plus size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

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
