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

        const totalExpenses = expenseAgg.length > 0 ? expenseAgg[0].total : 0;
        const totalIncome = incomeAgg.length > 0 ? incomeAgg[0].total : 0;

        // Most Used Category
        const categoryAgg = await Expense.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
        const mostUsedCategory = categoryAgg.length > 0 ? categoryAgg[0]._id : 'N/A';

        // Avg Expense per User
        const avgExpensePerUser = totalUsers > 0 ? (totalExpenses / totalUsers) : 0;

        const users = await User.find({}).select('-password').sort({ createdAt: -1 });

        res.status(200).json({
            users,
            stats: {
                totalUsers,
                totalExpenses,
                totalIncome,
                totalTransactions,
                avgExpensePerUser,
                mostUsedCategory
            }
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
        const expenses = await Expense.find({}).populate('user', 'email').sort({ date: -1 });
        const incomes = await Income.find({}).populate('user', 'email').sort({ date: -1 });

        const transactions = [
            ...expenses.map(e => ({ ...e._doc, type: 'expense' })),
            ...incomes.map(i => ({ ...i._doc, type: 'income' }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

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

module.exports = {
    getAllUsers,
    getSystemStats,
    deleteUser,
    changeUserRole,
    getTransactions,
    getSystemAnalytics
};
