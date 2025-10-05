/**
 * PaymentFormModal - Modern payment creation modal
 * 
 * A modern, animated modal for creating payments with the same theme
 * as the TenantFormDialog. Features gradient header, motion animations,
 * and improved UX.
 */

import React, { memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreditCard, DollarSign } from 'lucide-react';
import PaymentForm from './PaymentForm';
import { PaymentFormData } from '@/lib/types/payment';

// Props interface
interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (paymentId: string) => void;
  initialData?: Partial<PaymentFormData>;
}

/**
 * PaymentFormModal - Modern payment creation modal
 * Styled to match the TenantFormDialog with gradient header and animations
 */
const PaymentFormModal = memo<PaymentFormModalProps>(({
  isOpen,
  onClose,
  onSuccess,
  initialData
}) => {
  // Handle payment success with toast message
  const handlePaymentSuccess = (paymentId: string) => {
    toast.success('Payment successful!', {
      description: 'The payment has been processed successfully.',
      duration: 4000,
    });
    onClose();
    onSuccess?.(paymentId);
  };

  // Handle modal close
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header with gradient background */}
          <div className="relative bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
            <DialogTitle className="text-xl font-bold text-white mb-1">
              Create New Payment
            </DialogTitle>
            <DialogDescription className="text-green-100 opacity-90">
              Process a rent payment for your tenant
            </DialogDescription>

            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-medium text-white">
                  Payment Processing
                </div>
                <div className="text-xs text-green-100">
                  Secure payment via Razorpay
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <PaymentForm
              onSuccess={handlePaymentSuccess}
              onCancel={handleClose}
              initialData={initialData}
            />
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
});

PaymentFormModal.displayName = 'PaymentFormModal';

export default PaymentFormModal;
