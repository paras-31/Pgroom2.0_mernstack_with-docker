/**
 * Payment Context
 *
 * Global state management for payments using React Context API.
 * Provides centralized payment state and actions across the application.
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import {
  Payment,
  PaymentStats,
  MonthlyAnalyticsData,
  PaymentError,
  PaymentFilters,
  PaginationMeta,
  PaymentContextType,
  CreatePaymentOrderRequest,
  PaymentVerificationRequest,
  RefundRequest,
  CancelPaymentRequest,
  PaymentListParams,
  TenantPaymentsRequest,
  PropertyPaymentsRequest
} from '@/lib/types/payment';
import { paymentService } from '@/lib/api/services';

// Payment State Interface
interface PaymentState {
  payments: Payment[];
  currentPayment: Payment | null;
  stats: PaymentStats | null;
  monthlyAnalytics: MonthlyAnalyticsData[];
  recentPayments: Payment[];
  isLoading: boolean;
  error: PaymentError | null;
  filters: PaymentFilters;
  pagination: PaginationMeta | null;
}

// Payment Action Types
type PaymentAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: PaymentError | null }
  | { type: 'SET_PAYMENTS'; payload: { payments: Payment[]; pagination: PaginationMeta } }
  | { type: 'SET_CURRENT_PAYMENT'; payload: Payment | null }
  | { type: 'SET_STATS'; payload: PaymentStats }
  | { type: 'SET_MONTHLY_ANALYTICS'; payload: MonthlyAnalyticsData[] }
  | { type: 'SET_RECENT_PAYMENTS'; payload: Payment[] }
  | { type: 'SET_FILTERS'; payload: Partial<PaymentFilters> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'UPDATE_PAYMENT'; payload: Payment }
  | { type: 'REMOVE_PAYMENT'; payload: number }
  | { type: 'RESET_STATE' };

// Initial State
const initialState: PaymentState = {
  payments: [],
  currentPayment: null,
  stats: null,
  monthlyAnalytics: [],
  recentPayments: [],
  isLoading: false,
  error: null,
  filters: {},
  pagination: null
};

// Payment Reducer
function paymentReducer(state: PaymentState, action: PaymentAction): PaymentState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_PAYMENTS':
      return {
        ...state,
        payments: action.payload.payments,
        pagination: action.payload.pagination,
        isLoading: false,
        error: null
      };

    case 'SET_CURRENT_PAYMENT':
      return { ...state, currentPayment: action.payload, isLoading: false, error: null };

    case 'SET_STATS':
      return { ...state, stats: action.payload, isLoading: false, error: null };

    case 'SET_MONTHLY_ANALYTICS':
      return { ...state, monthlyAnalytics: action.payload, isLoading: false, error: null };

    case 'SET_RECENT_PAYMENTS':
      return { ...state, recentPayments: action.payload, isLoading: false, error: null };

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case 'CLEAR_FILTERS':
      return { ...state, filters: {} };

    case 'ADD_PAYMENT':
      return {
        ...state,
        payments: [action.payload, ...state.payments],
        recentPayments: [action.payload, ...state.recentPayments.slice(0, 9)]
      };

    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(payment =>
          payment.id === action.payload.id ? action.payload : payment
        ),
        currentPayment: state.currentPayment?.id === action.payload.id ? action.payload : state.currentPayment,
        recentPayments: state.recentPayments.map(payment =>
          payment.id === action.payload.id ? action.payload : payment
        )
      };

    case 'REMOVE_PAYMENT':
      return {
        ...state,
        payments: state.payments.filter(payment => payment.id !== action.payload),
        recentPayments: state.recentPayments.filter(payment => payment.id !== action.payload),
        currentPayment: state.currentPayment?.id === action.payload ? null : state.currentPayment
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Create Context
const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

// Payment Provider Component
interface PaymentProviderProps {
  children: ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(paymentReducer, initialState);

  // Action Creators
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: PaymentError | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const setFilters = useCallback((filters: Partial<PaymentFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // API Action Creators
  const createPaymentOrder = useCallback(async (data: CreatePaymentOrderRequest) => {
    setLoading(true);
    clearError();

    try {
      const response = await paymentService.createPaymentOrder(data);
      return response;
    } catch (error) {
      setError(error as PaymentError);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const verifyPayment = useCallback(async (data: PaymentVerificationRequest) => {
    setLoading(true);
    clearError();

    try {
      const response = await paymentService.verifyPayment(data);

      // Update payment in state
      if (response.payment) {
        dispatch({ type: 'UPDATE_PAYMENT', payload: response.payment });
      }

      return response;
    } catch (error) {
      setError(error as PaymentError);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const getPayments = useCallback(async (params?: PaymentListParams) => {
    setLoading(true);
    clearError();

    try {
      const response = await paymentService.getPayments(params);
      dispatch({
        type: 'SET_PAYMENTS',
        payload: { payments: response.data, pagination: response.pagination }
      });
      return response;
    } catch (error) {
      setError(error as PaymentError);
      throw error;
    }
  }, [setLoading, clearError, setError]);

  const getPaymentById = useCallback(async (id: number) => {
    setLoading(true);
    clearError();

    try {
      const payment = await paymentService.getPaymentById(id);
      dispatch({ type: 'SET_CURRENT_PAYMENT', payload: payment });
      return payment;
    } catch (error) {
      setError(error as PaymentError);
      throw error;
    }
  }, [setLoading, clearError, setError]);

  const getTenantPayments = useCallback(async (params: TenantPaymentsRequest) => {
    setLoading(true);
    clearError();

    try {
      const response = await paymentService.getTenantPayments(params);
      return response;
    } catch (error) {
      setError(error as PaymentError);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const getPropertyPayments = useCallback(async (params: PropertyPaymentsRequest) => {
    setLoading(true);
    clearError();

    try {
      const response = await paymentService.getPropertyPayments(params);
      return response;
    } catch (error) {
      setError(error as PaymentError);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const initiateRefund = useCallback(async (data: RefundRequest) => {
    setLoading(true);
    clearError();

    try {
      const response = await paymentService.initiateRefund(data);

      // Update payment in state
      if (response.payment) {
        dispatch({ type: 'UPDATE_PAYMENT', payload: response.payment });
      }

      return response;
    } catch (error) {
      setError(error as PaymentError);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const getPaymentStats = useCallback(async () => {
    setLoading(true);
    clearError();

    try {
      const stats = await paymentService.getPaymentStats();
      dispatch({ type: 'SET_STATS', payload: stats });
      return stats;
    } catch (error) {
      setError(error as PaymentError);
      throw error;
    }
  }, [setLoading, clearError, setError]);

  const getRecentPayments = useCallback(async () => {
    setLoading(true);
    clearError();

    try {
      const payments = await paymentService.getRecentPayments();
      dispatch({ type: 'SET_RECENT_PAYMENTS', payload: payments });
      return payments;
    } catch (error) {
      setError(error as PaymentError);
      throw error;
    }
  }, [setLoading, clearError, setError]);

  const getMonthlyAnalytics = useCallback(async () => {
    setLoading(true);
    clearError();

    try {
      const analytics = await paymentService.getMonthlyAnalytics();
      dispatch({ type: 'SET_MONTHLY_ANALYTICS', payload: analytics });
      return analytics;
    } catch (error) {
      setError(error as PaymentError);
      throw error;
    }
  }, [setLoading, clearError, setError]);

  const cancelPayment = useCallback(async (data: CancelPaymentRequest) => {
    setLoading(true);
    clearError();

    try {
      const response = await paymentService.cancelPayment(data);

      // Update the payment in the state
      dispatch({
        type: 'UPDATE_PAYMENT',
        payload: response.payment
      });

      return response;
    } catch (error) {
      setError(error as PaymentError);
      throw error;
    }
  }, [setLoading, clearError, setError]);

  // Context Value
  const contextValue: PaymentContextType = {
    // State
    ...state,

    // Actions
    createPaymentOrder,
    verifyPayment,
    getPayments,
    getPaymentById,
    getTenantPayments,
    getPropertyPayments,
    initiateRefund,
    cancelPayment,
    getPaymentStats,
    getRecentPayments,
    getMonthlyAnalytics,
    setFilters,
    clearError,
    resetState
  };

  return (
    <PaymentContext.Provider value={contextValue}>
      {children}
    </PaymentContext.Provider>
  );
};

// Custom Hook to use Payment Context
export const usePaymentContext = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePaymentContext must be used within a PaymentProvider');
  }
  return context;
};

export default PaymentContext;
