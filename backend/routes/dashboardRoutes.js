const express = require('express');
const router = express.Router();
const { getAnalytics, getAdvancedInsights } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/analytics', protect, getAnalytics);
router.get('/insights', protect, getAdvancedInsights);

module.exports = router;
