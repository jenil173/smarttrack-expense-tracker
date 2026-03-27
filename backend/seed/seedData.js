const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Category = require('../models/Category');

dotenv.config({ path: __dirname + '/../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-expense-tracker';

const defaultCategories = [
    { name: 'Food', type: 'expense', color: '#EF4444', isDefault: true },
    { name: 'Travel', type: 'expense', color: '#3B82F6', isDefault: true },
    { name: 'Shopping', type: 'expense', color: '#F59E0B', isDefault: true },
    { name: 'Bills', type: 'expense', color: '#10B981', isDefault: true },
    { name: 'Entertainment', type: 'expense', color: '#8B5CF6', isDefault: true },
    { name: 'Health', type: 'expense', color: '#EC4899', isDefault: true },
    { name: 'Education', type: 'expense', color: '#6366F1', isDefault: true },
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected for seeding');

        // Clear existing data
        await User.deleteMany();
        await Expense.deleteMany();
        await Income.deleteMany();
        await Category.deleteMany();

        // Create default categories for system
        await Category.insertMany(defaultCategories);

        const usersData = [
            { name: 'Admin Tracker', email: 'admin@tracker.com', password: 'admin123', role: 'admin', budget: 50000 },
            { name: 'User One', email: 'user1@tracker.com', password: 'user123', role: 'user', budget: 30000 },
            { name: 'User Two', email: 'user2@tracker.com', password: 'user123', role: 'user', budget: 25000 },
            { name: 'User Three', email: 'user3@tracker.com', password: 'user123', role: 'user', budget: 40000 }
        ];

        const demoCategories = ['Food', 'Bills', 'Shopping', 'Travel', 'Entertainment', 'Health', 'Education'];
        const moods = ['Happy', 'Stressed', 'Neutral'];

        for (let userData of usersData) {
            const user = await User.create({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                role: userData.role,
                monthlyBudget: userData.budget,
                isVerified: true // Demo users are pre-verified
            });

            console.log(`Created user: ${user.email}`);

            // Generate data for the last 4 months
            for (let m = 0; m < 4; m++) {
                const date = new Date();
                date.setMonth(date.getMonth() - m);
                
                // 1 income entry per month
                await Income.create({
                    user: user._id,
                    title: 'Monthly Salary',
                    amount: 45000 + Math.floor(Math.random() * 5000),
                    source: 'Salary',
                    date: new Date(date.getFullYear(), date.getMonth(), 1)
                });

                // Periodic side income
                if (Math.random() > 0.5) {
                    await Income.create({
                        user: user._id,
                        title: 'Freelance Project',
                        amount: 5000 + Math.floor(Math.random() * 10000),
                        source: 'Freelance',
                        date: new Date(date.getFullYear(), date.getMonth(), 15)
                    });
                }

                // ~10 expenses per month
                for (let i = 0; i < 10; i++) {
                    const cat = demoCategories[Math.floor(Math.random() * demoCategories.length)];
                    const day = 1 + Math.floor(Math.random() * 28);
                    const expenseDate = new Date(date.getFullYear(), date.getMonth(), day);

                    await Expense.create({
                        user: user._id,
                        title: `${cat} Expense`,
                        amount: 500 + Math.floor(Math.random() * 3000),
                        category: cat,
                        date: expenseDate,
                        mood: moods[Math.floor(Math.random() * moods.length)]
                    });
                }

                // Add a recurring expense (Rent)
                await Expense.create({
                    user: user._id,
                    title: 'Monthly Rent',
                    amount: 12000,
                    category: 'Bills',
                    date: new Date(date.getFullYear(), date.getMonth(), 5),
                    mood: 'Neutral'
                });
            }
        }

        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error with seed data', error);
        process.exit(1);
    }
};

seedDB();
