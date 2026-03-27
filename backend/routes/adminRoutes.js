const express = require('express');
const router = express.Router();
const { getAllUsers, getSystemStats, deleteUser, changeUserRole, getTransactions, getSystemAnalytics } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/users')
    .get(protect, admin, getAllUsers);

router.route('/system-stats')
    .get(protect, admin, getSystemStats);

router.route('/analytics')
    .get(protect, admin, getSystemAnalytics);

router.route('/users/:id')
    .delete(protect, admin, deleteUser);

router.route('/users/:id/role')
    .put(protect, admin, changeUserRole);

router.route('/all-transactions')
    .get(protect, admin, getTransactions);

module.exports = router;
