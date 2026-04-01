const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(() => {
    // Run auto-seed check only if explicitly requested for development/demo
    if (process.env.SEED_DEMO_DATA === 'true') {
        const autoSeed = require('./utils/autoSeed');
        autoSeed();
    } else {
        console.log('[INFO] Skipping auto-seed (Set SEED_DEMO_DATA=true to enable)');
    }
});

const app = express();

// Middleware
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://smarttrack-expense-tracker.vercel.app',
            process.env.FRONTEND_URL
        ].filter(Boolean);
        
        // Log the origin for debugging purposes
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[CORS] Request from origin: ${origin}`);
        }

        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Body parser with limit

// Mount routers
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/splits', require('./routes/splitRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/challenges', challengeRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Server running', timestamp: new Date() });
});

// Debug route to check seeding status (Remove in final production)
app.get('/api/debug/seed-status', async (req, res) => {
    try {
        const User = require('./models/User');
        const count = await User.countDocuments();
        const users = await User.find({}, 'email name role isVerified').limit(10);
        res.json({ 
            userCount: count, 
            demoUsersFound: users.map(u => ({ email: u.email, role: u.role, isVerified: u.isVerified })),
            timestamp: new Date() 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Debug route to manually trigger seeding
app.get('/api/debug/force-seed', async (req, res) => {
    try {
        const autoSeed = require('./utils/autoSeed');
        await autoSeed();
        res.json({ message: 'Auto-seed process triggered manually' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('Smart Expense Tracker API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // Log error in development or critical errors in production
    if (process.env.NODE_ENV !== 'production' || statusCode === 500) {
        console.error(`[ERROR] ${err.message}`);
        if (process.env.NODE_ENV !== 'production') console.error(err.stack);
    }
    
    res.status(statusCode).json({
        message: err.message || 'Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
