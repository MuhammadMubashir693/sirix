const express = require('express');
const router = express.Router();
const diagnosticsController = require('../controllers/diagnosticsController');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

router.use(authenticate);
router.get('/', authorize('diagnostics:read'), diagnosticsController.getDiagnostics);
router.post('/run-test', authorize('diagnostics:execute'), diagnosticsController.runTest);

module.exports = router;