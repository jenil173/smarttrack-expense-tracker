import React, { useState, useCallback } from 'react';
import api from '../services/api';
import { debounce } from 'lodash';
import { Sparkles, Wand2 } from 'lucide-react';

const IncomeForm = ({ onIncomeAdded }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [source, setSource] = useState('');
    const [date, setDate] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [nlpLoading, setNlpLoading] = useState(false);
    const [detectedValues, setDetectedValues] = useState(null);
    const [warning, setWarning] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleNlpSearch = useCallback(
        debounce(async (text) => {
            if (text.length < 5) {
                setDetectedValues(null);
                return;
            }
            try {
                setNlpLoading(true);
                const res = await api.post('/income/nlp', { text });
                if (res.data && res.data.amount && res.data.recognized !== false) {
                    setDetectedValues(res.data);
                } else {
                    setDetectedValues(null);
                }
            } catch (error) {
                console.error('NLP Error:', error);
            } finally {
                setNlpLoading(false);
            }
        }, 1000),
        []
    );

    const applySmartEntry = () => {
        if (detectedValues) {
            setTitle(detectedValues.title);
            setAmount(detectedValues.amount);
            setSource(detectedValues.source);
            setDetectedValues(null);
        }
    };

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
            {/* Smart Entry Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-[2rem] border border-green-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Wand2 size={80} className="text-green-600" />
                </div>
                <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center relative z-10">
                    <Sparkles className="mr-2 text-green-600" size={20} />
                    Smart Income Entry
                </h3>
                <p className="text-xs font-bold text-gray-500 mb-4 relative z-10 uppercase tracking-widest">Type naturally: "Got 5000 from freelance"</p>
                <div className="flex flex-col md:flex-row gap-3 relative z-10">
                    <input 
                        type="text" 
                        className="flex-1 px-4 py-3 rounded-xl border border-white bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-green-500/20 outline-none font-bold text-gray-700 placeholder:text-gray-400"
                        placeholder="What income did you receive?"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            handleNlpSearch(e.target.value);
                        }}
                    />
                    {detectedValues && (
                        <button 
                            type="button"
                            onClick={applySmartEntry}
                            className="bg-green-600 hover:bg-green-700 text-white font-black px-6 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center animate-in zoom-in duration-300"
                        >
                            <Sparkles size={16} className="mr-2" /> Apply Magic
                        </button>
                    )}
                </div>

                {nlpLoading && (
                    <div className="mt-3 flex items-center text-xs font-bold text-green-600 animate-pulse">
                        <div className="h-1.5 w-1.5 bg-green-600 rounded-full mr-2"></div>
                        Analyzing your income...
                    </div>
                )}

                {detectedValues && !nlpLoading && (
                    <div className="mt-4 p-3 bg-white/60 backdrop-blur-md rounded-xl border border-white/50 animate-in fade-in slide-in-from-top-2 duration-500">
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Detected</p>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center text-sm font-black text-gray-800">
                                <span className="text-gray-400 mr-1">Amount:</span> ₹{detectedValues.amount}
                            </div>
                            <div className="flex items-center text-sm font-black text-gray-800">
                                <span className="text-gray-400 mr-1">Source:</span> {detectedValues.source}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {warning && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl animate-in slide-in-from-left duration-300">
                    <p className="text-sm font-black text-orange-800">{warning}</p>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl animate-in slide-in-from-left duration-300">
                    <p className="text-sm font-black text-green-800">{successMessage}</p>
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
