const mongoose = require('mongoose');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Category = require('../models/Category');

const autoSeed = async () => {
    try {
        const userCount = await User.countDocuments();
        
        if (userCount > 0) {
            console.log('[INFO] Database already contains data. Skipping auto-seed.');
            return;
        }

        console.log('[INFO] Empty database detected. Performing auto-seed for first user...');

        // 1. Create Default Categories
        const defaultCategories = [
            { name: 'Food', type: 'expense', color: '#EF4444', isDefault: true },
            { name: 'Travel', type: 'expense', color: '#3B82F6', isDefault: true },
            { name: 'Shopping', type: 'expense', color: '#F59E0B', isDefault: true },
            { name: 'Bills', type: 'expense', color: '#10B981', isDefault: true },
            { name: 'Entertainment', type: 'expense', color: '#8B5CF6', isDefault: true },
            { name: 'Health', type: 'expense', color: '#EC4899', isDefault: true },
            { name: 'Education', type: 'expense', color: '#6366F1', isDefault: true },
        ];
        
        await Category.insertMany(defaultCategories);
        console.log('  - Default categories created.');

        const demoEmail = 'admin@tracker.com';
        const user = await User.create({
            name: 'SmartTrack Demo User',
            email: demoEmail,
            password: 'password123', // Will be hashed by model middleware
            role: 'admin',
            isVerified: true,
            monthlyBudget: 50000
        });
        console.log(`  - Demo user created: ${demoEmail}`);

        const userId = user._id;

        // 3. Seed Incomes (last 3 months)
        const incomes = [];
        for (let i = 0; i < 3; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            date.setDate(1); // 1st of month

            incomes.push({
                user: userId,
                title: 'Monthly Salary',
                amount: 65000 + Math.floor(Math.random() * 5000),
                source: 'Salary',
                date: new Date(date)
            });

            if (Math.random() > 0.4) {
                incomes.push({
                    user: userId,
                    title: 'Freelance Bonus',
                    amount: 5000 + Math.floor(Math.random() * 3000),
                    source: 'Freelance',
                    date: new Date(date.setDate(15))
                });
            }
        }
        await Income.insertMany(incomes);
        console.log(`  - ${incomes.length} income entries seeded.`);

        // 4. Seed Expenses (last 60 days)
        const catNames = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health'];
        const moods = ['Happy', 'Neutral', 'Stressed'];
        const titles = {
           'Food': ['Starbucks', 'Dinner with Friends', 'Swiggy Order', 'Grocery Store', 'Pizza Hut'],
           'Travel': ['Uber Ride', 'Petrol Refill', 'Metro Recharge', 'Auto Fare'],
           'Shopping': ['Amazon Purchase', 'New T-shirt', 'Electronics', 'Gifts'],
           'Bills': ['Electricity Bill', 'Water Bill', 'Internet Bill', 'Mobile Recharge'],
           'Entertainment': ['Netflix', 'Movie Ticket', 'Bowling', 'Concert'],
           'Health': ['Gym Membership', 'Pharmacy', 'Doctor Visit']
        };

        const expenses = [];
        for (let i = 0; i < 50; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 60));
            
            const category = catNames[Math.floor(Math.random() * catNames.length)];
            const titleList = titles[category] || ['General Expense'];
            const title = titleList[Math.floor(Math.random() * titleList.length)];
            
            expenses.push({
                user: userId,
                title,
                amount: Math.floor(Math.random() * 3000) + 200,
                category,
                date,
                mood: moods[Math.floor(Math.random() * moods.length)],
                note: `Automatic demo ${category} expense`
            });
        }

        // Add recurring Rent
        const today = new Date();
        for (let i = 0; i < 2; i++) {
            const rentDate = new Date(today.getFullYear(), today.getMonth() - i, 5);
            expenses.push({
                user: userId,
                title: 'Monthly House Rent',
                amount: 15000,
                category: 'Bills',
                date: rentDate,
                mood: 'Neutral'
            });
        }

        await Expense.insertMany(expenses);
        console.log(`  - ${expenses.length} expense entries seeded.`);
        console.log('[SUCCESS] Auto-seed complete.');

    } catch (error) {
        console.error('[ERROR] Auto-seed failed:', error.message);
        // Don't exit process, we want the server to still run even if seeding fails
    }
};

module.exports = autoSeed;
