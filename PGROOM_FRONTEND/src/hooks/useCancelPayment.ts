/**
 * useCancelPayment Hook
 * 
 * Custom hook for handling payment cancellation with optimistic updates,
 * error handling, and proper state management. Follows modern React patterns
 * and provides a clean API for payment cancellation operations.
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { paymentService } from '@/lib/api/services';
import { Payment, CancelPaymentRequest, PaymentError } from '@/lib/types/payment';

// Hook return type
interface UseCancelPaymentReturn {
  cancelPayment: (paymentId: number, reason?: string) => Promise<Payment>;
  isLoading: boolean;
  error: PaymentError | null;
  clearError: () => void;
  canCancel: (payment: Payment) => boolean;
}

/**
 * Custom hook for payment cancellation
 * 
 * @returns UseCancelPaymentReturn
 */
export const useCancelPayment = (): UseCancelPaymentReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PaymentError | null>(null);

  /**
   * Check if a payment can be cancelled
   * Only pending payments can be cancelled
   */
  const canCancel = useCallback((payment: Payment): boolean => {
    return payment.status === 'Pending';
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Cancel a payment
   * 
   * @param paymentId - ID of the payment to cancel
   * @param reason - Optional reason for cancellation
   * @returns Promise<Payment> - Updated payment object
   */
  const cancelPayment = useCallback(async (
    paymentId: number, 
    reason?: string
  ): Promise<Payment> => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate payment ID
      if (!paymentId || paymentId <= 0) {
        throw new Error('Invalid payment ID');
      }

      // Prepare cancel request
      const cancelRequest: CancelPaymentRequest = {
        paymentId,
        reason: reason?.trim() || 'Cancelled by user'
      };

      // Call API to cancel payment
      const response = await paymentService.cancelPayment(cancelRequest);

      if (!response.success) {
        throw new Error(response.message || 'Failed to cancel payment');
      }

      // Show success toast
      toast.success('Payment cancelled successfully', {
        description: 'The payment has been cancelled and marked as failed.',
        duration: 4000,
        style: {
          backgroundColor: '#10B981',
          color: '#000000',
          border: 'none'
        }
      });

      return response.payment;
    } catch (err) {
      // Create error object
      const paymentError: PaymentError = {
        code: 'CANCEL_PAYMENT_ERROR',
        message: 'Failed to cancel payment',
        details: err
      };

      // Extract error message
      if (err instanceof Error) {
        paymentError.message = err.message;
      } else if (typeof err === 'string') {
        paymentError.message = err;
      } else if (err && typeof err === 'object' && 'message' in err) {
        paymentError.message = String(err.message);
      }

      setError(paymentError);

      // Show error toast
      toast.error('Failed to cancel payment', {
        description: paymentError.message,
        duration: 5000
      });

      // Re-throw error for component handling
      throw paymentError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    cancelPayment,
    isLoading,
    error,
    clearError,
    canCancel
  };
};

export default useCancelPayment;
