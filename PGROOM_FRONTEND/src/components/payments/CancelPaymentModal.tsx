/**
 * CancelPaymentModal - Modern payment cancellation confirmation modal
 *
 * A beautifully designed, animated modal for confirming payment cancellation with
 * modern UI patterns, gradient header, enhanced visual hierarchy, and superior UX.
 * Follows UI designer principles with focus on visual appeal and user experience.
 */

import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  XCircle,
  Loader2,
  CreditCard
} from 'lucide-react';
import { Payment } from '@/lib/types/payment';
import { cn } from '@/lib/utils';

// Validation schema for cancel form
const cancelFormSchema = z.object({
  reason: z.string()
    .max(255, 'Reason cannot exceed 255 characters')
    .optional()
    .or(z.literal(''))
});

type CancelFormValues = z.infer<typeof cancelFormSchema>;

// Props interface
interface CancelPaymentModalProps {
  payment: Payment;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentId: number, reason?: string) => Promise<void>;
  isLoading?: boolean;
}

/**
 * CancelPaymentModal - Payment cancellation confirmation modal
 */
const CancelPaymentModal = memo<CancelPaymentModalProps>(({
  payment,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const form = useForm<CancelFormValues>({
    resolver: zodResolver(cancelFormSchema),
    defaultValues: {
      reason: ''
    }
  });

  // Format currency with rupee symbol
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Handle form submission
  const handleSubmit = async (data: CancelFormValues) => {
    if (isSubmitting || isLoading) return;

    try {
      setIsSubmitting(true);
      await onConfirm(payment.id, data.reason);

      toast.success('Payment cancelled successfully', {
        description: 'The payment has been cancelled.',
        duration: 4000,
        style: {
          backgroundColor: '#10B981',
          color: '#000000',
          border: 'none'
        }
      });

      onClose();
      form.reset();
    } catch (error) {
      console.error('Failed to cancel payment:', error);
      toast.error('Failed to cancel payment', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (isSubmitting || isLoading) return;
    form.reset();
    onClose();
  };

  const isProcessing = isSubmitting || isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header with gradient background - matching website theme */}
          <div className="relative bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
            <DialogTitle className="text-xl font-bold text-white mb-1">
              Cancel Payment
            </DialogTitle>
            <DialogDescription className="text-green-100 opacity-90">
              Confirm payment cancellation - this action cannot be undone
            </DialogDescription>

            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: isProcessing ? [1, 1.1, 1] : 1,
                    rotate: isProcessing ? 360 : 0
                  }}
                  transition={{
                    duration: isProcessing ? 2 : 0.2,
                    repeat: isProcessing ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  <XCircle className="h-6 w-6 text-white" />
                </motion.div>
              </div>
              <div>
                <div className="font-medium text-white">
                  Payment Cancellation
                </div>
                <div className="text-xs text-green-100">
                  Secure cancellation process
                </div>
              </div>
            </div>
          </div>

          {/* Simple content area matching website style */}
          <div className="p-6 space-y-5">
            {/* Warning message */}
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <div className="font-medium text-red-900">
                  Payment Cancellation Warning
                </div>
                <div className="text-sm text-red-700">
                  This will mark the payment as failed and cannot be reversed.
                  The payment order will be cancelled and no funds will be processed.
                </div>
              </div>
            </div>

            {/* Payment details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                Payment Details
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Payment ID</div>
                  <div className="font-mono text-sm">#{payment.id.toString().padStart(6, '0')}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Amount</div>
                  <div className="font-semibold text-lg">{formatCurrency(payment.amount)}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Pending
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Tenant</div>
                  <div className="text-sm">
                    {payment.tenant ? `${payment.tenant.firstName} ${payment.tenant.lastName}` : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Cancellation form - simple and clean */}
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-medium">
                  Reason for Cancellation (Optional)
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a reason for cancelling this payment..."
                  className="min-h-[100px] resize-none"
                  disabled={isProcessing}
                  {...form.register('reason')}
                />
                {form.formState.errors.reason && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.reason.message}
                  </p>
                )}
              </div>

              {/* Action buttons - matching TenantFormDialog style */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="w-full sm:w-auto"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  className="w-full sm:w-auto"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Payment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
});

CancelPaymentModal.displayName = 'CancelPaymentModal';

export default CancelPaymentModal;
