const Razorpay = require('razorpay');
const config = require('./InitEnv');

/**
 * Razorpay Configuration
 * Initialize Razorpay instance with API credentials
 */
const razorpay = new Razorpay({
  key_id: config.payment.keyId,
  key_secret: config.payment.keySecret,
});

/**
 * Razorpay Constants
 */
const RAZORPAY_CONSTANTS = {
  CURRENCY: 'INR',
  PAYMENT_CAPTURE: 1, // Auto capture payments
  RECEIPT_PREFIX: 'PGROOM_',
  WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,

  // Payment Status
  STATUS: {
    CREATED: 'created',
    AUTHORIZED: 'authorized',
    CAPTURED: 'captured',
    REFUNDED: 'refunded',
    FAILED: 'failed'
  },

  // Order Status
  ORDER_STATUS: {
    CREATED: 'created',
    ATTEMPTED: 'attempted',
    PAID: 'paid'
  },

  // Webhook Events
  WEBHOOK_EVENTS: {
    PAYMENT_AUTHORIZED: 'payment.authorized',
    PAYMENT_CAPTURED: 'payment.captured',
    PAYMENT_FAILED: 'payment.failed',
    ORDER_PAID: 'order.paid',
    REFUND_CREATED: 'refund.created',
    REFUND_PROCESSED: 'refund.processed'
  }
};

module.exports = {
  razorpay,
  RAZORPAY_CONSTANTS
};
