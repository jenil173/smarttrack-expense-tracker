const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Category = require('../models/Category');

const autoSeed = async () => {
    try {
        console.log('[INFO] Checking database for demo users...');
        
        // 1. Ensure Default Categories exist
        const categoryCount = await Category.countDocuments();
        if (categoryCount === 0) {
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
        }

        // 2. Define Demo Users (Matching Frontend UI hints)
        const usersData = [
            { name: 'Admin Tracker', email: 'admin@tracker.com', password: 'password123', role: 'admin', budget: 50000 },
            { name: 'User One', email: 'user1@tracker.com', password: 'password123', role: 'user', budget: 30000 },
            { name: 'User Two', email: 'user2@tracker.com', password: 'password123', role: 'user', budget: 25000 },
            { name: 'User Three', email: 'user3@tracker.com', password: 'password123', role: 'user', budget: 40000 }
        ];

        const demoCategories = ['Food', 'Bills', 'Shopping', 'Travel', 'Entertainment', 'Health', 'Education'];
        const moods = ['Happy', 'Stressed', 'Neutral'];

        for (let userData of usersData) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                // If user exists, we don't overwrite them (preserves data if they already used it)
                continue;
            }

            console.log(`[INFO] Demo user ${userData.email} not found. Creating...`);

            // Create user (triggers pre-save hook for password hashing)
            const user = await User.create({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                role: userData.role,
                monthlyBudget: userData.budget,
                isVerified: true 
            });

            console.log(`  - Created demo account: ${user.email}`);

            // Generate historical data for the last 4 months for each new demo user
            const incomes = [];
            const expenses = [];

            for (let m = 0; m < 4; m++) {
                const date = new Date();
                date.setMonth(date.getMonth() - m);
                
                // Monthly Salary
                incomes.push({
                    user: user._id,
                    title: 'Monthly Salary',
                    amount: 45000 + Math.floor(Math.random() * 5000),
                    source: 'Salary',
                    date: new Date(date.getFullYear(), date.getMonth(), 1)
                });

                // Periodic side income
                if (Math.random() > 0.5) {
                    incomes.push({
                        user: user._id,
                        title: 'Freelance Project',
                        amount: 5000 + Math.floor(Math.random() * 10000),
                        source: 'Freelance',
                        date: new Date(date.getFullYear(), date.getMonth(), 15)
                    });
                }

                // ~10 random expenses per month
                for (let i = 0; i < 10; i++) {
                    const cat = demoCategories[Math.floor(Math.random() * demoCategories.length)];
                    const day = 1 + Math.floor(Math.random() * 28);
                    const expenseDate = new Date(date.getFullYear(), date.getMonth(), day);

                    expenses.push({
                        user: user._id,
                        title: `${cat} Expense`,
                        amount: 500 + Math.floor(Math.random() * 3000),
                        category: cat,
                        date: expenseDate,
                        mood: moods[Math.floor(Math.random() * moods.length)],
                        note: `Demo ${cat} transaction`
                    });
                }

                // Monthly Rent
                expenses.push({
                    user: user._id,
                    title: 'Monthly Rent',
                    amount: 12000,
                    category: 'Bills',
                    date: new Date(date.getFullYear(), date.getMonth(), 5),
                    mood: 'Neutral',
                    note: 'Automatic rent entry'
                });
            }

            await Income.insertMany(incomes);
            await Expense.insertMany(expenses);
            console.log(`    * Seeded ${incomes.length} incomes and ${expenses.length} expenses for ${user.email}`);
        }

        console.log('[SUCCESS] Auto-seed process complete.');

    } catch (error) {
        console.error('[ERROR] Auto-seed process failed:', error.message);
    }
};

module.exports = autoSeed;
