/**
 * Payment Hooks
 *
 * Custom hooks for payment management with optimized state handling,
 * caching, and error management following React best practices.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { paymentService } from '@/lib/api/services';
import {
  Payment,
  PaymentListParams,
  PaymentListResponse,
  PaymentStats,
  MonthlyAnalyticsData,
  CreatePaymentOrderRequest,
  PaymentVerificationRequest,
  RefundRequest,
  PaymentError,
  PaymentFilters,
  PaginationMeta
} from '@/lib/types/payment';

/**
 * Hook for managing payment list with filtering, pagination, and caching
 */
export function usePayments(initialParams?: PaymentListParams) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PaymentError | null>(null);
  const [filters, setFilters] = useState<PaymentFilters>(initialParams || {});

  // Fetch payments with current filters
  const fetchPayments = useCallback(async (params?: PaymentListParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const finalParams = { ...filters, ...params };
      const response = await paymentService.getPayments(finalParams);

      setPayments(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const error = err as PaymentError;
      setError(error);
      toast.error(error.message || 'Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Update filters and refetch
  const updateFilters = useCallback((newFilters: Partial<PaymentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Refresh payments
  const refresh = useCallback(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Initial fetch
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Memoized filtered and sorted payments
  const processedPayments = useMemo(() => {
    return payments.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [payments]);

  return {
    payments: processedPayments,
    pagination,
    isLoading,
    error,
    filters,
    fetchPayments,
    updateFilters,
    clearFilters,
    refresh,
    setError
  };
}

/**
 * Hook for payment statistics and analytics
 */
export function usePaymentAnalytics() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState<MonthlyAnalyticsData[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PaymentError | null>(null);

  // Fetch all analytics data
  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statsData, monthlyData, recentData] = await Promise.all([
        paymentService.getPaymentStats(),
        paymentService.getMonthlyAnalytics(),
        paymentService.getRecentPayments()
      ]);

      setStats(statsData);
      setMonthlyAnalytics(monthlyData);
      setRecentPayments(recentData);
    } catch (err) {
      const error = err as PaymentError;
      setError(error);
      toast.error(error.message || 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh analytics
  const refresh = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    stats,
    monthlyAnalytics,
    recentPayments,
    isLoading,
    error,
    refresh,
    setError
  };
}

/**
 * Hook for individual payment operations
 */
export function usePayment(paymentId?: number) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PaymentError | null>(null);

  // Fetch payment by ID
  const fetchPayment = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const paymentData = await paymentService.getPaymentById(id);
      setPayment(paymentData);
    } catch (err) {
      const error = err as PaymentError;
      setError(error);
      toast.error(error.message || 'Failed to fetch payment');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create payment order
  const createOrder = useCallback(async (orderData: CreatePaymentOrderRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.createPaymentOrder(orderData);
      toast.success('Payment order created successfully');
      return response;
    } catch (err) {
      const error = err as PaymentError;
      setError(error);
      toast.error(error.message || 'Failed to create payment order');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify payment
  const verifyPayment = useCallback(async (verificationData: PaymentVerificationRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.verifyPayment(verificationData);
      toast.success('Payment verified successfully');
      return response;
    } catch (err) {
      const error = err as PaymentError;
      setError(error);
      toast.error(error.message || 'Payment verification failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Process complete payment flow
  const processPayment = useCallback(async (
    orderData: CreatePaymentOrderRequest,
    userDetails?: { name?: string; email?: string; contact?: string }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.processPayment(orderData, userDetails);
      // Note: Success toast is now handled in the PaymentFormModal component
      return response;
    } catch (err) {
      const error = err as PaymentError;
      setError(error);
      toast.error(error.message || 'Payment processing failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initiate refund
  const initiateRefund = useCallback(async (refundData: RefundRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.initiateRefund(refundData);
      toast.success('Refund initiated successfully');
      return response;
    } catch (err) {
      const error = err as PaymentError;
      setError(error);
      toast.error(error.message || 'Failed to initiate refund');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch payment on mount if ID provided
  useEffect(() => {
    if (paymentId) {
      fetchPayment(paymentId);
    }
  }, [paymentId, fetchPayment]);

  return {
    payment,
    isLoading,
    error,
    fetchPayment,
    createOrder,
    verifyPayment,
    processPayment,
    initiateRefund,
    setError
  };
}

/**
 * Hook for managing payment list with filtering, pagination, and stats
 */
export function usePaymentList(params: PaymentListParams = {}) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PaymentError | null>(null);

  // Memoize params to prevent infinite re-renders
  const memoizedParams = useMemo(() => params, [
    params.page,
    params.limit,
    params.status,
    params.tenantId,
    params.propertyId,
    params.roomId,
    params.search,
    params.startDate,
    params.endDate
  ]);

  // Fetch payments with current parameters
  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.getPayments(memoizedParams);
      setPayments(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const error = err as PaymentError;
      setError(error);
      toast.error(error.message || 'Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  }, [memoizedParams]);

  // Fetch payment statistics
  const fetchStats = useCallback(async () => {
    try {
      setStatsError(null);
      const statsResponse = await paymentService.getPaymentStats();
      setStats(statsResponse);
    } catch (err: any) {
      setStatsError(err.message || 'Failed to load payment statistics');
    }
  }, []);

  // Refetch data
  const refetch = useCallback(() => {
    fetchPayments();
    fetchStats();
  }, [fetchPayments, fetchStats]);

  // Fetch data on mount and when params change
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    payments,
    pagination,
    stats,
    statsError,
    isLoading,
    error,
    refetch,
    setError
  };
}

/**
 * Hook for tenant-specific payments
 */
export function useTenantPayments(tenantId: number) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PaymentError | null>(null);

  // Fetch tenant payments
  const fetchTenantPayments = useCallback(async (params?: { page?: number; limit?: number; status?: any }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.getTenantPayments({
        tenantId,
        ...params
      });

      setPayments(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const error = err as PaymentError;
      setError(error);
      toast.error(error.message || 'Failed to fetch tenant payments');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  // Refresh payments
  const refresh = useCallback(() => {
    fetchTenantPayments();
  }, [fetchTenantPayments]);

  // Initial fetch
  useEffect(() => {
    fetchTenantPayments();
  }, [fetchTenantPayments]);

  return {
    payments,
    pagination,
    isLoading,
    error,
    fetchTenantPayments,
    refresh,
    setError
  };
}

/**
 * Hook for property-specific payments
 */
export function usePropertyPayments(propertyId: number) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PaymentError | null>(null);

  // Fetch property payments
  const fetchPropertyPayments = useCallback(async (params?: { page?: number; limit?: number; status?: any }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await paymentService.getPropertyPayments({
        propertyId,
        ...params
      });

      setPayments(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const error = err as PaymentError;
      setError(error);
      toast.error(error.message || 'Failed to fetch property payments');
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  // Refresh payments
  const refresh = useCallback(() => {
    fetchPropertyPayments();
  }, [fetchPropertyPayments]);

  // Initial fetch
  useEffect(() => {
    fetchPropertyPayments();
  }, [fetchPropertyPayments]);

  return {
    payments,
    pagination,
    isLoading,
    error,
    fetchPropertyPayments,
    refresh,
    setError
  };
}
