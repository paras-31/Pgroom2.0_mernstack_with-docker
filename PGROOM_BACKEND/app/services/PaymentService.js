const PaymentRepository = require('../repository/PaymentRepository');
const { razorpay, RAZORPAY_CONSTANTS } = require('../config/razorpay');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class PaymentService {
  constructor() {
    this.paymentRepository = new PaymentRepository();
  }

  /**
   * Create a Razorpay order for rent payment
   * @param {Object} orderData - Order creation data
   * @returns {Promise<Object>} Created order and payment record
   */
  async createRentPaymentOrder(orderData) {
    try {
      const { tenantId, propertyId, roomId, amount, description } = orderData;

      // Generate unique receipt ID
      const receiptId = `${RAZORPAY_CONSTANTS.RECEIPT_PREFIX}${Date.now()}_${uuidv4().substring(0, 8)}`;

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: RAZORPAY_CONSTANTS.CURRENCY,
        receipt: receiptId,
        payment_capture: RAZORPAY_CONSTANTS.PAYMENT_CAPTURE,
        notes: {
          tenantId: tenantId.toString(),
          propertyId: propertyId.toString(),
          roomId: roomId.toString(),
          description: description || 'Rent Payment'
        }
      });

      // Create payment record in database
      const paymentData = {
        tenantId,
        propertyId,
        roomId,
        amount,
        currency: RAZORPAY_CONSTANTS.CURRENCY,
        razorpayOrderId: razorpayOrder.id,
        status: 'Pending',
        paymentMethod: null
      };

      const payment = await this.paymentRepository.createPayment(paymentData);

      return {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        payment,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
      };
    } catch (error) {
      throw new Error(`Failed to create payment order: ${error.message}`);
    }
  }

  /**
   * Verify payment signature and update payment status
   * @param {Object} paymentData - Payment verification data
   * @returns {Promise<Object>} Updated payment record
   */
  async verifyAndCapturePayment(paymentData) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

      // Verify payment signature
      const isValidSignature = this.verifyPaymentSignature({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      });

      if (!isValidSignature) {
        throw new Error('Invalid payment signature');
      }

      // Find payment record
      const payment = await this.paymentRepository.findByRazorpayOrderId(razorpay_order_id);
      if (!payment) {
        throw new Error('Payment record not found');
      }

      // Fetch payment details from Razorpay
      const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

      // Update payment record
      const updateData = {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: razorpayPayment.status === 'captured' ? 'Captured' : 'Authorized',
        paymentMethod: this.mapPaymentMethod(razorpayPayment.method),
        paymentMethodDetails: razorpayPayment.method // Store the actual Razorpay method
      };

      const updatedPayment = await this.paymentRepository.updatePayment(payment.id, updateData);

      return {
        success: true,
        payment: updatedPayment,
        razorpayPayment
      };
    } catch (error) {
      // Update payment status to failed if payment record exists
      try {
        const payment = await this.paymentRepository.findByRazorpayOrderId(paymentData.razorpay_order_id);
        if (payment) {
          await this.paymentRepository.updatePayment(payment.id, { status: 'Failed' });
        }
      } catch (updateError) {
        console.error('Failed to update payment status to failed:', updateError);
      }

      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  /**
   * Handle Razorpay webhook events
   * @param {Object} webhookData - Webhook payload
   * @param {string} signature - Webhook signature
   * @returns {Promise<Object>} Processing result
   */
  async handleWebhook(webhookData, signature) {
    try {
      // Verify webhook signature
      const isValidWebhook = this.verifyWebhookSignature(webhookData, signature);
      if (!isValidWebhook) {
        throw new Error('Invalid webhook signature');
      }

      const { event, payload } = webhookData;

      switch (event) {
        case RAZORPAY_CONSTANTS.WEBHOOK_EVENTS.PAYMENT_AUTHORIZED:
          return await this.handlePaymentAuthorized(payload.payment.entity);

        case RAZORPAY_CONSTANTS.WEBHOOK_EVENTS.PAYMENT_CAPTURED:
          return await this.handlePaymentCaptured(payload.payment.entity);

        case RAZORPAY_CONSTANTS.WEBHOOK_EVENTS.PAYMENT_FAILED:
          return await this.handlePaymentFailed(payload.payment.entity);

        case RAZORPAY_CONSTANTS.WEBHOOK_EVENTS.ORDER_PAID:
          return await this.handleOrderPaid(payload.order.entity);

        default:
          return { success: true, message: 'Event not handled' };
      }
    } catch (error) {
      throw new Error(`Webhook processing failed: ${error.message}`);
    }
  }

  /**
   * Get payment details by ID
   * @param {number} paymentId - Payment ID
   * @returns {Promise<Object>} Payment details
   */
  async getPaymentById(paymentId) {
    try {
      const payment = await this.paymentRepository.getPaymentById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }
      return payment;
    } catch (error) {
      throw new Error(`Failed to get payment: ${error.message}`);
    }
  }

  /**
   * Get payments by tenant with pagination
   * @param {number} tenantId - Tenant ID
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Paginated payments
   */
  async getPaymentsByTenant(tenantId, options) {
    try {
      return await this.paymentRepository.getPaymentsByTenant(tenantId, options);
    } catch (error) {
      throw new Error(`Failed to get tenant payments: ${error.message}`);
    }
  }

  /**
   * Get payments by property with pagination
   * @param {number} propertyId - Property ID
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Paginated payments
   */
  async getPaymentsByProperty(propertyId, options) {
    try {
      return await this.paymentRepository.getPaymentsByProperty(propertyId, options);
    } catch (error) {
      throw new Error(`Failed to get property payments: ${error.message}`);
    }
  }

  /**
   * Get all payments with filters and pagination
   * @param {Object} options - Filter and pagination options
   * @returns {Promise<Object>} Paginated payments
   */
  async getAllPayments(options) {
    try {
      return await this.paymentRepository.getAllPayments(options);
    } catch (error) {
      throw new Error(`Failed to get all payments: ${error.message}`);
    }
  }

  /**
   * Initiate refund for a payment
   * @param {Object} refundData - Refund data
   * @returns {Promise<Object>} Refund details
   */
  async initiateRefund(refundData) {
    try {
      // Validate input data
      if (!refundData || typeof refundData !== 'object') {
        throw new Error('Invalid refund data provided');
      }

      const { paymentId, amount, reason } = refundData;

      // Validate required fields
      if (!paymentId) {
        throw new Error('Payment ID is required');
      }

      // Get payment record
      const payment = await this.paymentRepository.getPaymentById(paymentId);
      if (!payment) {
        throw new Error(`Payment with ID ${paymentId} not found`);
      }

      // Validate payment status
      if (payment.status !== 'Captured') {
        throw new Error(`Only captured payments can be refunded. Current status: ${payment.status}`);
      }

      // Validate Razorpay payment ID
      if (!payment.razorpayPaymentId) {
        throw new Error('Payment does not have a valid Razorpay payment ID');
      }

      // Prepare refund data for Razorpay (full refund only)
      const refundOptions = {
        notes: {
          reason: reason || 'Full refund requested',
          paymentId: paymentId.toString(),
          originalAmount: payment.amount.toString()
        }
      };
      // Create refund in Razorpay
      const refund = await razorpay.payments.refund(payment.razorpayPaymentId, refundOptions);

      // Update payment status to Refunded (full refund only)
      const updatedPayment = await this.paymentRepository.updatePayment(paymentId, {
        status: 'Refunded'
      });

      return {
        success: true,
        refund: {
          id: refund.id,
          amount: refund.amount / 100, // Convert back to rupees
          currency: refund.currency,
          payment_id: refund.payment_id,
          status: refund.status,
          created_at: refund.created_at
        },
        payment: updatedPayment
      };
    } catch (error) {
      // Enhanced error logging
      console.error('Refund initiation failed:', {
        error: error,
        message: error?.message,
        stack: error?.stack,
        refundData: refundData
      });

      // Handle different types of errors
      let errorMessage = 'Failed to initiate refund';

      if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = `Failed to initiate refund: ${error.message}`;
        } else if (error.description) {
          errorMessage = `Failed to initiate refund: ${error.description}`;
        } else if (error.error && error.error.description) {
          errorMessage = `Failed to initiate refund: ${error.error.description}`;
        } else {
          errorMessage = `Failed to initiate refund: ${JSON.stringify(error)}`;
        }
      } else if (typeof error === 'string') {
        errorMessage = `Failed to initiate refund: ${error}`;
      }

      throw new Error(errorMessage);
    }
  }

  // Private helper methods

  /**
   * Verify Razorpay payment signature
   * @param {Object} data - Payment data
   * @returns {boolean} Signature validity
   */
  verifyPaymentSignature(data) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    return expectedSignature === razorpay_signature;
  }

  /**
   * Verify Razorpay webhook signature
   * @param {Object} body - Webhook body
   * @param {string} signature - Webhook signature
   * @returns {boolean} Signature validity
   */
  verifyWebhookSignature(body, signature) {
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_CONSTANTS.WEBHOOK_SECRET)
      .update(JSON.stringify(body))
      .digest('hex');
    return expectedSignature === signature;
  }

  /**
   * Map Razorpay payment method to internal enum
   * @param {string} razorpayMethod - Razorpay payment method
   * @returns {string} Internal payment method
   */
  mapPaymentMethod(razorpayMethod) {
    // Map all digital payment methods to UPI for the enum constraint
    // The actual method is stored in paymentMethodDetails field
    const methodMap = {
      'upi': 'UPI',
      'card': 'UPI', // Digital payment - actual method stored in paymentMethodDetails
      'netbanking': 'UPI', // Digital payment - actual method stored in paymentMethodDetails
      'wallet': 'UPI', // Digital payment - actual method stored in paymentMethodDetails
      'emi': 'UPI' // Digital payment - actual method stored in paymentMethodDetails
    };
    return methodMap[razorpayMethod] || 'UPI';
  }

  // Webhook event handlers

  async handlePaymentAuthorized(paymentEntity) {
    const payment = await this.paymentRepository.findByRazorpayPaymentId(paymentEntity.id);
    if (payment) {
      await this.paymentRepository.updatePayment(payment.id, { status: 'Authorized' });
    }
    return { success: true, message: 'Payment authorized' };
  }

  async handlePaymentCaptured(paymentEntity) {
    const payment = await this.paymentRepository.findByRazorpayPaymentId(paymentEntity.id);
    if (payment) {
      await this.paymentRepository.updatePayment(payment.id, { status: 'Captured' });
    }
    return { success: true, message: 'Payment captured' };
  }

  async handlePaymentFailed(paymentEntity) {
    const payment = await this.paymentRepository.findByRazorpayOrderId(paymentEntity.order_id);
    if (payment) {
      await this.paymentRepository.updatePayment(payment.id, { status: 'Failed' });
    }
    return { success: true, message: 'Payment failed' };
  }

  async handleOrderPaid(orderEntity) {
    const payment = await this.paymentRepository.findByRazorpayOrderId(orderEntity.id);
    if (payment) {
      await this.paymentRepository.updatePayment(payment.id, { status: 'Captured' });
    }
    return { success: true, message: 'Order paid' };
  }

  /**
   * Cancel a pending payment
   * @param {number} paymentId - Payment ID to cancel
   * @param {string} reason - Reason for cancellation (optional)
   * @returns {Promise<Object>} Cancelled payment record
   */
  async cancelPayment(paymentId, reason = 'Cancelled by user') {
    try {
      // Find payment record
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Validate payment status - only pending payments can be cancelled
      if (payment.status !== 'Pending') {
        throw new Error(`Cannot cancel payment with status: ${payment.status}. Only pending payments can be cancelled.`);
      }

      // Update payment status to Failed (representing cancelled state)
      const updateData = {
        status: 'Failed',
        // We could add a cancellation reason field in future if needed
        // For now, the status change and timestamp indicate cancellation
      };

      const cancelledPayment = await this.paymentRepository.updatePayment(paymentId, updateData);

      console.log(`Payment ${paymentId} cancelled successfully. Reason: ${reason}`);

      return {
        success: true,
        payment: cancelledPayment,
        message: 'Payment cancelled successfully'
      };
    } catch (error) {
      console.error(`Failed to cancel payment ${paymentId}:`, error);
      throw new Error(`Failed to cancel payment: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();
