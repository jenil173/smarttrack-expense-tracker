const express = require('express');
const router = express.Router();
const { createSplit, getMySplits, settleParticipant } = require('../controllers/splitController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createSplit)
    .get(protect, getMySplits);

router.route('/:id/settle')
    .put(protect, settleParticipant);

module.exports = router;
