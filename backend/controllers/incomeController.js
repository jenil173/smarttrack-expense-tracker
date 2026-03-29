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

        if (Number(amount) <= 0) {
            return res.status(400).json({ message: 'Amount must be a positive value' });
        }

        const income = await Income.create({
            user: req.user.id,
            title,
            amount,
            source: source || 'Other',
            date: date || Date.now(),
            note
        });

        console.log(`[INCOME] Created: ₹${amount} for ${req.user.email} (Source: ${source})`);

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
        console.log(`[INCOME] Deleted: ID ${req.params.id} for user ${req.user.id}`);
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

// @desc    Parse an income via Natural Language (NLP)
// @route   POST /api/income/nlp
// @access  Private
const addIncomeNLP = async (req, res) => {
    try {
        const { text } = req.body;
        const amountMatch = text.match(/\d+(\.\d+)?/);
        const amount = amountMatch ? parseFloat(amountMatch[0]) : 0;

        let source = 'Other';
        const lowerText = text.toLowerCase();

        // Auto Source Suggestion based on keywords
        if (lowerText.includes('salary') || lowerText.includes('paycheck') || lowerText.includes('wage')) source = 'Salary';
        else if (lowerText.includes('freelance') || lowerText.includes('project') || lowerText.includes('gig')) source = 'Freelance';
        else if (lowerText.includes('invest') || lowerText.includes('dividen') || lowerText.includes('stock') || lowerText.includes('crypto')) source = 'Investment';
        else if (lowerText.includes('business') || lowerText.includes('sale') || lowerText.includes('client')) source = 'Business';
        else if (lowerText.includes('gift') || lowerText.includes('birthday') || lowerText.includes('present')) source = 'Gift';

        if (amount === 0) {
            return res.status(200).json({ recognized: false, message: 'Could not understand amount' });
        }

        // Clean up title
        let title = text;
        if (amountMatch) {
            title = title.replace(amountMatch[0], '');
        }
        title = title.replace(/^(received\s+|got\s+|earned\s+)/i, '');
        title = title.replace(/\s+(from|on|rs|rupees)\s*$/i, '');
        title = title.replace(/\s+/g, ' ').trim();
        if (title.length > 0) {
            title = title.charAt(0).toUpperCase() + title.slice(1);
        } else {
            title = 'Income Entry';
        }

        res.status(200).json({
            title: title.substring(0, 50),
            amount,
            source
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getIncomes,
    addIncome,
    deleteIncome,
    updateIncome,
    addIncomeNLP
};
