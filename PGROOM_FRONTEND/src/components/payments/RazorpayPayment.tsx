import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { RazorpayPaymentResponse, RazorpayCheckoutOptions, RazorpayInstance } from '@/lib/types/payment';

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

interface RazorpayPaymentProps {
  orderData: {
    orderId: string;
    amount: number;
    currency: string;
    razorpayKeyId: string;
  };
  userDetails?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: (response: RazorpayPaymentResponse) => void;
  onFailure?: (error: Error | unknown) => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  autoTrigger?: boolean; // New prop to auto-trigger payment
}

/**
 * Razorpay Payment Button Component
 * Handles the Razorpay payment flow for tenant rent payments
 */
export const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  orderData,
  userDetails,
  onSuccess,
  onFailure,
  isLoading = false,
  disabled = false,
  className = "",
  children,
  autoTrigger = false
}) => {
  const handlePayment = () => {
    if (!window.Razorpay) {
      onFailure?.({ error: 'Payment gateway not available' });
      return;
    }

    const options: RazorpayCheckoutOptions = {
      key: orderData.razorpayKeyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'PGROOM',
      description: 'Monthly Rent Payment',
      order_id: orderData.orderId,
      handler: (response: RazorpayPaymentResponse) => {
        onSuccess({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        });
      },
      prefill: {
        name: userDetails?.name || '',
        email: userDetails?.email || '',
        contact: userDetails?.contact || ''
      },
      theme: {
        color: '#3399cc'
      },
      modal: {
        ondismiss: () => {
          // If user dismisses the modal, call onFailure to reset the state
          onFailure?.(new Error('Payment cancelled by user'));
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', (response: { error: Error }) => {
        onFailure?.(response.error);
      });

      rzp.open();
    } catch (error) {
      onFailure?.(error);
    }
  };

  // Auto-trigger payment when component mounts (if autoTrigger is true)
  useEffect(() => {
    if (autoTrigger && orderData) {
      // Small delay to ensure Razorpay script is loaded
      const timer = setTimeout(() => {
        if (window.Razorpay) {
          const options: RazorpayCheckoutOptions = {
            key: orderData.razorpayKeyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'PGROOM',
            description: 'Monthly Rent Payment',
            order_id: orderData.orderId,
            handler: (response: RazorpayPaymentResponse) => {
              onSuccess({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
            },
            prefill: {
              name: userDetails?.name || '',
              email: userDetails?.email || '',
              contact: userDetails?.contact || ''
            },
            theme: {
              color: '#3399cc'
            },
            modal: {
              ondismiss: () => {
                onFailure?.(new Error('Payment cancelled by user'));
              }
            }
          };

          try {
            const rzp = new window.Razorpay(options);
            
            rzp.on('payment.failed', (response: { error: Error }) => {
              onFailure?.(response.error);
            });

            rzp.open();
          } catch (error) {
            onFailure?.(error);
          }
        } else {
          onFailure?.(new Error('Razorpay SDK not loaded'));
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [autoTrigger, orderData, onSuccess, onFailure, userDetails]);

  // If autoTrigger is enabled, return a simple loading/status component
  if (autoTrigger) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Opening payment gateway...
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading}
      className={`w-full ${className}`}
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : children ? (
        children
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pay Rent
        </>
      )}
    </Button>
  );
};
