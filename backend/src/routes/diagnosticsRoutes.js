const express = require('express');
const router = express.Router();
const diagnosticsController = require('../controllers/diagnosticsController');
const authenticate = require('../middleware/authenticate');
const { authorizePermission } = require('../middleware/authorize');

router.use(authenticate);
router.get('/', authorizePermission('diagnostics:read'), diagnosticsController.getDiagnostics);
router.post('/run-test', authorizePermission('diagnostics:execute'), diagnosticsController.runTest);

module.exports = router;