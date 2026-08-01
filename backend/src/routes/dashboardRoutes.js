const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/authenticate');
const { authorizePermission } = require('../middleware/authorize');

router.use(authenticate);
router.get('/metrics', authorizePermission('dashboard:read'), dashboardController.getDashboardMetrics);

module.exports = router;