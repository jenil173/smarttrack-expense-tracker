const Expense = require('../models/Expense');
const Income = require('../models/Income');

const seedDemoData = async (userId) => {
    try {
        // Check if data already exists
        const expenseCount = await Expense.countDocuments({ user: userId });
        const incomeCount = await Income.countDocuments({ user: userId });

        if (expenseCount > 0 || incomeCount > 0) return;

        console.log(`Auto-seeding demo data for user: ${userId}`);

        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        // Income entries (5 entries)
        const incomes = [
            { user: userId, title: 'Monthly Salary', amount: 80000, category: 'Salary', date: new Date(year, month, 1) },
            { user: userId, title: 'Freelance Project', amount: 5000, category: 'Freelance', date: new Date(year, month, 10) },
            { user: userId, title: 'Stock Dividends', amount: 2500, category: 'Investment', date: new Date(year, month, 15) },
            { user: userId, title: 'Part-time Work', amount: 1500, category: 'Freelance', date: new Date(year, month, 20) },
            { user: userId, title: 'Cashback Reward', amount: 500, category: 'Other', date: new Date(year, month, 25) }
        ];

        // Expense entries (8 entries)
        const expenses = [
            { user: userId, title: 'Home Rent', amount: 15000, category: 'Housing', date: new Date(year, month, 2), mood: 'Neutral' },
            { user: userId, title: 'Grocery Shopping', amount: 4500, category: 'Food', date: new Date(year, month, 5), mood: 'Happy' },
            { user: userId, title: 'Electricity Bill', amount: 2500, category: 'Bills', date: new Date(year, month, 8), mood: 'Neutral' },
            { user: userId, title: 'Internet Subscription', amount: 1000, category: 'Bills', date: new Date(year, month, 10), mood: 'Neutral' },
            { user: userId, title: 'Dinner with Friends', amount: 2000, category: 'Food', date: new Date(year, month, 12), mood: 'Happy' },
            { user: userId, title: 'Petrol/Fuel', amount: 1500, category: 'Transport', date: new Date(year, month, 15), mood: 'Neutral' },
            { user: userId, title: 'New Shoes', amount: 4000, category: 'Shopping', date: new Date(year, month, 20), mood: 'Happy' },
            { user: userId, title: 'Online Course', amount: 5000, category: 'Education', date: new Date(year, month, 22), mood: 'Happy' }
        ];

        await Income.insertMany(incomes);
        await Expense.insertMany(expenses);

        console.log('Demo data seeded successfully for user');
    } catch (error) {
        console.error('Error auto-seeding data:', error);
    }
};

module.exports = { seedDemoData };
