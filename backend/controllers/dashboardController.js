const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const { seedDemoData } = require('../utils/userSeeder');

// Simple in-memory cache
let analyticsCache = {
    data: null,
    lastFetched: null,
    userId: null
};

const CACHE_DURATION = 30 * 1000; // 30 seconds

// @desc    Get dashboard analytics via Aggregation
// @route   GET /api/dashboard/analytics
// @access  Private
const getAnalytics = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const now = Date.now();

        // Check cache
        if (
            analyticsCache.data && 
            analyticsCache.userId === req.user.id && 
            analyticsCache.lastFetched && 
            (now - analyticsCache.lastFetched < CACHE_DURATION)
        ) {
            return res.status(200).json(analyticsCache.data);
        }

        // 1. Category Breakdown (Expenses)
        let categoryExpenses = await Expense.aggregate([
            { $match: { user: userId } },
            { $group: { _id: "$category", amount: { $sum: "$amount" } } }
        ]);

        // Auto-seed if empty
        if (categoryExpenses.length === 0) {
            await seedDemoData(req.user.id);
            // Re-fetch category breakdown after seeding
            categoryExpenses = await Expense.aggregate([
                { $match: { user: userId } },
                { $group: { _id: "$category", amount: { $sum: "$amount" } } }
            ]);
        }

        // 2. Monthly Trends (Income vs Expense)
        const monthlyExpenses = await Expense.aggregate([
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

        const monthlyIncomes = await Income.aggregate([
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

        // Group by Month first
        const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const combinedMonthly = {};

        monthlyExpenses.forEach(item => {
            const key = `${monthNames[item._id.month]} ${item._id.year}`;
            if (!combinedMonthly[key]) {
                combinedMonthly[key] = { month: key, expense: 0, income: 0, sortKey: new Date(item._id.year, item._id.month - 1) };
            }
            combinedMonthly[key].expense = item.expense;
        });

        monthlyIncomes.forEach(item => {
            const key = `${monthNames[item._id.month]} ${item._id.year}`;
            if (!combinedMonthly[key]) {
                combinedMonthly[key] = { month: key, expense: 0, income: 0, sortKey: new Date(item._id.year, item._id.month - 1) };
            }
            combinedMonthly[key].income = item.income;
        });

        // If we only have data for one month, provide daily trend for that month
        let sortedTrendData = [];
        if (Object.keys(combinedMonthly).length === 1) {
            const onlyKey = Object.keys(combinedMonthly)[0];
            const mData = combinedMonthly[onlyKey];
            const targetMonth = mData.sortKey.getMonth() + 1;
            const targetYear = mData.sortKey.getFullYear();

            const dailyExpenses = await Expense.aggregate([
                { $match: { 
                    user: userId,
                    date: {
                        $gte: new Date(targetYear, targetMonth - 1, 1),
                        $lt: new Date(targetYear, targetMonth, 1)
                    }
                } },
                { $group: { _id: { day: { $dayOfMonth: "$date" } }, amount: { $sum: "$amount" } } }
            ]);

            const dailyIncomes = await Income.aggregate([
                { $match: { 
                    user: userId,
                    date: {
                        $gte: new Date(targetYear, targetMonth - 1, 1),
                        $lt: new Date(targetYear, targetMonth, 1)
                    }
                } },
                { $group: { _id: { day: { $dayOfMonth: "$date" } }, amount: { $sum: "$amount" } } }
            ]);

            const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
            const dailyCombined = {};
            for (let i = 1; i <= daysInMonth; i++) {
                dailyCombined[i] = { month: `${i} ${monthNames[targetMonth]}`, expense: 0, income: 0, day: i };
            }

            dailyExpenses.forEach(d => { if (dailyCombined[d._id.day]) dailyCombined[d._id.day].expense = d.amount; });
            dailyIncomes.forEach(d => { if (dailyCombined[d._id.day]) dailyCombined[d._id.day].income = d.amount; });

            sortedTrendData = Object.values(dailyCombined).sort((a, b) => a.day - b.day).map(({ month, expense, income }) => ({ month, expense, income }));
        } else {
            sortedTrendData = Object.values(combinedMonthly)
                .sort((a, b) => a.sortKey - b.sortKey)
                .map(({ month, expense, income }) => ({ month, expense, income }));
        }

        const result = {
            categoryExpenses: categoryExpenses.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.amount }), {}),
            monthlyData: sortedTrendData,
            isDaily: Object.keys(combinedMonthly).length === 1
        };

        // Update cache
        analyticsCache = {
            data: result,
            lastFetched: now,
            userId: req.user.id
        };
        res.status(200).json(result);
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Server Error fetching analytics', error: error.message });
    }
};

