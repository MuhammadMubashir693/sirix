const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const diagnosticsRoutes = require('./diagnosticsRoutes');

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/diagnostics', diagnosticsRoutes);

module.exports = router;