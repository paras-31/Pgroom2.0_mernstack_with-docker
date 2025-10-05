/**
 * OwnerPayments - Comprehensive payment management page for property owners
 *
 * Features:
 * 1. Create new payments
 * 2. View payment listings with advanced filtering
 * 3. Payment statistics and analytics
 * 4. Payment details and management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus } from 'lucide-react';
import { toast } from 'sonner';

// Layout components
import OwnerNavbar from '@/components/owner/OwnerNavbar';
import OwnerSidebar from '@/components/owner/OwnerSidebar';
import DashboardLayout from '@/components/layouts/DashboardLayout';

// UI components
import { Button } from '@/components/ui/button';

// Payment components
import {
  PaymentTable,
  PaymentStats,
  PaymentFormModal,
  PaymentDetailsModal,
  PaymentFilters,
  PaymentPagination,
  RefundModal,
  CancelPaymentModal
} from '@/components/payments';

// Context and hooks
import { PaymentProvider } from '@/contexts/PaymentContext';
import { usePaymentList } from '@/hooks/usePayments';
import { useCancelPayment } from '@/hooks/useCancelPayment';

// Types
import { Payment, PaymentListParams, PaginationMeta } from '@/lib/types/payment';

// Comprehensive payment management component
const PaymentManagement = () => {
  // State management
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filters, setFilters] = useState<PaymentListParams>({ page: 1, limit: 10 });

  // Use payment list hook
  const {
    payments,
    pagination,
    stats,
    statsError,
    isLoading,
    error,
    refetch
  } = usePaymentList(filters);

  // Use cancel payment hook
  const { cancelPayment, isLoading: isCancelling } = useCancelPayment();

  // Handle payment creation success
  const handlePaymentSuccess = useCallback((paymentId: string) => {
    setShowPaymentForm(false);
    toast.success('Payment created successfully!');
    refetch(); // Refresh the payment list
  }, [refetch]);

  // Handle view payment details
  const handleViewDetails = useCallback((payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  }, []);

  // Handle refund initiation
  const handleRefund = useCallback((payment: Payment) => {
    setSelectedPayment(payment);
    setShowRefundModal(true);
  }, []);

  // Handle cancel payment
  const handleCancel = useCallback((payment: Payment) => {
    setSelectedPayment(payment);
    setShowCancelModal(true);
  }, []);

  // Handle cancel payment confirmation
  const handleCancelConfirm = useCallback(async (paymentId: number, reason?: string) => {
    try {
      await cancelPayment(paymentId, reason);
      setShowCancelModal(false);
      setSelectedPayment(null);
      refetch(); // Refresh the payment list to show updated status
    } catch (error) {
      // Error is already handled by the hook with toast
      console.error('Cancel payment failed:', error);
    }
  }, [cancelPayment, refetch]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: PaymentListParams) => {
    // If only page and limit are provided, it means we're clearing filters but preserving pagination
    if (Object.keys(newFilters).length <= 2 && newFilters.page !== undefined) {
      setFilters({ page: newFilters.page, limit: newFilters.limit || 10 });
    } else {
      // Normal filter update - merge with previous
      setFilters(prev => ({ ...prev, ...newFilters }));
    }
  }, []);

  // Handle page changes
  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);



  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <motion.div
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Payment Management</h1>
          <p className="text-muted-foreground mt-1">
            Create, manage, and track all payment transactions
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button onClick={() => setShowPaymentForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Payment
          </Button>
        </motion.div>
      </motion.div>

      {/* Payment Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <PaymentStats
          stats={stats}
          error={statsError}
          isLoading={isLoading}
        />
      </motion.div>

      {/* Payment Management Section */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        {/* Filters */}
        <PaymentFilters
          onFiltersChange={handleFiltersChange}
          isLoading={isLoading}
        />

        {/* Payments Section Title */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Payments</h2>
        </div>

        {/* Payment Table */}
        <PaymentTable
          payments={payments}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onRefund={handleRefund}
          onCancel={handleCancel}
        />

        {/* Pagination */}
        <AnimatePresence>
          {pagination && pagination.total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PaymentPagination
                pagination={pagination}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modals */}
      <PaymentFormModal
        isOpen={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
        onSuccess={handlePaymentSuccess}
      />

      {selectedPayment && (
        <>
          <PaymentDetailsModal
            payment={selectedPayment}
            isOpen={showPaymentDetails}
            onClose={() => {
              setShowPaymentDetails(false);
              setSelectedPayment(null);
            }}
          />

          <RefundModal
            payment={selectedPayment}
            isOpen={showRefundModal}
            onClose={() => {
              setShowRefundModal(false);
              setSelectedPayment(null);
            }}
            onSuccess={() => {
              setShowRefundModal(false);
              setSelectedPayment(null);
              refetch(); // Refresh the payment list to show updated status
            }}
          />

          <CancelPaymentModal
            payment={selectedPayment}
            isOpen={showCancelModal}
            onClose={() => {
              setShowCancelModal(false);
              setSelectedPayment(null);
            }}
            onConfirm={handleCancelConfirm}
            isLoading={isCancelling}
          />
        </>
      )}
    </motion.div>
  );
};

const OwnerPayments: React.FC = () => {
  // Add Razorpay script to head if not already present
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    // Check if script is already loaded
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <PaymentProvider>
      <DashboardLayout
        navbar={<OwnerNavbar />}
        sidebar={<OwnerSidebar />}
      >
        <div className="w-full max-w-[98%] mx-auto">
          <PaymentManagement />
        </div>
      </DashboardLayout>
    </PaymentProvider>
  );
};

export default OwnerPayments;