// @desc    Get advanced financial insights (Habits, Story, Recurring)
// @route   GET /api/dashboard/insights
// @access  Private
const getAdvancedInsights = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const expenses = await Expense.find({ user: userId });
        const incomes = await Income.find({ user: userId });

        if (expenses.length === 0 && incomes.length === 0) {
            return res.status(200).json({
                habits: [],
                story: "Start adding your transactions to see your financial story!",
                recurring: []
            });
        }

        // 1. Habit Analyzer
        const habits = [];
        const weekendExpenses = expenses.filter(e => [0, 6].includes(new Date(e.date).getDay()));
        const weekdayExpenses = expenses.filter(e => ![0, 6].includes(new Date(e.date).getDay()));
        
        const avgWeekend = weekendExpenses.length > 0 ? (weekendExpenses.reduce((a, b) => a + b.amount, 0) / weekendExpenses.length) : 0;
        const avgWeekday = weekdayExpenses.length > 0 ? (weekdayExpenses.reduce((a, b) => a + b.amount, 0) / weekdayExpenses.length) : 0;

        if (avgWeekend > avgWeekday * 1.2) {
            habits.push("You spend significantly more on weekends.");
        } else if (avgWeekend > avgWeekday) {
            habits.push("Your weekend spending is slightly higher than weekdays.");
        }

        const after20th = expenses.filter(e => new Date(e.date).getDate() > 20);
        const before20th = expenses.filter(e => new Date(e.date).getDate() <= 20);
        
        const sumAfter20th = after20th.reduce((a, b) => a + b.amount, 0);
        const sumBefore20th = before20th.reduce((a, b) => a + b.amount, 0);

        if (sumAfter20th > sumBefore20th * 0.5 && expenses.length > 5) {
            habits.push("Your expenses tend to increase in the last 10 days of the month.");
        }

        // 2. End-of-Month Story (Current Month)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const currentMonthExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        const currentMonthIncomes = incomes.filter(i => {
            const d = new Date(i.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const totalSpent = currentMonthExpenses.reduce((a, b) => a + b.amount, 0);
        const totalEarned = currentMonthIncomes.reduce((a, b) => a + b.amount, 0);
        const savings = totalEarned - totalSpent;
        const savingsPct = totalEarned > 0 ? Math.round((savings / totalEarned) * 100) : 0;

        // Find largest category this month
        const monthlyCats = {};
        currentMonthExpenses.forEach(e => {
            monthlyCats[e.category] = (monthlyCats[e.category] || 0) + e.amount;
        });
        const topCat = Object.entries(monthlyCats).sort((a,b) => b[1] - a[1])[0];

        let story = `This month you earned ₹${totalEarned.toLocaleString('en-IN')} and spent ₹${totalSpent.toLocaleString('en-IN')}.`;
        if (topCat) story += ` Your largest expense category was ${topCat[0]} (₹${topCat[1].toLocaleString('en-IN')}).`;
        if (savings > 0) story += ` You saved ₹${savings.toLocaleString('en-IN')} which is ${savingsPct}% of your income.`;
        else if (savings < 0) story += ` You spent ₹${Math.abs(savings).toLocaleString('en-IN')} more than you earned.`;

        // 3. Recurring Expense Detection
        const recurring = [];
        const catGroups = {};
        expenses.forEach(e => {
            const key = `${e.category}-${Math.round(e.amount / 10) * 10}`; // Similar amount approx
            if (!catGroups[key]) catGroups[key] = [];
            catGroups[key].push(e);
        });

        Object.values(catGroups).forEach(group => {
            if (group.length >= 2) {
                // Check if they are in different months
                const months = new Set(group.map(e => new Date(e.date).getMonth()));
                if (months.size >= 2) {
                    const latest = group.sort((a,b) => new Date(b.date) - new Date(a.date))[0];
                    recurring.push({
                        title: latest.title,
                        category: latest.category,
                        amount: latest.amount,
                        frequency: 'Monthly'
                    });
                }
            }
        });

        // Unique by category and title for reporting
        const uniqueRecurring = recurring.filter((v, i, a) => 
            a.findIndex(t => (t.category === v.category && t.title === v.title)) === i
        );

        // 4. Mood Analysis
        const moodStats = { Happy: 0, Stressed: 0, Neutral: 0, count: { Happy: 0, Stressed: 0, Neutral: 0 } };
        expenses.forEach(e => {
            const m = e.mood || 'Neutral';
            moodStats[m] += e.amount;
            moodStats.count[m] += 1;
        });
        
        const avgHappy = moodStats.count.Happy > 0 ? moodStats.Happy / moodStats.count.Happy : 0;
        const avgStressed = moodStats.count.Stressed > 0 ? moodStats.Stressed / moodStats.count.Stressed : 0;

        if (avgStressed > avgHappy * 1.1) {
            habits.push("You tend to spend more when stressed. Try mindful spending!");
        } else if (avgHappy > avgStressed * 1.1) {
            habits.push("You spend more when you're happy! Keep celebrating responsibly.");
        }

        // 5. Spending Heatmap (Last 30 days daily totals)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const heatmapData = await Expense.aggregate([
            { $match: { user: userId, date: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.status(200).json({
            habits,
            story,
            recurring: uniqueRecurring,
            moodStats: {
                Happy: moodStats.Happy,
                Stressed: moodStats.Stressed,
                Neutral: moodStats.Neutral
            },
            heatmap: heatmapData.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.total }), {})
        });

    } catch (error) {
        console.error('Insights Error:', error);
        res.status(500).json({ message: 'Server Error fetching insights', error: error.message });
    }
};

module.exports = {
    getAnalytics,
    getAdvancedInsights
};
