/**
 * RefundConfirmationDialog Component
 *
 * A confirmation dialog for refund operations with clear visual feedback,
 * refund summary, and impact explanation following modern UI/UX principles.
 */

import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertTriangle,
  RefreshCw,
  DollarSign,
  CreditCard,
  User,
  Building,
  Home,
  Calendar,
  Clock,
  Info,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Payment } from '@/lib/types/payment';
import { cn } from '@/lib/utils';

// Props interface
interface RefundConfirmationDialogProps {
  payment: Payment;
  refundAmount: number;
  reason?: string;
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Info row component
const InfoRow = memo<{
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  className?: string;
}>(({ icon: Icon, label, value, className }) => (
  <div className={cn('flex items-center justify-between py-1 sm:py-2 min-h-[2rem]', className)}>
    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground min-w-0 flex-shrink-0">
      <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </div>
    <div className="font-medium text-right ml-2 min-w-0">{value}</div>
  </div>
));

InfoRow.displayName = 'InfoRow';

// Main RefundConfirmationDialog Component
export const RefundConfirmationDialog = memo<RefundConfirmationDialogProps>(({
  payment,
  refundAmount,
  reason,
  isOpen,
  isLoading = false,
  onConfirm,
  onCancel
}) => {
  // Format currency
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: payment.currency || 'INR'
    }).format(amount);
  }, [payment.currency]);

  // Calculate refund details (always full refund now)
  const isFullRefund = true;

  // Format date
  const formatDate = useCallback((dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  }, []);

  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="max-w-4xl max-h-[95vh] w-[95vw] overflow-y-auto">
        <AlertDialogHeader className="space-y-3">
          <AlertDialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
            >
              <RefreshCw className="h-5 w-5 text-orange-600" />
            </motion.div>
            Confirm Refund
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm sm:text-base">
            Please review the refund details carefully before proceeding. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Warning Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-medium text-orange-800 dark:text-orange-200 text-sm sm:text-base">
                      Refund Confirmation Required
                    </h4>
                    <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 leading-relaxed">
                      This refund will be processed immediately and cannot be reversed.
                      The amount will be credited back to the original payment method.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-3 sm:p-4">
                <h3 className="font-medium mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <CreditCard className="h-4 w-4" />
                  Payment Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <InfoRow
                    icon={DollarSign}
                    label="Payment ID"
                    value={<span className="font-mono text-xs sm:text-sm">#{payment.id.toString().padStart(6, '0')}</span>}
                  />
                  <InfoRow
                    icon={User}
                    label="Tenant"
                    value={<span className="text-xs sm:text-sm truncate">{payment.tenant ? `${payment.tenant.firstName} ${payment.tenant.lastName}` : 'N/A'}</span>}
                  />
                  <InfoRow
                    icon={Building}
                    label="Property"
                    value={<span className="text-xs sm:text-sm truncate">{payment.property?.propertyName || 'N/A'}</span>}
                  />
                  <InfoRow
                    icon={Home}
                    label="Room"
                    value={<span className="text-xs sm:text-sm">{payment.room?.roomNo || 'N/A'}</span>}
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Payment Date"
                    value={<span className="text-xs sm:text-sm">{formatDate(payment.createdAt)}</span>}
                    className="sm:col-span-2"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Refund Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-3 sm:p-4">
                <h3 className="font-medium mb-2 sm:mb-3 flex items-center gap-2 text-green-800 dark:text-green-200 text-sm sm:text-base">
                  <RefreshCw className="h-4 w-4" />
                  Refund Summary
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Original Amount</span>
                    <span className="font-medium text-sm sm:text-base">{formatCurrency(payment.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Refund Amount</span>
                    <span className="font-semibold text-base sm:text-lg text-green-700 dark:text-green-300">
                      {formatCurrency(refundAmount)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">Refund Type</span>
                    <Badge variant="default" className="text-xs">
                      Full Refund
                    </Badge>
                  </div>
                  {reason && (
                    <div className="pt-2">
                      <span className="text-xs sm:text-sm text-muted-foreground">Reason:</span>
                      <p className="text-xs sm:text-sm mt-1 p-2 bg-muted rounded text-muted-foreground break-words">
                        {reason}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Processing Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 min-w-0">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 text-sm sm:text-base">
                      Processing Information
                    </h4>
                    <ul className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                        <span>Refund will be processed via Razorpay</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span>Processing time: 5-7 business days</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CreditCard className="h-3 w-3 flex-shrink-0" />
                        <span>Amount will be credited to original payment method</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <AlertDialogFooter className="gap-2 pt-4 flex-col sm:flex-row">
          <AlertDialogCancel
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 w-full sm:w-auto order-1 sm:order-2"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Processing...' : 'Confirm Refund'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

RefundConfirmationDialog.displayName = 'RefundConfirmationDialog';

export default RefundConfirmationDialog;
