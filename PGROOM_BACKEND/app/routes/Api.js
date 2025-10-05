const express = require('express');
const router = express.Router();
const apiController = require('../controllers/ApiController');
const profileController = require('../controllers/ProfileController');
const paymentController = require('../controllers/PaymentController');

router.get('/states', apiController.getStates);
router.get('/cities/:id', apiController.getCities);
router.post('/login', profileController.login);
router.post('/register', profileController.createAccount);

// Razorpay webhook endpoint (no authentication required)
router.post('/payment/webhook', paymentController.handleWebhook);

module.exports = router;
