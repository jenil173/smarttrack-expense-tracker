const Income = require('../models/Income');

// @desc    Get all incomes for a user
// @route   GET /api/income
// @access  Private
const getIncomes = async (req, res) => {
    try {
        const incomes = await Income.find({ user: req.user.id }).sort({ date: -1 });
        res.status(200).json(incomes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add an income
// @route   POST /api/income
// @access  Private
const addIncome = async (req, res) => {
    try {
        const { title, amount, date, source, note } = req.body;

        if (!title || !amount) {
            return res.status(400).json({ message: 'Please provide title and amount' });
        }

        const income = await Income.create({
            user: req.user.id,
            title,
            amount,
            source: source || 'Other',
            date: date || Date.now(),
            note
        });

        const Notification = require('../models/Notification');
        await Notification.create({
            user: req.user.id,
            title: 'Income Added',
            message: `You added an income of ₹${amount}.`,
            type: 'success'
        });

        res.status(201).json(income);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete an income
// @route   DELETE /api/income/:id
// @access  Private
const deleteIncome = async (req, res) => {
    try {
        const income = await Income.findById(req.params.id);

        if (!income) {
            return res.status(404).json({ message: 'Income not found' });
        }

        // Check for user
        if (income.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await income.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update an income
// @route   PUT /api/income/:id
// @access  Private
const updateIncome = async (req, res) => {
    try {
        const income = await Income.findById(req.params.id);

        if (!income) {
            return res.status(404).json({ message: 'Income not found' });
        }

        if (income.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedIncome = await Income.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedIncome);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getIncomes,
    addIncome,
    deleteIncome,
    updateIncome
};
