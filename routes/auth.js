const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth');

router.post('/google/mobile', authController.googleMobileVerification);

module.exports = router;
