const express = require('express');
const router = express.Router();
const { getChallenges, createChallenge, updateChallengeProgress } = require('../controllers/challengeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getChallenges)
    .post(protect, createChallenge);

router.put('/:id/progress', protect, updateChallengeProgress);

module.exports = router;
