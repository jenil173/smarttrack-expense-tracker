const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get system stats via Aggregation
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalTransactions = (await Expense.countDocuments({})) + (await Income.countDocuments({}));

        // Use aggregation for system-wide sums
        const expenseAgg = await Expense.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const incomeAgg = await Income.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalIncome = incomeAgg.length > 0 ? incomeAgg[0].total : 0;
        const totalExpenses = expenseAgg.length > 0 ? expenseAgg[0].total : 0;

        // Average Savings Rate (Capped at 0 to prevent negative analytics as per Task 4)
        const avgSavingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;

        // Detailed Stats
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        
        // Recent Activity
        const recentUsers = await User.find({}).select('email createdAt').sort({ createdAt: -1 }).limit(5);
        const recentExpenses = await Expense.find({}).populate('user', 'email').sort({ createdAt: -1 }).limit(5);
        const recentIncomes = await Income.find({}).populate('user', 'email').sort({ createdAt: -1 }).limit(5);

        const recentActivity = [
            ...recentUsers.map(u => ({ id: u._id, title: `New User: ${u.email}`, time: u.createdAt, type: 'user' })),
            ...recentExpenses.map(e => ({ id: e._id, title: `Expense by ${e.user?.email || 'Unknown'}`, amount: e.amount, time: e.createdAt, type: 'expense' })),
            ...recentIncomes.map(i => ({ id: i._id, title: `Income by ${i.user?.email || 'Unknown'}`, amount: i.amount, time: i.createdAt, type: 'income' }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

        res.status(200).json({
            users,
            stats: {
                totalUsers,
                totalExpenses,
                totalIncome,
                totalTransactions,
                avgSavingsRate,
                avgExpensePerUser: totalUsers > 0 ? (totalExpenses / totalUsers) : 0
            },
            recentActivity
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all transactions (System-wide)
// @route   GET /api/admin/transactions
// @access  Private/Admin
const getTransactions = async (req, res) => {
    try {
        const { type, category } = req.query;
        let query = {};
        if (category) query.category = category;

        let transactions = [];

        if (!type || type === 'expense') {
            const expenses = await Expense.find(query).populate('user', 'email').sort({ date: -1 });
            transactions.push(...expenses.map(e => ({ ...e._doc, type: 'expense' })));
        }

        if (!type || type === 'income') {
            const incomes = await Income.find(type === 'income' ? query : {}).populate('user', 'email').sort({ date: -1 });
            transactions.push(...incomes.map(i => ({ ...i._doc, type: 'income' })));
        }

        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete User
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin' && user.email === 'admin@tracker.com') {
            return res.status(403).json({ message: 'Cannot delete the primary admin account' });
        }

        await Expense.deleteMany({ user: user._id });
        await Income.deleteMany({ user: user._id });

        await user.deleteOne();

        res.status(200).json({ message: 'User deleted successfully', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Change User Role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role provided' });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.email === 'admin@tracker.com') {
            return res.status(403).json({ message: 'Cannot demote the primary admin account' });
        }

        user.role = role;
        await user.save();

        res.status(200).json({ message: 'Role updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get system-wide analytics (Trends)
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getSystemAnalytics = async (req, res) => {
    try {
        const expenseAgg = await Expense.aggregate([
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

        const incomeAgg = await Income.aggregate([
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

        const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const combined = {};

        expenseAgg.forEach(item => {
            const key = `${monthNames[item._id.month]} ${item._id.year}`;
            if (!combined[key]) combined[key] = { month: key, expense: 0, income: 0, sortKey: new Date(item._id.year, item._id.month - 1) };
            combined[key].expense = item.expense;
        });

        incomeAgg.forEach(item => {
            const key = `${monthNames[item._id.month]} ${item._id.year}`;
            if (!combined[key]) combined[key] = { month: key, expense: 0, income: 0, sortKey: new Date(item._id.year, item._id.month - 1) };
            combined[key].income = item.income;
        });

        const sortedData = Object.values(combined)
            .sort((a, b) => a.sortKey - b.sortKey)
            .map(({ month, expense, income }) => ({ month, expense, income }));

        res.status(200).json(sortedData);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a transaction administratively
// @route   DELETE /api/admin/transactions/:id
// @access  Private/Admin
const deleteTransaction = async (req, res) => {
    try {
        const { type } = req.query;
        const Model = type === 'income' ? Income : Expense;
        
        const transaction = await Model.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        await transaction.deleteOne();
        res.status(200).json({ message: 'Transaction removed from system', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAllUsers,
    getSystemStats,
    deleteUser,
    changeUserRole,
    getTransactions,
    getSystemAnalytics,
    deleteTransaction
};
