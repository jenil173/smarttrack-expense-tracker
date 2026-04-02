import React, { useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { debounce } from 'lodash';
import { Sparkles, Wand2, Plus, FileText } from 'lucide-react';

const ExpenseForm = ({ onExpenseAdded }) => {
    const { currencySymbol } = useContext(AuthContext);
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [note, setNote] = useState('');
    const [mood, setMood] = useState('Neutral');
    const [nlpText, setNlpText] = useState('');
    const [detectedValues, setDetectedValues] = useState(null);
    const [loading, setLoading] = useState(false);
    const [nlpLoading, setNlpLoading] = useState(false);
    const [warning, setWarning] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const defaultCategories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setWarning('');
        setSuccessMessage('');
        try {
            const res = await api.post('/expenses', {
                title,
                amount: Number(amount),
                category,
                date: date || new Date().toISOString(),
                note,
                mood
            });

            if (res.data.warning) {
                setWarning(res.data.warning);
            } else {
                setSuccessMessage('Expense added successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            }

            onExpenseAdded(res.data.expense);
            // Reset form
            setTitle(''); setAmount(''); setCategory(''); setDate(''); setNote(''); setMood('Neutral');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Memoized debounced NLP function
    const debouncedNLP = useCallback(
        debounce(async (text) => {
            if (!text || text.length < 5) {
                setNlpText('');
                setDetectedValues(null);
                return;
            }
            try {
                setNlpLoading(true);
                const res = await api.post('/expenses/nlp', { text });
                if (res.data && res.data.amount && res.data.recognized !== false) {
                    setDetectedValues(res.data);
                    setNlpText(text);
                } else {
                    setDetectedValues(null);
                    setNlpText('');
                }
            } catch (error) {
                console.error('NLP Error:', error);
            } finally {
                setNlpLoading(false);
            }
        }, 1000),
        []
    );

    useEffect(() => {
        debouncedNLP(title);
    }, [title, debouncedNLP]);

    const applySmartEntry = () => {
        if (!detectedValues) return;
        setTitle(detectedValues.title);
        setAmount(detectedValues.amount);
        setCategory(detectedValues.category);
        setDetectedValues(null);
        setNlpText('');
        setSuccessMessage('Auto-filled from smart detection!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    return (
        <div className="space-y-6">
            {/* Smart Entry Section */}
            <div className="bg-gradient-to-br from-primary/10 to-purple-50 p-6 rounded-[2rem] border border-primary/20 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Wand2 size={80} className="text-primary" />
                </div>
                <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center relative z-10">
                    <Sparkles className="mr-2 text-primary" size={20} />
                    Smart Entry
                </h3>
                <p className="text-xs font-bold text-gray-500 mb-4 relative z-10 uppercase tracking-widest">Type naturally: "Spent 500 on groceries"</p>
                <div className="flex flex-col md:flex-row gap-3 relative z-10">
                    <input 
                        type="text" 
                        className="flex-1 px-4 py-3 rounded-xl border border-white bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-700 placeholder:text-gray-400"
                        placeholder="What did you spend on?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    {detectedValues && (
                        <button 
                            type="button"
                            onClick={applySmartEntry}
                            className="bg-primary hover:bg-purple-600 text-white font-black px-6 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center animate-in zoom-in duration-300"
                        >
                            <Sparkles size={16} className="mr-2" /> Apply Magic
                        </button>
                    )}
                </div>

                {nlpLoading && (
                    <div className="mt-3 flex items-center text-xs font-bold text-primary animate-pulse">
                        <div className="h-1.5 w-1.5 bg-primary rounded-full mr-2"></div>
                        Analyzing your input...
                    </div>
                )}

                {detectedValues && !nlpLoading && (
                    <div className="mt-4 p-3 bg-white/60 backdrop-blur-md rounded-xl border border-white/50 animate-in fade-in slide-in-from-top-2 duration-500">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Detected</p>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center text-sm font-black text-gray-800">
                                <span className="text-gray-400 mr-1">Amount:</span> ₹{detectedValues.amount}
                            </div>
                            <div className="flex items-center text-sm font-black text-gray-800">
                                <span className="text-gray-400 mr-1">Category:</span> {detectedValues.category}
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
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 transition-all hover:shadow-md group">
                <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center">
                    <FileText className="mr-2 text-primary opacity-50 group-hover:opacity-100 transition-opacity" size={20} />
                    Manual Entry
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Title</label>
                        <input 
                            required 
                            type="text" 
                            placeholder="e.g., Weekly Groceries"
                            className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Amount</label>
                            <div className="relative group/amount">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold group-focus-within/amount:text-primary transition-colors">₹</span>
                                <input 
                                    required 
                                    type="number" 
                                    min="0" 
                                    step="0.01" 
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-5 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300" 
                                    value={amount} 
                                    onChange={(e) => setAmount(e.target.value)} 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                            <select 
                                required 
                                className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer" 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="" disabled>Select Category</option>
                                {defaultCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Date</label>
                        <input 
                            type="date" 
                            className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all font-bold text-gray-700 cursor-pointer" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Note (Optional)</label>
                        <textarea 
                            placeholder="Add some details..."
                            className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300 resize-none" 
                            rows="2" 
                            value={note} 
                            onChange={(e) => setNote(e.target.value)}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">How did you feel about this expense?</label>
                        <div className="flex gap-3">
                            {[
                                { id: 'Happy', label: 'Happy', emoji: '😊', color: 'green' },
                                { id: 'Neutral', label: 'Neutral', emoji: '😐', color: 'blue' },
                                { id: 'Stressed', label: 'Stressed', emoji: '😰', color: 'red' }
                            ].map((m) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setMood(m.id)}
                                    className={`flex-1 py-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                                        mood === m.id 
                                        ? `border-primary bg-primary/5 text-primary scale-[1.02] shadow-sm` 
                                        : 'border-gray-50 bg-gray-50/50 text-gray-400 hover:border-gray-200'
                                    }`}
                                >
                                    <span className="text-lg">{m.emoji}</span>
                                    <span className="text-[10px] font-black uppercase tracking-tighter">{m.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-2xl transition-all shadow-xl hover:shadow-2xl disabled:opacity-70 flex justify-center items-center gap-2 mt-4 active:scale-95"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <Plus size={20} />
                        )}
                        {loading ? 'Processing...' : 'Save Expense'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ExpenseForm;
