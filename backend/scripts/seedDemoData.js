const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // 1. Clear existing demo data (Optional: only if you want a clean start for the demo user)
        const demoEmail = 'aarav.mehta@example.com';
        await User.deleteOne({ email: demoEmail });
        
        // 2. Create Demo User
        const user = await User.create({
            name: 'Aarav Mehta',
            email: demoEmail,
            password: 'password123', // Will be hashed by model middleware
            isVerified: true,
            monthlyBudget: 50000
        });
        console.log('Demo User Created:', user.name);

        const userId = user._id;

        // 3. Seed Incomes
        const incomes = [
            { user: userId, title: 'Monthly Salary', amount: 85000, source: 'Salary', date: new Date(new Date().setDate(1)) },
            { user: userId, title: 'Freelance Project', amount: 15000, source: 'Freelance', date: new Date(new Date().setDate(15)) },
            { user: userId, title: 'Stock Dividends', amount: 2500, source: 'Investment', date: new Date() }
        ];
        await Income.insertMany(incomes);

        // 4. Seed Expenses (last 30 days)
        const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Utilities', 'Housing'];
        const moods = ['Happy', 'Neutral', 'Stressed'];
        const titles = {
           'Food': ['Starbucks Coffee', 'Dinner with Friends', 'Swiggy Order', 'Grocery Store', 'Pizza Hut'],
           'Transport': ['Uber Ride', 'Petrol Refill', 'Metro Recharge', 'Auto Fare'],
           'Entertainment': ['Netflix Subscription', 'Movie Ticket', 'Bowling', 'Concert'],
           'Shopping': ['Amazon Purchase', 'New T-shirt', 'Electronics Upgrade', 'Gifts'],
           'Health': ['Gym Membership', 'Pharmacy', 'Doctor Consultation'],
           'Utilities': ['Electricity Bill', 'Water Bill', 'Internet Bill', 'Mobile Recharge'],
           'Housing': ['Monthly Rent', 'Maintenance Fee']
        };

        const expenses = [];
        for (let i = 0; i < 40; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            
            const category = categories[Math.floor(Math.random() * categories.length)];
            const titleList = titles[category] || ['Misc Expense'];
            const title = titleList[Math.floor(Math.random() * titleList.length)];
            
            expenses.push({
                user: userId,
                title,
                amount: Math.floor(Math.random() * 2000) + 100,
                category,
                date,
                mood: moods[Math.floor(Math.random() * moods.length)],
                note: `Regular ${category} expense`
            });
        }

        // Add fixed rent
        expenses.push({
            user: userId,
            title: 'Monthly Rent',
            amount: 25000,
            category: 'Housing',
            date: new Date(new Date().setDate(5)),
            mood: 'Neutral',
            note: 'Apartment rent'
        });

        await Expense.insertMany(expenses);
        console.log('Seeded 40+ expenses successfully.');

        console.log('Seeding complete! User: aarav.mehta@example.com / password123');
        process.exit();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
