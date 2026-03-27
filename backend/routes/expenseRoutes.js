const express = require('express');
const router = express.Router();
const { getExpenses, addExpense, updateExpense, deleteExpense, addExpenseNLP, getSummary, getDashboardAnalytics } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getExpenses)
    .post(protect, addExpense);

router.post('/nlp', protect, addExpenseNLP);
router.get('/summary', protect, getSummary);
router.get('/analytics', protect, getDashboardAnalytics);

router.route('/:id')
    .put(protect, updateExpense)
    .delete(protect, deleteExpense);

module.exports = router;
