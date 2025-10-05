/**
 * Invoice Download Hook
 *
 * Custom hook for handling invoice generation and download functionality.
 * Provides loading states, error handling, and optimized performance.
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { invoiceService } from '@/lib/services/invoiceService';
import {
  InvoiceData,
  PDFGenerationOptions,
  DEFAULT_COMPANY_INFO,
  DEFAULT_PDF_OPTIONS
} from '@/lib/types/invoice';
import { Payment } from '@/lib/types/payment';

/**
 * Hook return interface
 */
interface UseInvoiceDownloadReturn {
  isGenerating: boolean;
  error: string | null;
  downloadInvoice: (payment: Payment, options?: PDFGenerationOptions) => Promise<void>;
  previewInvoice: (payment: Payment, options?: PDFGenerationOptions) => Promise<string | null>;
  clearError: () => void;
}

/**
 * Custom hook for invoice download functionality
 */
export const useInvoiceDownload = (): UseInvoiceDownloadReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Create invoice data from payment
   */
  const createInvoiceData = useCallback((payment: Payment): InvoiceData => {
    const invoiceNumber = `INV-${payment.id.toString().padStart(6, '0')}`;
    const invoiceDate = format(new Date(payment.createdAt), 'MMM dd, yyyy');

    return {
      invoiceNumber,
      invoiceDate,
      company: DEFAULT_COMPANY_INFO,
      payment,
      description: 'Monthly Rent Payment',
      terms: 'Payment is due within 30 days. Late payments may incur additional charges.',
      notes: 'Thank you for your business. For any queries, please contact our support team.'
    };
  }, []);

  /**
   * Download invoice for a payment
   */
  const downloadInvoice = useCallback(async (
    payment: Payment,
    options: PDFGenerationOptions = DEFAULT_PDF_OPTIONS
  ): Promise<void> => {
    if (isGenerating) {
      toast.warning('Invoice generation in progress', {
        description: 'Please wait for the current invoice to complete.'
      });
      return;
    }

    setIsGenerating(true);
    setError(null);

    // Show loading toast with green background
    const loadingToast = toast.loading('Generating invoice...', {
      description: 'Please wait while we prepare your invoice.',
      style: {
        backgroundColor: '#22c55e',
        color: '#000000',
        border: '1px solid #16a34a'
      }
    });

    try {
      // Validate payment data
      if (!payment || !payment.id) {
        throw new Error('Invalid payment data');
      }

      // Create invoice data
      const invoiceData = createInvoiceData(payment);

      // Generate and download invoice
      await invoiceService.downloadInvoice(invoiceData, options);

      // Small delay to ensure download completes
      await new Promise(resolve => setTimeout(resolve, 500));

      // Dismiss loading toast first
      toast.dismiss(loadingToast);

      // Success feedback
      toast.success('Invoice downloaded successfully!', {
        description: `Invoice for payment #${payment.id.toString().padStart(6, '0')} has been downloaded.`,
        duration: 4000
      });

    } catch (err) {
      // Dismiss loading toast on error too
      toast.dismiss(loadingToast);

      const errorMessage = err instanceof Error ? err.message : 'Failed to generate invoice';
      setError(errorMessage);

      toast.error('Invoice generation failed', {
        description: errorMessage,
        duration: 5000
      });

    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, createInvoiceData]);

  /**
   * Generate preview URL for invoice
   */
  const previewInvoice = useCallback(async (
    payment: Payment,
    options: PDFGenerationOptions = DEFAULT_PDF_OPTIONS
  ): Promise<string | null> => {
    if (isGenerating) {
      toast.warning('Invoice generation in progress', {
        description: 'Please wait for the current operation to complete.'
      });
      return null;
    }

    setIsGenerating(true);
    setError(null);

    // Show loading toast for preview too with green background
    const loadingToast = toast.loading('Generating preview...', {
      description: 'Please wait while we prepare the preview.',
      style: {
        backgroundColor: '#22c55e',
        color: '#000000',
        border: '1px solid #16a34a'
      }
    });

    try {
      // Validate payment data
      if (!payment || !payment.id) {
        throw new Error('Invalid payment data');
      }

      // Create invoice data
      const invoiceData = createInvoiceData(payment);

      // Generate preview
      const previewUrl = await invoiceService.previewInvoice(invoiceData, options);

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      return previewUrl;

    } catch (err) {
      // Dismiss loading toast on error
      toast.dismiss(loadingToast);

      const errorMessage = err instanceof Error ? err.message : 'Failed to generate invoice preview';
      setError(errorMessage);

      toast.error('Invoice preview failed', {
        description: errorMessage,
        duration: 5000
      });

      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, createInvoiceData]);

  return {
    isGenerating,
    error,
    downloadInvoice,
    previewInvoice,
    clearError
  };
};

/**
 * Hook for batch invoice operations
 */
export const useBatchInvoiceDownload = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  /**
   * Download multiple invoices
   */
  const downloadMultipleInvoices = useCallback(async (
    payments: Payment[],
    options: PDFGenerationOptions = DEFAULT_PDF_OPTIONS
  ): Promise<void> => {
    if (isProcessing) {
      toast.warning('Batch processing in progress');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setErrors([]);

    const loadingToast = toast.loading(`Processing ${payments.length} invoices...`);

    try {
      const results = [];

      for (let i = 0; i < payments.length; i++) {
        const payment = payments[i];

        try {
          const invoiceData = {
            invoiceNumber: `INV-${payment.id.toString().padStart(6, '0')}`,
            invoiceDate: format(new Date(payment.createdAt), 'MMM dd, yyyy'),
            company: DEFAULT_COMPANY_INFO,
            payment,
            description: 'Monthly Rent Payment'
          };

          const result = await invoiceService.generateInvoice(invoiceData, options);
          results.push(result);

          setProgress(((i + 1) / payments.length) * 100);
        } catch (err) {
          const errorMsg = `Failed to generate invoice for payment #${payment.id}: ${err instanceof Error ? err.message : 'Unknown error'}`;
          setErrors(prev => [...prev, errorMsg]);
        }
      }

      toast.dismiss(loadingToast);

      if (errors.length === 0) {
        toast.success(`Successfully generated ${results.length} invoices!`);
      } else {
        toast.warning(`Generated ${results.length - errors.length}/${payments.length} invoices`, {
          description: `${errors.length} invoices failed to generate.`
        });
      }

    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Batch processing failed', {
        description: err instanceof Error ? err.message : 'Unknown error occurred'
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [isProcessing, errors]);

  return {
    isProcessing,
    progress,
    errors,
    downloadMultipleInvoices
  };
};

export default useInvoiceDownload;
