const express = require('express');
const router = express.Router();
const { getIncomes, addIncome, deleteIncome, updateIncome, addIncomeNLP } = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/nlp', protect, addIncomeNLP);

router.route('/')
    .get(protect, getIncomes)
    .post(protect, addIncome);

router.route('/:id')
    .delete(protect, deleteIncome)
    .put(protect, updateIncome);

module.exports = router;
