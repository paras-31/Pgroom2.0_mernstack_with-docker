import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { tenantPaymentService } from '@/lib/api/services/tenantPaymentService';
import { Payment, PaymentStatus, PaginationMeta } from '@/lib/types/payment';
import { TenantRoomDetails } from '@/lib/api/services/tenantService';

// Define tenant-specific stats interface
interface TenantPaymentStats {
  totalPaid: number;
  pendingAmount: number;
  nextDueAmount: number;
  nextDueDate: string | null;
  isOverdue: boolean;
  currentMonthPaid: boolean;
  paymentHistory?: Payment[];
}

/**
 * Custom hook for tenant payment operations
 */
export function useTenantPayments() {
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [roomDetails, setRoomDetails] = useState<TenantRoomDetails | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [stats, setStats] = useState<TenantPaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch payments for tenant
  const fetchPayments = useCallback(async (
    targetTenantId: number, 
    params?: { page?: number; limit?: number; status?: PaymentStatus }
  ) => {
    try {
      setError(null);
      const response = await tenantPaymentService.getPaymentHistory(targetTenantId, params);
      
      if (response.statusCode === 200) {
        setPayments(response.data.data || []);
        setPagination(response.data.pagination || null);
      }
    } catch (err: unknown) {
      console.error('Error fetching payments:', err);
      const errorMessage = (err as Error).message || 'Failed to fetch payments';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  // Initialize tenant data
  const initializeTenantData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get tenant ID
      const tenantIdResponse = await tenantPaymentService.getTenantId();
      if (tenantIdResponse.statusCode !== 200 || !tenantIdResponse.data?.tenantId) {
        throw new Error('Unable to get tenant information');
      }

      const currentTenantId = tenantIdResponse.data.tenantId;
      setTenantId(currentTenantId);

      // Get room details
      const roomResponse = await tenantPaymentService.getTenantRoomDetails();
      if (roomResponse.statusCode !== 200 || !roomResponse.data) {
        throw new Error('Unable to get room information');
      }

      setRoomDetails(roomResponse.data);

      // Get payment history
      await fetchPayments(currentTenantId);

    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to initialize tenant data';
      setError(errorMessage);
      console.error('Error initializing tenant data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPayments]);

  // Create payment order
  const createPaymentOrder = useCallback(async () => {
    if (!roomDetails) {
      toast.error('Room information not available');
      return null;
    }

    try {
      setIsCreatingOrder(true);
      const response = await tenantPaymentService.createRentPaymentOrder(roomDetails);
      
      if (response.statusCode === 200 && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create payment order');
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to create payment order';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsCreatingOrder(false);
    }
  }, [roomDetails]);

  // Verify payment
  const verifyPayment = useCallback(async (verificationData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    try {
      setIsVerifying(true);
      const response = await tenantPaymentService.verifyPayment(verificationData);
      
      if (response.statusCode === 200) {
        toast.success('Payment successful!');
        // Refresh payment history
        if (tenantId) {
          await fetchPayments(tenantId);
        }
        return response.data;
      } else {
        throw new Error(response.message || 'Payment verification failed');
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Payment verification failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  }, [tenantId, fetchPayments]);

  // Calculate payment statistics
  const calculateStats = useCallback((): TenantPaymentStats | null => {
    if (!payments.length || !roomDetails) return null;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Filter payments for current year
    const currentYearPayments = payments.filter(payment => 
      new Date(payment.createdAt).getFullYear() === currentYear
    );

    // Calculate total paid (successful payments only)
    const totalPaid = currentYearPayments
      .filter(payment => payment.status === 'Captured')
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Find pending payments - only checking Pending status since Authorized doesn't exist in PaymentStatus
    const pendingPayments = payments.filter(payment => 
      payment.status === 'Pending'
    );

    // Calculate next due date (typically first of next month)
    const nextMonth = new Date();
    nextMonth.setMonth(currentMonth + 1, 1);
    nextMonth.setHours(0, 0, 0, 0);

    // Calculate if rent is overdue (assuming rent is due on 1st of each month)
    const currentDate = new Date();
    const hasCurrentMonthPayment = currentYearPayments.some(payment => {
      const paymentDate = new Date(payment.createdAt);
      return paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear &&
             payment.status === 'Captured';
    });

    const isOverdue = currentDate.getDate() > 5 && !hasCurrentMonthPayment; // Grace period of 5 days

    return {
      totalPaid,
      pendingAmount: pendingPayments.reduce((sum, payment) => sum + payment.amount, 0),
      nextDueDate: nextMonth.toISOString().split('T')[0],
      nextDueAmount: parseFloat(roomDetails.rent.toString()),
      isOverdue,
      paymentHistory: payments.slice(0, 5), // Recent 5 payments
      currentMonthPaid: hasCurrentMonthPayment
    };
  }, [payments, roomDetails]);

  // Initialize on mount
  useEffect(() => {
    initializeTenantData();
  }, [initializeTenantData]);

  // Calculate stats when payments or room details change
  useEffect(() => {
    const calculatedStats = calculateStats();
    setStats(calculatedStats);
  }, [calculateStats]);

  return {
    // Data
    tenantId,
    roomDetails,
    payments,
    pagination,
    stats,
    
    // Loading states
    isLoading,
    isCreatingOrder,
    isVerifying,
    error,
    
    // Actions
    createPaymentOrder,
    verifyPayment,
    fetchPayments,
    refresh: initializeTenantData,
    
    // Utilities
    setError
  };
}
