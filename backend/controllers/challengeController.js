const Challenge = require('../models/Challenge');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const mongoose = require('mongoose');

// @desc    Get all challenges for a user
// @route   GET /api/challenges
// @access  Private
const getChallenges = async (req, res) => {
    try {
        const challenges = await Challenge.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(challenges);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new challenge
// @route   POST /api/challenges
// @access  Private
const createChallenge = async (req, res) => {
    try {
        const { title, description, type, targetAmount, endDate, startDate } = req.body;

        if (!title || !endDate) {
            return res.status(400).json({ message: 'Please provide title and end date' });
        }

        // Normalize Start Date to 00:00:00 to be inclusive of the entire day
        const normalizedStart = startDate ? new Date(startDate) : new Date();
        normalizedStart.setHours(0, 0, 0, 0);

        const challenge = await Challenge.create({
            user: req.user.id,
            title,
            description,
            type,
            targetAmount,
            startDate: normalizedStart,
            endDate
        });

        res.status(201).json(challenge);
    } catch (error) {
        console.error('Create Challenge Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update challenge progress
// @route   PUT /api/challenges/:id/progress
// @access  Private
const updateChallengeProgress = async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        if (challenge.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const userId = new mongoose.Types.ObjectId(req.user.id);
        const startFilter = new Date(challenge.startDate);
        const now = new Date();

        // Logic to calculate progress
        if (challenge.type === 'Savings') {
            const expenses = await Expense.find({
                user: userId,
                date: { $gte: startFilter, $lte: now }
            });
            const incomes = await Income.find({
                user: userId,
                date: { $gte: startFilter, $lte: now }
            });

            const totalSpent = expenses.reduce((a, b) => a + b.amount, 0);
            const totalEarned = incomes.reduce((a, b) => a + b.amount, 0);
            challenge.currentAmount = totalEarned - totalSpent;

            console.log(`Challenge ${challenge.title}: Earned=${totalEarned}, Spent=${totalSpent}, Result=${challenge.currentAmount}`);
        } else if (challenge.type === 'No Shopping') {
            const shoppingExpenses = await Expense.find({
                user: userId,
                category: 'Shopping',
                date: { $gte: startFilter, $lte: now }
            });
            if (shoppingExpenses.length > 0) {
                challenge.status = 'failed';
            }
        }

        // Status Management
        const endOfDay = new Date(challenge.endDate);
        endOfDay.setHours(23, 59, 59, 999);

        if (now <= endOfDay) {
            if (challenge.type === 'Savings' && challenge.currentAmount >= challenge.targetAmount) {
                challenge.status = 'completed';
            } else {
                challenge.status = 'active'; // Recover from premature failure if still within timeframe
            }
        } else {
            if (challenge.type === 'Savings' && challenge.currentAmount < challenge.targetAmount) {
                challenge.status = 'failed';
            } else {
                challenge.status = 'completed';
            }
        }

        await challenge.save();
        res.status(200).json(challenge);
    } catch (error) {
        console.error('Update Progress Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getChallenges,
    createChallenge,
    updateChallengeProgress
};
