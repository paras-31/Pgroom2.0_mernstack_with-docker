/**
 * Payment Details Modal Component
 *
 * A comprehensive modal for displaying detailed payment information
 * with proper formatting and accessibility features.
 */

import React, { memo } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  AlertCircle,
  User,
  Building,
  Home,
  CreditCard,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Payment, PaymentStatus } from '@/lib/types/payment';
import { cn } from '@/lib/utils';

// Props interface
interface PaymentDetailsModalProps {
  payment: Payment;
  isOpen: boolean;
  onClose: () => void;
}

// Status configuration
const statusConfig: Record<PaymentStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}> = {
  Pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200'
  },

  Captured: {
    label: 'Captured',
    icon: CheckCircle2,
    className: 'bg-green-50 text-green-700 border-green-200'
  },
  Failed: {
    label: 'Failed',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border-red-200'
  },
  Refunded: {
    label: 'Refunded',
    icon: RefreshCw,
    className: 'bg-gray-50 text-gray-700 border-gray-200'
  }
};

// Status Badge Component
const StatusBadge = memo<{ status: PaymentStatus }>(({ status }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn(config.className, 'flex items-center gap-1.5 max-w-[130px] px-2 py-0.5')}>
      <Icon className="h-3 w-3 flex-shrink-0" />
      <span className="truncate min-w-0">{config.label}</span>
    </Badge>
  );
});

StatusBadge.displayName = 'StatusBadge';

// Detail Row Component
const DetailRow = memo<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | React.ReactNode;
  className?: string;
}>(({ icon: Icon, label, value, className }) => (
  <div className={cn('flex items-center justify-between py-2', className)}>
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4" />
      <span className="text-sm">{label}</span>
    </div>
    <div className="text-sm font-medium">{value}</div>
  </div>
));

DetailRow.displayName = 'DetailRow';

// Main Payment Details Modal Component
export const PaymentDetailsModal = memo<PaymentDetailsModalProps>(({
  payment,
  isOpen,
  onClose
}) => {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: payment.currency || 'INR'
    }).format(amount);
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: format(date, 'MMM dd, yyyy'),
      time: format(date, 'hh:mm a')
    };
  };

  const createdDateTime = formatDateTime(payment.createdAt);
  const updatedDateTime = formatDateTime(payment.updatedAt);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </DialogTitle>
          <DialogDescription>
            Detailed information for payment #{payment.id.toString().padStart(6, '0')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Payment ID</div>
                  <div className="font-mono text-sm">#{payment.id.toString().padStart(6, '0')}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <StatusBadge status={payment.status} />
                </div>
              </div>

              <Separator />

              <DetailRow
                icon={DollarSign}
                label="Amount"
                value={<span className="text-lg font-semibold">{formatCurrency(payment.amount)}</span>}
              />

              <DetailRow
                icon={CreditCard}
                label="Payment Method"
                value={
                  <div className="text-right">
                    <div>{payment.paymentMethodDetails ? payment.paymentMethodDetails.charAt(0).toUpperCase() + payment.paymentMethodDetails.slice(1) : payment.paymentMethod || 'N/A'}</div>
                    {payment.paymentMethodDetails && payment.paymentMethodDetails !== payment.paymentMethod && (
                      <div className="text-xs text-muted-foreground">via {payment.paymentMethod}</div>
                    )}
                  </div>
                }
              />

              <DetailRow
                icon={Calendar}
                label="Created"
                value={
                  <div className="text-right">
                    <div>{createdDateTime.date}</div>
                    <div className="text-xs text-muted-foreground">{createdDateTime.time}</div>
                  </div>
                }
              />

              {payment.createdAt !== payment.updatedAt && (
                <DetailRow
                  icon={Calendar}
                  label="Last Updated"
                  value={
                    <div className="text-right">
                      <div>{updatedDateTime.date}</div>
                      <div className="text-xs text-muted-foreground">{updatedDateTime.time}</div>
                    </div>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Tenant Information */}
          {payment.tenant && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Tenant Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow
                  icon={User}
                  label="Name"
                  value={`${payment.tenant.firstName} ${payment.tenant.lastName}`}
                />
                <DetailRow
                  icon={User}
                  label="Email"
                  value={payment.tenant.email}
                />
                {payment.tenant.mobileNo && (
                  <DetailRow
                    icon={User}
                    label="Mobile"
                    value={payment.tenant.mobileNo}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Property & Room Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {payment.property && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Property
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DetailRow
                    icon={Building}
                    label="Name"
                    value={payment.property.propertyName}
                  />
                  {payment.property.propertyAddress && (
                    <DetailRow
                      icon={Building}
                      label="Address"
                      value={payment.property.propertyAddress}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {payment.room && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Room
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DetailRow
                    icon={Home}
                    label="Room Number"
                    value={`Room ${payment.room.roomNo}`}
                  />
                  <DetailRow
                    icon={DollarSign}
                    label="Monthly Rent"
                    value={`₹${payment.room.rent}`}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Razorpay Information */}
          {(payment.razorpayOrderId || payment.razorpayPaymentId) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Razorpay Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {payment.razorpayOrderId && (
                  <DetailRow
                    icon={CreditCard}
                    label="Order ID"
                    value={<span className="font-mono text-xs">{payment.razorpayOrderId}</span>}
                  />
                )}
                {payment.razorpayPaymentId && (
                  <DetailRow
                    icon={CreditCard}
                    label="Payment ID"
                    value={<span className="font-mono text-xs">{payment.razorpayPaymentId}</span>}
                  />
                )}
                {payment.razorpaySignature && (
                  <DetailRow
                    icon={CreditCard}
                    label="Signature"
                    value={<span className="font-mono text-xs break-all">{payment.razorpaySignature.substring(0, 20)}...</span>}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

PaymentDetailsModal.displayName = 'PaymentDetailsModal';

export default PaymentDetailsModal;
