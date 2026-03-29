import React, { useState } from 'react';
import api from '../services/api';

const IncomeForm = ({ onIncomeAdded }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [source, setSource] = useState('');
    const [date, setDate] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [warning, setWarning] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const defaultSources = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setWarning('');
        setSuccessMessage('');
        try {
            const res = await api.post('/income', {
                title,
                amount: Number(amount),
                source,
                date: date || new Date().toISOString(),
                note
            });

            setSuccessMessage('Income added successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);

            onIncomeAdded(res.data);
            // Reset form
            setTitle(''); setAmount(''); setSource(''); setDate(''); setNote('');
        } catch (error) {
            console.error(error);
            setWarning('Failed to add income. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {warning && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl">
                    <p className="text-sm font-medium text-orange-800">{warning}</p>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl">
                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
            )}

            {/* Manual Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Add Income</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input required type="text" className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-2.5 text-gray-400 bg-white group-focus-within:text-primary transition-colors">₹</span>
                                <input 
                                    required 
                                    type="number" 
                                    min="0" 
                                    step="0.01" 
                                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-gray-700" 
                                    value={amount} 
                                    onChange={(e) => setAmount(e.target.value)} 
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                            <select required className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none" value={source} onChange={(e) => setSource(e.target.value)}>
                                <option value="" disabled>Select Source</option>
                                {defaultSources.map(src => (
                                    <option key={src} value={src}>{src}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input type="date" className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                        <textarea className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none" rows="2" value={note} onChange={(e) => setNote(e.target.value)}></textarea>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-70 flex justify-center items-center">
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        ) : null}
                        {loading ? 'Adding Income...' : 'Add Income'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default IncomeForm;
