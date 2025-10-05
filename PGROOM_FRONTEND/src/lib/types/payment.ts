/**
 * Payment Types and Interfaces
 *
 * This file contains all TypeScript interfaces and types related to payments,
 * following the backend API structure and Razorpay integration.
 */

// Base payment status enum matching backend
export type PaymentStatus = 'Pending' | 'Captured' | 'Failed' | 'Refunded';

// Payment method enum matching backend
export type PaymentMethod = 'Cash' | 'UPI';

// Razorpay payment methods
export type RazorpayPaymentMethod = 'card' | 'netbanking' | 'wallet' | 'upi' | 'emi';

/**
 * Core Payment Interface
 */
export interface Payment {
  id: number;
  tenantId: number;
  propertyId: number;
  roomId: number;
  amount: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentMethodDetails?: string; // Stores detailed payment method from Razorpay (card, upi, netbanking, wallet, emi)
  createdAt: string;
  updatedAt: string;
  tenant?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    mobileNo: string;
  };
  property?: {
    id: number;
    propertyName: string;
    propertyAddress: string;
  };
  room?: {
    id: number;
    roomNo: number;
    rent: string;
  };
}

/**
 * Payment Order Creation Request
 */
export interface CreatePaymentOrderRequest {
  tenantId: number;
  propertyId: number;
  roomId: number;
  amount: number;
  description?: string;
}

/**
 * Payment Order Response
 */
export interface CreatePaymentOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
  payment: Payment;
  razorpayKeyId: string;
}

/**
 * Payment Verification Request
 */
export interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Payment Verification Response
 */
export interface PaymentVerificationResponse {
  success: boolean;
  payment: Payment;
  razorpayPayment?: any; // Razorpay payment object
}

/**
 * Payment List Request Parameters
 */
export interface PaymentListParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  tenantId?: number;
  propertyId?: number;
  roomId?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Pagination Metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Payment List Response
 */
export interface PaymentListResponse {
  data: Payment[];
  pagination: PaginationMeta;
}

/**
 * Tenant Payments Request
 */
export interface TenantPaymentsRequest {
  tenantId: number;
  page?: number;
  limit?: number;
  status?: PaymentStatus;
}

/**
 * Property Payments Request
 */
export interface PropertyPaymentsRequest {
  propertyId: number;
  page?: number;
  limit?: number;
  status?: PaymentStatus;
}

/**
 * Refund Request
 */
export interface RefundRequest {
  paymentId: number;
  amount?: number; // Optional for partial refund
  reason?: string;
}

/**
 * Refund Response
 */
export interface RefundResponse {
  success: boolean;
  refund: {
    id: string;
    amount: number;
    currency: string;
    payment_id: string;
    status: string;
    created_at: number;
  };
  payment: Payment;
}

/**
 * Payment Statistics
 */
export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  partiallyRefundedPayments?: number;
  successRate: number;
  currency?: string;
}

/**
 * Monthly Analytics Data Point
 */
export interface MonthlyAnalyticsData {
  month: string;
  totalAmount: number;
  totalPayments: number;
  successfulPayments: number;
}

/**
 * Razorpay Checkout Options
 */
export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

/**
 * Razorpay Payment Response
 */
export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/**
 * Payment Form Data for Creating Orders
 */
export interface PaymentFormData {
  tenantId: number;
  propertyId: number;
  roomId: number;
  amount: number;
  description: string;
}

/**
 * Payment Filter Options
 */
export interface PaymentFilters {
  status?: PaymentStatus;
  tenantId?: number;
  propertyId?: number;
  roomId?: number;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Payment Dashboard Summary
 */
export interface PaymentDashboardSummary {
  stats: PaymentStats;
  recentPayments: Payment[];
  monthlyAnalytics: MonthlyAnalyticsData[];
}

/**
 * Payment Error Types
 */
export interface PaymentError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Payment State for Context/Store
 */
export interface PaymentState {
  payments: Payment[];
  currentPayment: Payment | null;
  stats: PaymentStats | null;
  monthlyAnalytics: MonthlyAnalyticsData[];
  isLoading: boolean;
  error: PaymentError | null;
  filters: PaymentFilters;
  pagination: PaginationMeta | null;
}

/**
 * Cancel Payment Request Interface
 */
export interface CancelPaymentRequest {
  paymentId: number;
  reason?: string;
}

/**
 * Cancel Payment Response Interface
 */
export interface CancelPaymentResponse {
  success: boolean;
  payment: Payment;
  message: string;
}

/**
 * Payment Actions for Context/Store
 */
export interface PaymentActions {
  createPaymentOrder: (data: CreatePaymentOrderRequest) => Promise<CreatePaymentOrderResponse>;
  verifyPayment: (data: PaymentVerificationRequest) => Promise<PaymentVerificationResponse>;
  getPayments: (params?: PaymentListParams) => Promise<PaymentListResponse>;
  getPaymentById: (id: number) => Promise<Payment>;
  getTenantPayments: (params: TenantPaymentsRequest) => Promise<PaymentListResponse>;
  getPropertyPayments: (params: PropertyPaymentsRequest) => Promise<PaymentListResponse>;
  initiateRefund: (data: RefundRequest) => Promise<RefundResponse>;
  cancelPayment: (data: CancelPaymentRequest) => Promise<CancelPaymentResponse>;
  getPaymentStats: () => Promise<PaymentStats>;
  getRecentPayments: () => Promise<Payment[]>;
  getMonthlyAnalytics: () => Promise<MonthlyAnalyticsData[]>;
  setFilters: (filters: Partial<PaymentFilters>) => void;
  clearError: () => void;
  resetState: () => void;
}

/**
 * Invoice Download Options
 */
export interface InvoiceDownloadOptions {
  filename?: string;
  includeQRCode?: boolean;
  watermark?: string;
  format?: 'a4' | 'letter';
}

/**
 * Extended Payment interface with invoice capabilities
 */
export interface PaymentWithInvoice extends Payment {
  canDownloadInvoice: boolean;
  invoiceNumber?: string;
}

/**
 * Payment Context Type
 */
export interface PaymentContextType extends PaymentState, PaymentActions {}

/**
 * Razorpay Instance Type (for window.Razorpay)
 */
export interface RazorpayInstance {
  open(): void;
  close(): void;
  on(event: string, handler: Function): void;
}

/**
 * Window interface extension for Razorpay
 */
declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

export {};
