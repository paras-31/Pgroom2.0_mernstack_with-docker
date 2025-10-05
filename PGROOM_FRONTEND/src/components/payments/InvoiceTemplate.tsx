/**
 * Invoice Template Component
 *
 * A React component for displaying invoice preview in the browser.
 * This component mirrors the PDF layout for consistency.
 */

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Building,
  User,
  Calendar,
  CreditCard,
  FileText,
  Copy,
  Check,
  Download,
  Share2
} from 'lucide-react';
import { InvoiceData } from '@/lib/types/invoice';
import { cn } from '@/lib/utils';

interface InvoiceTemplateProps {
  data: InvoiceData;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  interactive?: boolean;
  onDownload?: () => void;
  onShare?: () => void;
}

/**
 * Invoice Template Component
 * Displays a professional invoice layout that matches the PDF output
 */
export const InvoiceTemplate = memo<InvoiceTemplateProps>(({
  data,
  className,
  showHeader = true,
  showFooter = true,
  interactive = false,
  onDownload,
  onShare
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Copy to clipboard functionality
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  // Format currency with proper rupee symbol
  const formatCurrency = (amount: number, currency: string = 'INR') => {
    if (currency === 'INR') {
      // Use ₹ symbol for web display and Indian formatting
      const formattedAmount = amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return `₹${formattedAmount}`;
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format payment method
  const formatPaymentMethod = (method?: string) => {
    if (!method) return 'N/A';

    const methodMap: Record<string, string> = {
      'card': 'Credit/Debit Card',
      'upi': 'UPI',
      'netbanking': 'Net Banking',
      'wallet': 'Digital Wallet',
      'emi': 'EMI',
      'Cash': 'Cash Payment',
      'UPI': 'UPI Payment'
    };

    return methodMap[method] || method.charAt(0).toUpperCase() + method.slice(1);
  };

  // Format status
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'Captured': 'Completed',
      'Authorized': 'Authorized',
      'Pending': 'Pending',
      'Failed': 'Failed',
      'Refunded': 'Refunded'
    };

    return statusMap[status] || status;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Format time
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'hh:mm a');
  };



  const tenantName = data.payment.tenant
    ? `${data.payment.tenant.firstName} ${data.payment.tenant.lastName}`
    : 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={cn('max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-lg', className)}>
        {showHeader && (
          <CardHeader className="border-b-2 border-green-600 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.company.name}</h1>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-green-600">INVOICE</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-600 dark:text-gray-400 font-medium">#{data.invoiceNumber}</p>
                    {interactive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(data.invoiceNumber, 'invoice')}
                      >
                        <AnimatePresence mode="wait">
                          {copiedField === 'invoice' ? (
                            <motion.div
                              key="check"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Check className="h-3 w-3 text-green-600" />
                            </motion.div>
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </AnimatePresence>
                      </Button>
                    )}
                  </div>
                </div>

                {interactive && (
                  <div className="flex gap-2">
                    {onDownload && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-600 text-green-600"
                        onClick={onDownload}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                    {onShare && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-600 text-green-600"
                        onClick={onShare}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        )}

      <CardContent className="p-8 space-y-8">
        {/* Company and Invoice Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Company Details */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Building className="h-4 w-4 text-green-600" />
              From
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p className="font-medium">{data.company.name}</p>
              <p>{data.company.address}</p>
              <p>{data.company.city}, {data.company.state} {data.company.pincode}</p>
              {data.company.phone && <p>Phone: {data.company.phone}</p>}
              {data.company.email && <p>Email: {data.company.email}</p>}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" />
                Invoice Details
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Invoice Number:</span>
                  <span className="font-medium">{data.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Invoice Date:</span>
                  <span className="font-medium">{data.invoiceDate}</span>
                </div>
                {data.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                    <span className="font-medium">{data.dueDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Bill To Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-green-600 flex items-center gap-2">
            <User className="h-4 w-4" />
            BILL TO:
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tenant Name:</span>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{tenantName}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Property Name:</span>
              <p className="text-gray-900 dark:text-gray-100">{data.payment.property?.propertyName || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Room Number:</span>
              <p className="font-semibold text-green-600">Room {data.payment.room?.roomNo || 'N/A'}</p>
            </div>
            {data.payment.tenant?.email && (
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</span>
                <p className="text-gray-900 dark:text-gray-100">{data.payment.tenant.email}</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Payment Details Table */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-green-600" />
            Payment Details
          </h3>

          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className="w-full border-collapse">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-semibold border-r border-green-500 last:border-r-0 w-[35%]">
                    Description
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold border-r border-green-500 last:border-r-0 w-[25%]">
                    Payment Method
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold border-r border-green-500 last:border-r-0 w-[15%]">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right text-sm font-semibold w-[25%]">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-50 dark:bg-gray-800">
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-5 py-4 text-sm border-r border-gray-200 dark:border-gray-700">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {data.description || 'Monthly Rent Payment'}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm border-r border-gray-200 dark:border-gray-700">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {formatPaymentMethod(data.payment.paymentMethodDetails || data.payment.paymentMethod)}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm border-r border-gray-200 dark:border-gray-700 text-center">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-700 font-bold">
                      {formatStatus(data.payment.status)}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-sm text-right">
                    <div className="font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(data.payment.amount, data.payment.currency)}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Amount */}
          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Total Amount: <span className="text-green-600">{formatCurrency(data.payment.amount, data.payment.currency)}</span>
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Transaction Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-600" />
            Transaction Information
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Payment ID</span>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    #{data.payment.id.toString().padStart(6, '0')}
                  </p>
                  {interactive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      onClick={() => copyToClipboard(data.payment.id.toString().padStart(6, '0'), 'paymentId')}
                    >
                      <AnimatePresence mode="wait">
                        {copiedField === 'paymentId' ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Check className="h-3 w-3 text-green-600" />
                          </motion.div>
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </AnimatePresence>
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Transaction ID</span>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs font-medium text-gray-900 dark:text-gray-100 break-all">
                    {data.payment.razorpayPaymentId || 'N/A'}
                  </p>
                  {interactive && data.payment.razorpayPaymentId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0"
                      onClick={() => copyToClipboard(data.payment.razorpayPaymentId!, 'transactionId')}
                    >
                      <AnimatePresence mode="wait">
                        {copiedField === 'transactionId' ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Check className="h-3 w-3 text-green-600" />
                          </motion.div>
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </AnimatePresence>
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Payment Date</span>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(data.payment.createdAt)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Payment Time</span>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {formatTime(data.payment.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Notes */}
        {(data.terms || data.notes) && (
          <>
            <Separator />
            <div className="space-y-4">
              {data.terms && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Terms & Conditions</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{data.terms}</p>
                </div>
              )}
              {data.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{data.notes}</p>
                </div>
              )}
            </div>
          </>
        )}

        {showFooter && (
          <div className="border-t-2 border-green-600 pt-6 mt-8">
            <div className="text-center space-y-4">
              <p className="text-green-600 font-bold text-lg">Thank you for your payment!</p>

              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <span>{data.company.email || 'info@propertyhub.com'}</span>
                <span>Generated: {formatDate(new Date().toISOString())}</span>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                This is a computer-generated invoice and does not require a signature.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </motion.div>
  );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';

export default InvoiceTemplate;
