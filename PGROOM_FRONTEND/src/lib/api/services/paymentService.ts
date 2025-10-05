/**
 * Payment Service
 *
 * This service handles all payment-related API calls including Razorpay integration.
 * It provides a clean interface for payment operations with proper error handling
 * and type safety.
 */

import { apiService } from '../apiService';
import { endpoints } from '../index';
import { ApiResponse } from '@/lib/types/api';
import {
  Payment,
  CreatePaymentOrderRequest,
  CreatePaymentOrderResponse,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
  PaymentListParams,
  PaymentListResponse,
  TenantPaymentsRequest,
  PropertyPaymentsRequest,
  RefundRequest,
  RefundResponse,
  CancelPaymentRequest,
  CancelPaymentResponse,
  PaymentStats,
  MonthlyAnalyticsData,
  RazorpayCheckoutOptions,
  RazorpayPaymentResponse,
  PaymentError
} from '@/lib/types/payment';

/**
 * Payment Service Class
 *
 * Provides methods for all payment-related operations including:
 * - Creating payment orders
 * - Verifying payments
 * - Managing payment records
 * - Handling refunds
 * - Analytics and reporting
 */
class PaymentService {
  /**
   * Create a new payment order for rent payment
   *
   * @param orderData - Payment order creation data
   * @returns Promise<CreatePaymentOrderResponse>
   */
  async createPaymentOrder(orderData: CreatePaymentOrderRequest): Promise<CreatePaymentOrderResponse> {
    try {
      const response = await apiService.post<ApiResponse<CreatePaymentOrderResponse>>(
        endpoints.PAYMENT.CREATE_ORDER,
        orderData
      );

      if (response.statusCode === 200 && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to create payment order');
    } catch (error) {
      console.error('Payment order creation failed:', error);
      throw this.handlePaymentError(error, 'Failed to create payment order');
    }
  }

  /**
   * Verify payment signature and update payment status
   *
   * @param verificationData - Payment verification data from Razorpay
   * @returns Promise<PaymentVerificationResponse>
   */
  async verifyPayment(verificationData: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
    try {
      const response = await apiService.post<ApiResponse<PaymentVerificationResponse>>(
        endpoints.PAYMENT.VERIFY,
        verificationData
      );

      if (response.statusCode === 200 && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Payment verification failed');
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw this.handlePaymentError(error, 'Payment verification failed');
    }
  }

  /**
   * Get payment details by ID
   *
   * @param paymentId - Payment ID
   * @returns Promise<Payment>
   */
  async getPaymentById(paymentId: number): Promise<Payment> {
    try {
      const response = await apiService.get<ApiResponse<Payment>>(
        endpoints.PAYMENT.DETAILS(paymentId)
      );

      if (response.statusCode === 200 && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Payment not found');
    } catch (error) {
      console.error('Failed to get payment details:', error);
      throw this.handlePaymentError(error, 'Failed to get payment details');
    }
  }

  /**
   * Get all payments with filtering and pagination
   *
   * @param params - Filter and pagination parameters
   * @returns Promise<PaymentListResponse>
   */
  async getPayments(params: PaymentListParams = {}): Promise<PaymentListResponse> {
    try {
      const response = await apiService.post<ApiResponse<PaymentListResponse>>(
        endpoints.PAYMENT.LIST,
        params
      );

      if (response.statusCode === 200 && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch payments');
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      throw this.handlePaymentError(error, 'Failed to fetch payments');
    }
  }

  /**
   * Get payments for a specific tenant
   *
   * @param params - Tenant payment parameters
   * @returns Promise<PaymentListResponse>
   */
  async getTenantPayments(params: TenantPaymentsRequest): Promise<PaymentListResponse> {
    try {
      const response = await apiService.post<ApiResponse<PaymentListResponse>>(
        endpoints.PAYMENT.TENANT_PAYMENTS,
        params
      );

      if (response.statusCode === 200 && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch tenant payments');
    } catch (error) {
      console.error('Failed to fetch tenant payments:', error);
      throw this.handlePaymentError(error, 'Failed to fetch tenant payments');
    }
  }

  /**
   * Get payments for a specific property
   *
   * @param params - Property payment parameters
   * @returns Promise<PaymentListResponse>
   */
  async getPropertyPayments(params: PropertyPaymentsRequest): Promise<PaymentListResponse> {
    try {
      const response = await apiService.post<ApiResponse<PaymentListResponse>>(
        endpoints.PAYMENT.PROPERTY_PAYMENTS,
        params
      );

      if (response.statusCode === 200 && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch property payments');
    } catch (error) {
      console.error('Failed to fetch property payments:', error);
      throw this.handlePaymentError(error, 'Failed to fetch property payments');
    }
  }

  /**
   * Initiate a refund for a payment
   *
   * @param refundData - Refund request data
   * @returns Promise<RefundResponse>
   */
  async initiateRefund(refundData: RefundRequest): Promise<RefundResponse> {
    try {
      const response = await apiService.post<ApiResponse<RefundResponse>>(
        endpoints.PAYMENT.REFUND,
        refundData
      );

      if (response.statusCode === 200 && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to initiate refund');
    } catch (error) {
      console.error('Refund initiation failed:', error);
      throw this.handlePaymentError(error, 'Failed to initiate refund');
    }
  }

  /**
   * Cancel a pending payment
   *
   * @param cancelData - Cancel payment request data
   * @returns Promise<CancelPaymentResponse>
   */
  async cancelPayment(cancelData: CancelPaymentRequest): Promise<CancelPaymentResponse> {
    try {
      const response = await apiService.post<ApiResponse<CancelPaymentResponse>>(
        endpoints.PAYMENT.CANCEL,
        cancelData
      );

      if (response.statusCode === 200 && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to cancel payment');
    } catch (error) {
      console.error('Payment cancellation failed:', error);
      throw this.handlePaymentError(error, 'Failed to cancel payment');
    }
  }

  /**
   * Get payment statistics
   *
   * @returns Promise<PaymentStats>
   */
  async getPaymentStats(): Promise<PaymentStats> {
    try {
      const response = await apiService.get<ApiResponse<PaymentStats>>(
        endpoints.PAYMENT.STATS
      );

      if (response.statusCode === 200 && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch payment statistics');
    } catch (error) {
      console.error('Failed to fetch payment statistics:', error);
      throw this.handlePaymentError(error, 'Failed to fetch payment statistics');
    }
  }

  /**
   * Get recent payments
   *
   * @returns Promise<Payment[]>
   */
  async getRecentPayments(): Promise<Payment[]> {
    try {
      const response = await apiService.get<ApiResponse<Payment[]>>(
        endpoints.PAYMENT.RECENT
      );

      if (response.statusCode === 200 && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch recent payments');
    } catch (error) {
      console.error('Failed to fetch recent payments:', error);
      throw this.handlePaymentError(error, 'Failed to fetch recent payments');
    }
  }

  /**
   * Get monthly payment analytics
   *
   * @returns Promise<MonthlyAnalyticsData[]>
   */
  async getMonthlyAnalytics(): Promise<MonthlyAnalyticsData[]> {
    try {
      const response = await apiService.get<ApiResponse<MonthlyAnalyticsData[]>>(
        endpoints.PAYMENT.MONTHLY_ANALYTICS
      );

      if (response.statusCode === 200 && response.data) {
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch monthly analytics');
    } catch (error) {
      console.error('Failed to fetch monthly analytics:', error);
      throw this.handlePaymentError(error, 'Failed to fetch monthly analytics');
    }
  }

  /**
   * Initialize Razorpay checkout
   *
   * @param options - Razorpay checkout options
   * @returns Promise<RazorpayPaymentResponse>
   */
  async initializeRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<RazorpayPaymentResponse> {
    return new Promise((resolve, reject) => {
      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        reject(new Error('Razorpay SDK not loaded. Please include the Razorpay script.'));
        return;
      }

      // Create checkout options with handlers
      const checkoutOptions: RazorpayCheckoutOptions = {
        ...options,
        handler: (response: RazorpayPaymentResponse) => {
          resolve(response);
        },
        modal: {
          ondismiss: () => {
            reject(new Error('Payment cancelled by user'));
          }
        }
      };

      try {
        const rzp = new window.Razorpay(checkoutOptions);
        rzp.open();
      } catch (error) {
        reject(new Error('Failed to initialize Razorpay checkout'));
      }
    });
  }

  /**
   * Complete payment flow (create order + initialize checkout + verify)
   *
   * @param orderData - Payment order data
   * @param userDetails - User details for prefill
   * @returns Promise<PaymentVerificationResponse>
   */
  async processPayment(
    orderData: CreatePaymentOrderRequest,
    userDetails?: { name?: string; email?: string; contact?: string }
  ): Promise<PaymentVerificationResponse> {
    try {
      // Step 1: Create payment order
      const orderResponse = await this.createPaymentOrder(orderData);

      // Step 2: Initialize Razorpay checkout
      const checkoutOptions: RazorpayCheckoutOptions = {
        key: orderResponse.razorpayKeyId,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'Property Hub',
        description: orderData.description || 'Rent Payment',
        order_id: orderResponse.orderId,
        handler: () => {}, // Will be overridden
        prefill: userDetails,
        theme: {
          color: '#43AB4C'
        }
      };

      const razorpayResponse = await this.initializeRazorpayCheckout(checkoutOptions);

      // Step 3: Verify payment
      const verificationResponse = await this.verifyPayment({
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature
      });

      return verificationResponse;
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw this.handlePaymentError(error, 'Payment processing failed');
    }
  }

  /**
   * Handle payment errors with consistent error format
   *
   * @param error - Original error
   * @param defaultMessage - Default error message
   * @returns PaymentError
   */
  private handlePaymentError(error: any, defaultMessage: string): PaymentError {
    const paymentError: PaymentError = {
      code: 'PAYMENT_ERROR',
      message: defaultMessage,
      details: error
    };

    if (error?.response?.data?.message) {
      paymentError.message = error.response.data.message;
    } else if (error?.message) {
      paymentError.message = error.message;
    }

    if (error?.response?.status) {
      paymentError.code = `HTTP_${error.response.status}`;
    }

    return paymentError;
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
