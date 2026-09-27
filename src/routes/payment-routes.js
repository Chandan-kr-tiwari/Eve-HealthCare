const express = require('express');

const {createPayment , paymentWebhook} = require('../controllers/payment-controller');

const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/',createPayment);

router.post('/webhooks',paymentWebhook)

module.exports=router;