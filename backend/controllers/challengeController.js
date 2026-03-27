const Challenge = require('../models/Challenge');
const Expense = require('../models/Expense');

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
        const { title, description, type, targetAmount, endDate } = req.body;

        if (!title || !endDate) {
            return res.status(400).json({ message: 'Please provide title and end date' });
        }

        const challenge = await Challenge.create({
            user: req.user.id,
            title,
            description,
            type,
            targetAmount,
            endDate
        });

        res.status(201).json(challenge);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update challenge progress (can be called periodically or manually)
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

        // Logic to calculate progress based on type
        if (challenge.type === 'Savings') {
            // For savings, we could look at total income - total expense since start
            const expenses = await Expense.find({
                user: req.user.id,
                date: { $gte: challenge.startDate, $lte: new Date() }
            });
            const Income = require('../models/Income');
            const incomes = await Income.find({
                user: req.user.id,
                date: { $gte: challenge.startDate, $lte: new Date() }
            });

            const totalSpent = expenses.reduce((a, b) => a + b.amount, 0);
            const totalEarned = incomes.reduce((a, b) => a + b.amount, 0);
            challenge.currentAmount = totalEarned - totalSpent;
        } else if (challenge.type === 'No Shopping') {
            // Check if any shopping expenses occurred
            const shoppingExpenses = await Expense.find({
                user: req.user.id,
                category: 'Shopping',
                date: { $gte: challenge.startDate, $lte: new Date() }
            });
            if (shoppingExpenses.length > 0) {
                challenge.status = 'failed';
            }
        }

        // Check if completed
        if (challenge.status === 'active') {
            if (challenge.type === 'Savings' && challenge.currentAmount >= challenge.targetAmount) {
                challenge.status = 'completed';
            } else if (new Date() > new Date(challenge.endDate)) {
                if (challenge.type === 'Savings' && challenge.currentAmount < challenge.targetAmount) {
                    challenge.status = 'failed';
                } else {
                    challenge.status = 'completed'; // For No Shopping if no failure till end
                }
            }
        }

        await challenge.save();
        res.status(200).json(challenge);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getChallenges,
    createChallenge,
    updateChallengeProgress
};
