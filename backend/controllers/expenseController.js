const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Notification = require('../models/Notification');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add an expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
    try {
        let { title, amount, category, date, note, mood } = req.body;

        if (!title || !amount || !category) {
            return res.status(400).json({ message: 'Please provide title, amount, and category' });
        }

        if (Number(amount) <= 0) {
            return res.status(400).json({ message: 'Amount must be a positive value' });
        }

        const expense = await Expense.create({
            user: req.user.id,
            title,
            amount,
            category,
            date: date || Date.now(),
            note,
            mood: mood || 'Neutral'
        });

        // Create standard 'Expense Added' notification
        await Notification.create({
            user: req.user.id,
            title: 'Expense Added',
            message: `You added an expense of ₹${amount} for ${category}.`,
            type: 'info'
        });

        // Check budget limit warning
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        const monthlyBudget = user.monthlyBudget || 0;

        let warning = null;
        if (monthlyBudget > 0) {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const startOfMonth = new Date(currentYear, currentMonth, 1);
            const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

            const monthlyExpenses = await Expense.find({
                user: req.user.id,
                date: { $gte: startOfMonth, $lte: endOfMonth }
            });

            const totalExpense = monthlyExpenses.reduce((acc, curr) => acc + curr.amount, 0);
            const expensePercentage = (totalExpense / monthlyBudget) * 100;

            if (expensePercentage >= 100) {
                warning = 'Budget reached 100%! You have exceeded your monthly budget.';
            } else if (expensePercentage >= 90) {
                warning = 'Budget reached 90%! Critical warning, nearing limit.';
            } else if (expensePercentage >= 70) {
                warning = 'Budget reached 70%. Be careful with your spending.';
            }

            if (warning) {
                // To avoid spamming, only send warning if it's significant (e.g. crossing a threshold)
                // For simplicity, we just create it here:
                await Notification.create({
                    user: req.user.id,
                    title: 'Budget Warning',
                    message: warning,
                    type: 'warning'
                });
            }
        }

        res.status(201).json({ expense, warning });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedExpense);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await expense.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add an expense via Natural Language (NLP)
