const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

router.use(authenticate);
router.get('/metrics', authorize('dashboard:read'), dashboardController.getDashboardMetrics);

module.exports = router;