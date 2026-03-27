const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateUserProfile, verifyEmail } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/verify/:token', verifyEmail);

// New endpoint to update user profile (like budget)
router.put('/profile', protect, updateUserProfile);

module.exports = router;
