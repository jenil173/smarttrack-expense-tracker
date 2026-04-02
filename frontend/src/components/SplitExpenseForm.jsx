import React, { useState } from 'react';
import api from '../services/api';
import { Plus, Trash2, Users, IndianRupee, Mail, AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const SplitExpenseForm = ({ onSuccess }) => {
    const [description, setDescription] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [participants, setParticipants] = useState([
        { email: '', amount: '' }
    ]);
    const [loading, setLoading] = useState(false);
    const [splitType, setSplitType] = useState('equal'); // equal, manual
    const [searchResults, setSearchResults] = useState([]);
    const [activeSearchIndex, setActiveSearchIndex] = useState(null);

    const handleSearch = async (query, index) => {
        handleParticipantChange(index, 'email', query);
        if (query.length < 2) {
            setSearchResults([]);
            setActiveSearchIndex(null);
            return;
        }

        try {
            const res = await api.get(`/auth/search?q=${query}`);
            setSearchResults(res.data);
            setActiveSearchIndex(index);
        } catch (error) {
            console.error('Search failed', error);
        }
    };

    const selectUser = (user, index) => {
        handleParticipantChange(index, 'email', user.email);
        setSearchResults([]);
        setActiveSearchIndex(null);
    };

    const handleAddParticipant = () => {
        setParticipants([...participants, { email: '', amount: '' }]);
    };

    const handleRemoveParticipant = (index) => {
        const newParticipants = [...participants];
        newParticipants.splice(index, 1);
        setParticipants(newParticipants);
    };

    const handleParticipantChange = (index, field, value) => {
        const newParticipants = [...participants];
        newParticipants[index][field] = value;
        setParticipants(newParticipants);
    };

    const calculateEqualSplits = () => {
        if (!totalAmount || isNaN(totalAmount) || parseFloat(totalAmount) <= 0) {
            toast.error('Please enter a valid total amount first');
            return;
        }
        const count = participants.length + 1; // Participants + Payer
        const splitAmount = (parseFloat(totalAmount) / count).toFixed(2);
        
        const newParticipants = participants.map(p => ({
            ...p,
            amount: splitAmount
        }));
        setParticipants(newParticipants);
        setSplitType('equal');
        toast.success(`Split equally: ${splitAmount} each`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Basic validation
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        for (const p of participants) {
            if (!p.email || !p.amount) {
                toast.error('All participant fields are required');
                setLoading(false);
                return;
            }
            if (!emailRegex.test(p.email)) {
                toast.error(`Invalid email format: ${p.email}`);
                setLoading(false);
                return;
            }
        }

        try {
            await api.post('/splits', {
                totalAmount: parseFloat(totalAmount),
                description,
                participants: participants.map(p => ({
                    email: p.email,
                    amount: parseFloat(p.amount)
                }))
            });
            toast.success('Split expense shared successfully!');
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create split');
        } finally {
            setLoading(false);
        }
    };

    const totalSplit = participants.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
    const amountLeft = parseFloat(totalAmount || 0) - totalSplit;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Total Amount</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                        <input 
                            required 
                            type="number" 
                            step="0.01"
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                            placeholder="0.00"
                            value={totalAmount}
                            onChange={(e) => setTotalAmount(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                    <input 
                        required 
                        type="text" 
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                        placeholder="Dinner, Trip, Rent..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center">
                        <Users size={16} className="mr-2 text-primary" /> Participants
                    </h4>
                    <button 
                        type="button"
                        onClick={calculateEqualSplits}
                        className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all"
                    >
                        Split Equally
                    </button>
                </div>

                <div className="space-y-3">
                    {participants.map((p, idx) => (
                        <div key={idx} className="flex gap-3 items-center animate-in slide-in-from-top-2 duration-200">
                            <div className="flex-1 relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input 
                                    type="text" 
                                    required
                                    placeholder="Friend's email or name"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 outline-none text-sm font-bold focus:ring-2 focus:ring-primary/10"
                                    value={p.email}
                                    onChange={(e) => handleSearch(e.target.value, idx)}
                                    autoComplete="off"
                                />
                                {activeSearchIndex === idx && searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        {searchResults.map((user) => (
                                            <button
                                                key={user._id}
                                                type="button"
                                                onClick={() => selectUser(user, idx)}
                                                className="w-full px-4 py-3 text-left hover:bg-primary/5 transition-all border-b last:border-0 border-gray-50 flex flex-col"
                                            >
                                                <span className="text-xs font-black text-gray-800">{user.name || 'Anonymous'}</span>
                                                <span className="text-[10px] text-gray-400 font-bold">{user.email}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="w-32 relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">₹</span>
                                <input 
                                    type="number" 
                                    required
                                    placeholder="0"
                                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-100 outline-none text-sm font-bold focus:ring-2 focus:ring-primary/10"
                                    value={p.amount}
                                    onChange={(e) => handleParticipantChange(idx, 'amount', e.target.value)}
                                />
                            </div>
                            <button 
                                type="button" 
                                onClick={() => handleRemoveParticipant(idx)}
                                className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <button 
                    type="button" 
                    onClick={handleAddParticipant}
                    className="mt-4 w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all font-black text-[10px] uppercase tracking-widest"
                >
                    <Plus size={16} className="mr-2" /> Add Friend
                </button>
            </div>

            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-start gap-4">
                <Info size={18} className="text-primary mt-1 shrink-0" />
                <div className="text-[11px] font-bold text-gray-600 leading-relaxed">
                    <p>Financial Transparency:</p>
                    <ul className="list-disc ml-4 mt-1 space-y-1">
                        <li>You (the payer) are responsible for ₹{amountLeft.toFixed(2)}.</li>
                        <li>Existing SmartTrack users will be notified automatically in-app.</li>
                        <li>External emails will receive a special invitation link to join.</li>
                    </ul>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading || Math.abs(amountLeft) < 0}
                className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-3"
            >
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>{loading ? 'Creating Split...' : 'Invite & Split Billing'}</span>
            </button>
        </form>
    );
};

export default SplitExpenseForm;
