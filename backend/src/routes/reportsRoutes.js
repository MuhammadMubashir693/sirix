const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const authenticate = require('../middleware/authenticate');
const { authorizePermission } = require('../middleware/authorize');

router.use(authenticate);

router.get('/revenue', authorizePermission('reports:read'), reportsController.getRevenueReport);
router.get('/profit', authorizePermission('reports:read'), reportsController.getProfitReport);
router.get('/customers', authorizePermission('reports:read'), reportsController.getCustomerReport);
router.get('/carriers', authorizePermission('reports:read'), reportsController.getCarrierReport);
router.get('/vendors', authorizePermission('reports:read'), reportsController.getVendorReport);

module.exports = router;
