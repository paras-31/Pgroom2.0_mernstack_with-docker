/**
 * useRefund Hook
 *
 * A specialized hook for handling payment refund operations with optimized
 * state management, validation, and error handling following React best practices.
 */

import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { paymentService } from '@/lib/api/services';
import {
  Payment,
  RefundRequest,
  RefundResponse,
  PaymentError
} from '@/lib/types/payment';

/**
 * Refund validation rules
 */
interface RefundValidation {
  canRefund: boolean;
  reason?: string;
  maxRefundAmount: number;
  minRefundAmount: number;
}

/**
 * Refund hook state
 */
interface RefundState {
  isLoading: boolean;
  error: PaymentError | null;
  isValidating: boolean;
  lastRefundResponse: RefundResponse | null;
}

/**
 * Refund hook return type
 */
interface UseRefundReturn extends RefundState {
  validateRefund: (payment: Payment) => RefundValidation;
  initiateRefund: (payment: Payment, refundData: Omit<RefundRequest, 'paymentId'>) => Promise<RefundResponse>;
  clearError: () => void;
  reset: () => void;
}

/**
 * Custom hook for managing payment refunds
 */
export function useRefund(): UseRefundReturn {
  const [state, setState] = useState<RefundState>({
    isLoading: false,
    error: null,
    isValidating: false,
    lastRefundResponse: null
  });

  /**
   * Validate if a payment can be refunded
   */
  const validateRefund = useCallback((payment: Payment): RefundValidation => {
    // Check payment status
    if (payment.status !== 'Captured') {
      return {
        canRefund: false,
        reason: `Payment must be in 'Captured' status to be refunded. Current status: ${payment.status}`,
        maxRefundAmount: 0,
        minRefundAmount: 0
      };
    }

    // Check if payment has Razorpay payment ID (required for refunds)
    if (!payment.razorpayPaymentId) {
      return {
        canRefund: false,
        reason: 'Payment does not have a valid Razorpay payment ID',
        maxRefundAmount: 0,
        minRefundAmount: 0
      };
    }

    // All validations passed - full refund only
    return {
      canRefund: true,
      maxRefundAmount: payment.amount,
      minRefundAmount: payment.amount
    };
  }, []);

  /**
   * Initiate a refund for a payment
   */
  const initiateRefund = useCallback(async (
    payment: Payment,
    refundData: Omit<RefundRequest, 'paymentId'>
  ): Promise<RefundResponse> => {
    // Validate refund before proceeding
    const validation = validateRefund(payment);
    if (!validation.canRefund) {
      const error: PaymentError = {
        code: 'REFUND_VALIDATION_ERROR',
        message: validation.reason || 'Refund validation failed'
      };
      setState(prev => ({ ...prev, error }));
      throw error;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const fullRefundData: RefundRequest = {
        paymentId: payment.id,
        ...refundData
      };

      const response = await paymentService.initiateRefund(fullRefundData);

      setState(prev => ({
        ...prev,
        isLoading: false,
        lastRefundResponse: response
      }));

      // Success toast with green background
      toast.success('Refund initiated successfully!', {
        description: `Full refund of ₹${payment.amount.toLocaleString('en-IN')} has been processed.`,
        duration: 5000,
        style: {
          backgroundColor: '#22c55e',
          color: '#000000',
          border: '1px solid #16a34a'
        }
      });

      return response;
    } catch (error) {
      const paymentError = error as PaymentError;
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: paymentError
      }));

      // Error toast
      toast.error('Refund failed', {
        description: paymentError.message || 'An unexpected error occurred while processing the refund.',
        duration: 6000
      });

      throw paymentError;
    }
  }, [validateRefund]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      isValidating: false,
      lastRefundResponse: null
    });
  }, []);

  // Memoized return value to prevent unnecessary re-renders
  return useMemo(() => ({
    ...state,
    validateRefund,
    initiateRefund,
    clearError,
    reset
  }), [state, validateRefund, initiateRefund, clearError, reset]);
}

export default useRefund;
