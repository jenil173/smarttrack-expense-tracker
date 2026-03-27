const express = require('express');
const router = express.Router();
const { exportPDF, emailReport, exportCSV } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.post('/export-pdf', protect, exportPDF);
router.post('/email-report', protect, emailReport);
router.get('/export-csv', protect, exportCSV);

module.exports = router;
