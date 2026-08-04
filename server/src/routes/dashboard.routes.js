const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);
router.get('/summary', dashboardController.summary);

module.exports = router;