// @route   POST /api/expenses/nlp
// @access  Private
const addExpenseNLP = async (req, res) => {
    try {
        const { text } = req.body;
        // VERY simple parser: "Spent 200 on food"
        // matches digit array, takes the first one as amount
        const amountMatch = text.match(/\d+(\.\d+)?/);
        const amount = amountMatch ? parseFloat(amountMatch[0]) : 0;

        let category = 'Other';
        const lowerText = text.toLowerCase();

        // Auto Category Suggestion based on keywords
        if (lowerText.includes('food') || lowerText.includes('meal') || lowerText.includes('lunch') || lowerText.includes('dinner') || lowerText.includes('grocer')) category = 'Food';
        else if (lowerText.includes('travel') || lowerText.includes('uber') || lowerText.includes('flight') || lowerText.includes('bus') || lowerText.includes('ticket')) category = 'Travel';
        else if (lowerText.includes('shopping') || lowerText.includes('bought') || lowerText.includes('amazon') || lowerText.includes('cloth')) category = 'Shopping';
        else if (lowerText.includes('bill') || lowerText.includes('rent') || lowerText.includes('electric') || lowerText.includes('internet') || lowerText.includes('paid')) category = 'Bills';
        else if (lowerText.includes('movie') || lowerText.includes('game') || lowerText.includes('concert')) category = 'Entertainment';

        if (amount === 0) {
            return res.status(200).json({ recognized: false, message: 'Could not understand amount from text' });
        }

        // Clean up title
        let title = text;
        if (amountMatch) {
            title = title.replace(amountMatch[0], '');
        }
        title = title.replace(/^(paid\s+|bought\s+|spent\s+)/i, '');
        title = title.replace(/\s+(for|on|rs|rupees)\s*$/i, '');
        title = title.replace(/\s+/g, ' ').trim();
        if (title.length > 0) {
            title = title.charAt(0).toUpperCase() + title.slice(1);
        } else {
            title = 'Expense';
        }

        // Changed: Just return the parsed data instead of saving to DB automatically
        res.status(200).json({
            title: title.substring(0, 50),
            amount,
            category
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get smart summary
// @route   GET /api/expenses/summary
// @access  Private
const getSummary = async (req, res) => {
    // ... Existing logic preserved for compatibility or slightly adjusted
    // (Actually I'll keep getSummary for now as it's used elsewhere, but analytics is the new one)
    try {
        const expenses = await Expense.find({ user: req.user.id });
        const incomes = await Income.find({ user: req.user.id });
        const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
        const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
        const balance = totalIncome - totalExpense;
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        const monthlyBudget = user ? user.monthlyBudget : 0;
        const thisMonthStr = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
        const monthlyData = {};
        const categoryData = {};
        expenses.forEach(exp => {
            const mY = new Date(exp.date).toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!monthlyData[mY]) monthlyData[mY] = { expense: 0, income: 0, month: mY };
            monthlyData[mY].expense += exp.amount;
            if (!categoryData[exp.category]) categoryData[exp.category] = 0;
            categoryData[exp.category] += exp.amount;
        });
        incomes.forEach(inc => {
            const mY = new Date(inc.date).toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!monthlyData[mY]) monthlyData[mY] = { expense: 0, income: 0, month: mY };
            monthlyData[mY].income += inc.amount;
        });
        const thisMonthData = monthlyData[thisMonthStr] || { income: 0, expense: 0 };
        const currentMonthSavings = thisMonthData.income - thisMonthData.expense;

        // Get Previous Month data for comparison
        const lastMonthDate = new Date();
        lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
        const lastMonthStr = lastMonthDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        const lastMonthData = monthlyData[lastMonthStr] || null;
        let savingsRateScore = 100;
        if (totalIncome > 0) savingsRateScore = Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100);
        else if (totalExpense > 0) savingsRateScore = 0;
        let budgetAdherenceScore = 100;
        if (monthlyBudget > 0 && thisMonthData.expense > monthlyBudget) {
            const excessPercent = ((thisMonthData.expense - monthlyBudget) / monthlyBudget) * 100;
            budgetAdherenceScore = Math.max(0, 100 - excessPercent);
        }
        const healthScore = Math.round((savingsRateScore * 0.6) + (budgetAdherenceScore * 0.4));
        const sortedMonthlyData = Object.values(monthlyData).sort((a, b) => new Date(a.month) - new Date(b.month));
        const insights = [];
        if (currentMonthSavings > 0) insights.push(`You saved ₹${currentMonthSavings.toLocaleString('en-IN')} this month.`);
        else if (currentMonthSavings < 0) insights.push(`You spent ₹${Math.abs(currentMonthSavings).toLocaleString('en-IN')} more than you earned this month.`);
        const categories = Object.keys(categoryData);
        if (categories.length > 0 && totalIncome > 0) {
            let topCat = categories[0], topAmt = categoryData[topCat];
            for (let cat in categoryData) {
                if (categoryData[cat] > topAmt) {
                    topAmt = categoryData[cat]; topCat = cat;
                }
            }
            const pct = Math.round((topAmt / totalIncome) * 100);
            if (pct > 0) insights.push(`You spent ${pct}% of your overall income on ${topCat}.`);
        }
        if (monthlyBudget > 0) {
            const expensePct = Math.round((thisMonthData.expense / monthlyBudget) * 100);
            if (expensePct >= 100) {
                insights.push(`Warning: You have exceeded your monthly budget by ${expensePct - 100}%.`);
            } else if (expensePct >= 80) {
                insights.push(`Caution: You have used ${expensePct}% of your monthly budget.`);
            }
        }

        if (lastMonthData && lastMonthData.expense > 0) {
            const diff = thisMonthData.expense - lastMonthData.expense;
            const diffPct = Math.round((Math.abs(diff) / lastMonthData.expense) * 100);
            if (diff > 0) {
                insights.push(`Your expenses increased by ${diffPct}% compared to last month.`);
            } else if (diff < 0) {
                insights.push(`Great job! Your monthly expenses decreased by ${diffPct}% compared to last month.`);
            }
        }
        if (insights.length === 0) insights.push("Start adding more income and expenses to see smart insights here.");
        res.status(200).json({ totalIncome, totalExpense, balance, savings: currentMonthSavings, healthScore, categoryData, monthlyData: sortedMonthlyData, monthlyBudget, insights });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get dashboard analytics via Aggregation
// @route   GET /api/expenses/analytics
// @access  Private
const getDashboardAnalytics = async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const userId = new mongoose.Types.ObjectId(req.user.id);

        // 1. Category Breakdown
        const categoryExpenses = await Expense.aggregate([
            { $match: { user: userId } },
            { $group: { _id: "$category", amount: { $sum: "$amount" } } }
        ]);

        // 2. Monthly Trends (last 6 months)
        const monthlyAggregation = await Expense.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    },
                    expense: { $sum: "$amount" }
                }
            }
        ]);

        const monthlyIncomeAggregation = await Income.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    },
                    income: { $sum: "$amount" }
                }
            }
        ]);

        // Format to readable months
        const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const combinedData = {};

        monthlyAggregation.forEach(item => {
            const key = `${monthNames[item._id.month]} ${item._id.year}`;
            if (!combinedData[key]) combinedData[key] = { month: key, expense: 0, income: 0, date: new Date(item._id.year, item._id.month - 1) };
            combinedData[key].expense = item.expense;
        });

        monthlyIncomeAggregation.forEach(item => {
            const key = `${monthNames[item._id.month]} ${item._id.year}`;
            if (!combinedData[key]) combinedData[key] = { month: key, expense: 0, income: 0, date: new Date(item._id.year, item._id.month - 1) };
            combinedData[key].income = item.income;
        });

        const sortedData = Object.values(combinedData).sort((a, b) => a.date - b.date);

        res.status(200).json({
            categoryExpenses: categoryExpenses.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.amount }), {}),
            monthlyData: sortedData.map(({ month, expense, income }) => ({ month, expense, income }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    addExpenseNLP,
    getSummary,
    getDashboardAnalytics
};
