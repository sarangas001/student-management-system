const express = require('express');
const router = express.Router();
const adminReportsController = require('../controllers/adminReportsController');

router.get('/generate', adminReportsController.generateReport);
router.get('/export', adminReportsController.exportReport);

module.exports = router;
