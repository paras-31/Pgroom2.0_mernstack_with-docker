/**
 * Payment Components Index
 *
 * Centralized exports for all payment-related components
 */

export { default as PaymentTable } from './PaymentTable';
export { default as PaymentStats, DetailedPaymentStats } from './PaymentStats';
export { default as PaymentForm } from './PaymentForm';
export { default as PaymentFormModal } from './PaymentFormModal';
export { default as PaymentDetailsModal } from './PaymentDetailsModal';
export { default as PaymentFilters } from './PaymentFilters';
export { default as PaymentPagination } from './PaymentPagination';
export { default as RefundModal } from './RefundModal';
export { default as RefundConfirmationDialog } from './RefundConfirmationDialog';
export { default as CancelPaymentModal } from './CancelPaymentModal';
export { default as InvoiceTemplate } from './InvoiceTemplate';

// Re-export types for convenience
export type {
  Payment,
  PaymentStatus,
  PaymentMethod,
  CreatePaymentOrderRequest,
  PaymentVerificationRequest,
  RefundRequest,
  MonthlyAnalyticsData
} from '@/lib/types/payment';

// Re-export invoice types and services
export type {
  InvoiceData,
  PDFGenerationOptions,
  InvoiceGenerationResult,
  CompanyInfo
} from '@/lib/types/invoice';

export { invoiceService } from '@/lib/services/invoiceService';
export { useInvoiceDownload, useBatchInvoiceDownload } from '@/hooks/useInvoiceDownload';
