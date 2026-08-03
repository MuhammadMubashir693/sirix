const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const diagnosticsRoutes = require('./diagnosticsRoutes');
const accountingRoutes = require('./accountingRoutes');
const partyRoutes = require('./partyRoutes');
const reportsRoutes = require('./reportsRoutes');

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/diagnostics', diagnosticsRoutes);
router.use('/reports', reportsRoutes);
// accountingRoutes defines its own top-level paths: /invoices, /payments,
// /carrier-payments, and /accounting/dashboard — mounted at root.
router.use('/', accountingRoutes);
// Same story for /customers, /carriers, /vendors.
router.use('/', partyRoutes);

module.exports = router;
