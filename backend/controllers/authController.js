const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const sendEmail = require('../utils/emailService');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // 1. Validation Checks
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password' });
        }

        // Email format validation
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        // Password length check
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // 2. Prevent duplicate email
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // 3. Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // 4. Create user
        const bypassVerification = process.env.BYPASS_VERIFICATION === 'true';
        const user = await User.create({
            name,
            email,
            password,
            verificationToken: bypassVerification ? undefined : verificationToken,
            verificationTokenExpires: bypassVerification ? undefined : Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            isVerified: bypassVerification ? true : false
        });

        console.log(`[AUTH] User register attempt: ${email} (Bypass: ${bypassVerification}, Verified: ${user.isVerified})`);

        if (user) {
            // 5. Send verification email
            const backendUrl = process.env.NODE_ENV === 'production' 
                ? req.get('host').includes('localhost') ? process.env.BACKEND_URL : `${req.protocol}://${req.get('host')}`
                : `${req.protocol}://${req.get('host')}`;
            
            const verificationUrl = `${backendUrl}/api/auth/verify/${verificationToken}`;
            
            const message = `
                <h1>Email Verification</h1>
                <p>Thank you for registering. Please verify your email by clicking the link below:</p>
                <a href="${verificationUrl}" clicktracking=off>${verificationUrl}</a>
                <p>If you did not request this, please ignore this email.</p>
            `;

            if (!bypassVerification) {
                try {
                    await sendEmail({
                        to: user.email,
                        subject: 'SmartTrack - Verify Your Email',
                        html: message
                    });
                    console.log(`[SUCCESS] Verification email sent to: ${user.email}`);
                } catch (err) {
                    console.error(`[ERROR] Verification email failed for ${user.email}:`, err.message);
                    return res.status(500).json({ 
                        message: 'User created but unable to send verification email. Please try again later.',
                        error: err.message 
                    });
                }
            }

            // Create welcome notification
            const Notification = require('../models/Notification');
            await Notification.create({
                user: user._id,
                title: 'Welcome to SmartTrack!',
                message: 'Please verify your email to access all features.',
                type: 'info'
            });

            res.status(201).json({
                message: 'Registration successful. Please check your email to verify your account.',
                _id: user.id,
                email: user.email,
                isVerified: user.isVerified
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`[AUTH] Login attempt for: ${email}`);

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.warn(`[AUTH] Login failed: User not found (${email})`);
            return res.status(401).json({ message: 'User does not exist' });
        }

        const isMatch = await user.matchPassword(password);
        console.log(`[AUTH] Password match for ${email}: ${isMatch}`);

        if (isMatch) {
            // 1. Email Verification Check
            // Exception: Demo accounts (hardcoded list or specific domain/check)
            const isDemoAccount = ['admin@tracker.com', 'user1@tracker.com', 'user2@tracker.com', 'user3@tracker.com'].includes(user.email);
            
            if (!user.isVerified && !isDemoAccount) {
                console.warn(`[AUTH] Login blocked: Email not verified for ${email}`);
                return res.status(401).json({ message: 'Please verify your email before logging in.' });
            }

            // 2. Track Login Activity
            const userAgent = req.headers['user-agent'] || 'Unknown Device';
            const ip = req.ip || req.connection.remoteAddress;
            
            user.loginActivity.unshift({
                loginTime: new Date(),
                device: userAgent,
                ipAddress: ip
            });

            // Keep only last 10 entries to save space
            if (user.loginActivity.length > 10) {
                user.loginActivity = user.loginActivity.slice(0, 10);
            }

            await user.save();

            console.log(`[AUTH] Login successful for: ${email}`);
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                token: generateToken(user._id)
            });
        } else {
            console.warn(`[AUTH] Login failed: Invalid password for ${email}`);
            res.status(401).json({ message: 'Invalid password' });
        }
    } catch (error) {
        console.error(`[AUTH] Server error during login: ${error.message}`);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Verify email token
// @route   GET /api/auth/verify/:token
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({ 
            verificationToken: req.params.token,
            verificationTokenExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = null; // Set to null as requested
        user.verificationTokenExpires = null;
        await user.save();

        console.log(`[SUCCESS] User verified email: ${user.email}`);

        // Send a success HTML page or redirect
        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #4338CA;">Email Verified Successfully!</h1>
                <p>Your account is now verified. You can close this window and log in to the app.</p>
                <p style="margin-top: 20px; color: #666;">Thank you for choosing SmartTrack.</p>
            </div>
        `);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.monthlyBudget = req.body.monthlyBudget || user.monthlyBudget;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                email: updatedUser.email,
                role: updatedUser.role,
                monthlyBudget: updatedUser.monthlyBudget
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Search for users by name or email
// @route   GET /api/auth/search
// @access  Private
const searchUsers = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query || query.length < 2) {
            return res.status(200).json([]);
        }

        // Search by name or email, case insensitive, exclude current user
        const users = await User.find({
            $and: [
                { _id: { $ne: req.user._id } },
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } }
                    ]
                }
            ]
        })
        .select('name email')
        .limit(10);

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateUserProfile,
    verifyEmail,
    searchUsers
};
