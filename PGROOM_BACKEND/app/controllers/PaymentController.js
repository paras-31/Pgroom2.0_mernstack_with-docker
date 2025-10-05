const paymentService = require('../services/PaymentService');
const Controller = require('./Controller');
const http = require('../constant/StatusCodes');

class PaymentController extends Controller {
  constructor(paymentService) {
    super();
    this.paymentService = paymentService;
  }

  /**
   * Create a new payment order for rent
   * POST /v1/payment/create-order
   */
  createPaymentOrder = async (req, res) => {
    try {
      const result = await this.paymentService.createRentPaymentOrder(req.body);
      this.sendResponse(
        res,
        result,
        'Payment order created successfully',
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * Verify payment and update status
   * POST /v1/payment/verify
   */
  verifyPayment = async (req, res) => {
    try {
      const result = await this.paymentService.verifyAndCapturePayment(req.body);
      this.sendResponse(
        res,
        result,
        'Payment verified successfully',
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * Handle Razorpay webhook events
   * POST /payment/webhook
   */
  handleWebhook = async (req, res) => {
    try {
      const signature = req.headers['x-razorpay-signature'];
      await this.paymentService.handleWebhook(req.body, signature);

      // Return 200 status for successful webhook processing
      res.status(200).json({ success: true, message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  };

  /**
   * Get payment details by ID
   * GET /v1/payment/:id
   */
  getPaymentById = async (req, res) => {
    try {
      const idParam = req.params.id;

      // Check if ID parameter exists
      if (!idParam) {
        return this.sendErrorResponse(res, new Error('Payment ID is required'), http.BAD_REQUEST);
      }

      const paymentId = parseInt(idParam);

      // Validate payment ID
      if (isNaN(paymentId) || paymentId <= 0) {
        return this.sendErrorResponse(res, new Error(`Invalid payment ID: ${idParam}`), http.BAD_REQUEST);
      }

      const result = await this.paymentService.getPaymentById(paymentId);
      this.sendResponse(
        res,
        result,
        'Payment details retrieved successfully',
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * Get all payments with filters and pagination
   * POST /v1/payment/list
   */
  getAllPayments = async (req, res) => {
    try {
      const result = await this.paymentService.getAllPayments(req.body);
      this.sendResponse(
        res,
        result,
        'Payments retrieved successfully',
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * Get payments by tenant ID
   * POST /v1/payment/tenant
   */
  getPaymentsByTenant = async (req, res) => {
    try {
      const { tenantId, ...options } = req.body;
      const result = await this.paymentService.getPaymentsByTenant(tenantId, options);
      this.sendResponse(
        res,
        result,
        'Tenant payments retrieved successfully',
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * Get payments by property ID
   * POST /v1/payment/property
   */
  getPaymentsByProperty = async (req, res) => {
    try {
      const { propertyId, ...options } = req.body;
      const result = await this.paymentService.getPaymentsByProperty(propertyId, options);
      this.sendResponse(
        res,
        result,
        'Property payments retrieved successfully',
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * Initiate refund for a payment
   * POST /v1/payment/refund
   */
  initiateRefund = async (req, res) => {
    try {
      const result = await this.paymentService.initiateRefund(req.body);
      this.sendResponse(
        res,
        result,
        'Refund initiated successfully',
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * Get payment statistics for dashboard
   * GET /v1/payment/stats
   */
  getPaymentStats = async (_req, res) => {
    try {
      // Get basic payment statistics
      const allPayments = await this.paymentService.getAllPayments({ limit: 1000 });

      // Calculate revenue from only completed (captured) payments
      const capturedPayments = allPayments.data.filter(p => p.status === 'Captured');
      const refundedPayments = allPayments.data.filter(p => p.status === 'Refunded');
      const authorizedPayments = allPayments.data.filter(p => p.status === 'Authorized');

      // Total revenue = Sum of only completed payments
      const totalRevenue = capturedPayments.reduce((sum, payment) => sum + payment.amount, 0);

      // Total successful payments include only captured
      const successfulPayments = capturedPayments.length;

      // Total refunded payments
      const totalRefundedPayments = refundedPayments.length;

      const stats = {
        totalPayments: allPayments.pagination.total,
        totalAmount: totalRevenue, // Count revenue from completed payments only
        successfulPayments: successfulPayments,
        pendingPayments: allPayments.data.filter(p => p.status === 'Pending').length,
        authorizedPayments: authorizedPayments.length,
        failedPayments: allPayments.data.filter(p => p.status === 'Failed').length,
        refundedPayments: totalRefundedPayments,
        successRate: allPayments.pagination.total > 0
          ? parseFloat(((successfulPayments / allPayments.pagination.total) * 100).toFixed(2))
          : 0
      };

      this.sendResponse(
        res,
        stats,
        'Payment statistics retrieved successfully',
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * Get recent payments for dashboard
   * GET /v1/payment/recent
   */
  getRecentPayments = async (_req, res) => {
    try {
      const result = await this.paymentService.getAllPayments({
        page: 1,
        limit: 10
      });

      this.sendResponse(
        res,
        result.data,
        'Recent payments retrieved successfully',
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * Get monthly payment analytics
   * GET /v1/payment/analytics/monthly
   */
  getMonthlyAnalytics = async (_req, res) => {
    try {
      const allPayments = await this.paymentService.getAllPayments({ limit: 1000 });

      // Group payments by month
      const monthlyData = {};
      const currentYear = new Date().getFullYear();

      // Initialize all months with 0
      for (let i = 1; i <= 12; i++) {
        const monthKey = `${currentYear}-${i.toString().padStart(2, '0')}`;
        monthlyData[monthKey] = {
          month: new Date(currentYear, i - 1).toLocaleString('default', { month: 'long' }),
          totalAmount: 0,
          totalPayments: 0,
          successfulPayments: 0
        };
      }

      // Process payments
      allPayments.data.forEach(payment => {
        const paymentDate = new Date(payment.createdAt);
        if (paymentDate.getFullYear() === currentYear) {
          const monthKey = `${paymentDate.getFullYear()}-${(paymentDate.getMonth() + 1).toString().padStart(2, '0')}`;

          if (monthlyData[monthKey]) {
            monthlyData[monthKey].totalPayments++;
            if (payment.status === 'Captured') {
              monthlyData[monthKey].totalAmount += payment.amount;
              monthlyData[monthKey].successfulPayments++;
            }
          }
        }
      });

      const analytics = Object.values(monthlyData);

      this.sendResponse(
        res,
        analytics,
        'Monthly payment analytics retrieved successfully',
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };

  /**
   * Cancel a pending payment
   * POST /v1/payment/cancel
   */
  cancelPayment = async (req, res) => {
    try {
      const { paymentId, reason } = req.body;
      const result = await this.paymentService.cancelPayment(paymentId, reason);
      this.sendResponse(
        res,
        result,
        'Payment cancelled successfully',
        http.OK
      );
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  };
}

module.exports = new PaymentController(paymentService);
