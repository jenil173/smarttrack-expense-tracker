const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');

// Load env vars
dotenv.config({ path: './.env' });

const email = process.argv[2];

if (!email) {
    console.error('Please provide a user email: node scripts/seedUser.js <email>');
    process.exit(1);
}

const seedUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const user = await User.findOne({ email });
        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        const userId = user._id;

        // 1. Clear existing data to ensure a fresh test state
        await Expense.deleteMany({ user: userId });
        await Income.deleteMany({ user: userId });
        console.log(`Cleared existing data for ${email}`);

        const now = new Date();
        const entries = [];
        const incomes = [];

        // 2. Add Recurring Incomes (Last 2 months)
        for (let m = 0; m < 2; m++) {
            const date = new Date(now.getFullYear(), now.getMonth() - m, 1);
            incomes.push({ user: userId, title: 'Monthly Salary', amount: 85000, category: 'Salary', date });
            incomes.push({ user: userId, title: 'Freelance Project', amount: 12000, category: 'Freelance', date: new Date(now.getFullYear(), now.getMonth() - m, 15) });
        }

        // 3. Add Recurring Expenses (Triggers Recurring Detection)
        for (let m = 0; m < 2; m++) {
            const date = new Date(now.getFullYear(), now.getMonth() - m, 5);
            entries.push({ user: userId, title: 'House Rent', amount: 22000, category: 'Housing', date, mood: 'Neutral', note: 'Monthly rent' });
            entries.push({ user: userId, title: 'Netflix Subscription', amount: 649, category: 'Entertainment', date: new Date(now.getFullYear(), now.getMonth() - m, 10), mood: 'Happy' });
            entries.push({ user: userId, title: 'Fiber Internet', amount: 999, category: 'Bills', date: new Date(now.getFullYear(), now.getMonth() - m, 12), mood: 'Neutral' });
        }

        // 4. Generate Daily/Varied Expenses (Triggers Heatmap & Habits)
        // We'll generate data for the last 45 days
        for (let i = 0; i < 45; i++) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            
            const isWeekend = [0, 6].includes(date.getDay());
            const isLateMonth = date.getDate() > 20;

            // Base daily expenses
            // Weekend spending is 2x weekday (Triggers Habit Analyzer)
            const multiplier = isWeekend ? 2.5 : 1;
            // Late month spending spike (Triggers Habit Analyzer)
            const spike = isLateMonth ? 1.5 : 1;

            // Random spending on Food/Transport
            entries.push({
                user: userId,
                title: 'Daily Groceries',
                amount: Math.floor((Math.random() * 500 + 300) * multiplier * spike),
                category: 'Food',
                date,
                mood: Math.random() > 0.7 ? 'Stressed' : 'Happy'
            });

            if (Math.random() > 0.5) {
                entries.push({
                    user: userId,
                    title: isWeekend ? 'Weekend Movie/Dinner' : 'Commute Fuel',
                    amount: Math.floor((Math.random() * 1000 + 500) * multiplier),
                    category: isWeekend ? 'Entertainment' : 'Transport',
                    date,
                    mood: isWeekend ? 'Happy' : 'Neutral'
                });
            }
        }

        // 5. Specific Stressed Spending (Triggers Mood Analysis)
        // Stressed average > Happy average
        for (let i = 0; i < 5; i++) {
            const date = new Date();
            date.setDate(now.getDate() - (i * 3));
            entries.push({
                user: userId,
                title: 'Stress Shopping Spree',
                amount: 5000 + (i * 1000),
                category: 'Shopping',
                date,
                mood: 'Stressed',
                note: 'Had a long day'
            });
        }

        await Income.insertMany(incomes);
        await Expense.insertMany(entries);

        console.log(`Successfully seeded ${entries.length} expenses and ${incomes.length} incomes for ${email}`);
        console.log('--- READY FOR MANUAL TESTING ---');
        console.log('1. Habit Analyzer will show weekend/late-month patterns.');
        console.log('2. Mood Analysis will highlight stressed spending.');
        console.log('3. Recurring list will show Rent, Netflix, and Internet.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding user:', error);
        process.exit(1);
    }
};

seedUser();
