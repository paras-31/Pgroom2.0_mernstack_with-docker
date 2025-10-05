/**
 * Invoice Types and Interfaces
 *
 * TypeScript interfaces for invoice generation and PDF creation.
 * Follows the existing payment structure and adds invoice-specific data.
 */

import { Payment } from './payment';

/**
 * Company Information for Invoice Header
 */
export interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

/**
 * Invoice Data Structure
 */
export interface InvoiceData {
  // Invoice metadata
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;

  // Company information
  company: CompanyInfo;

  // Payment information
  payment: Payment;

  // Additional invoice details
  description?: string;
  notes?: string;
  terms?: string;
}

/**
 * PDF Generation Options
 */
export interface PDFGenerationOptions {
  filename?: string;
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  watermark?: string;
  includeQRCode?: boolean;
}

/**
 * Invoice Template Configuration
 */
export interface InvoiceTemplateConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: {
    title: number;
    heading: number;
    body: number;
    small: number;
  };
  spacing: {
    section: number;
    line: number;
  };
}

/**
 * Invoice Generation Result
 */
export interface InvoiceGenerationResult {
  success: boolean;
  filename?: string;
  blob?: Blob;
  error?: string;
}

/**
 * Invoice Service Interface
 */
export interface InvoiceServiceInterface {
  generateInvoice(data: InvoiceData, options?: PDFGenerationOptions): Promise<InvoiceGenerationResult>;
  downloadInvoice(data: InvoiceData, options?: PDFGenerationOptions): Promise<void>;
  previewInvoice(data: InvoiceData, options?: PDFGenerationOptions): Promise<string>;
}

/**
 * Default Company Information
 * This can be configured based on the application settings
 */
export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'Property Hub',
  address: '123 Business Street',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  phone: '+91 98765 43210',
  email: 'info@propertyhub.com',
  website: 'www.propertyhub.com'
};

/**
 * Default PDF Generation Options
 */
export const DEFAULT_PDF_OPTIONS: PDFGenerationOptions = {
  format: 'a4',
  orientation: 'portrait',
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
  includeQRCode: false
};

/**
 * Default Invoice Template Configuration
 */
export const DEFAULT_TEMPLATE_CONFIG: InvoiceTemplateConfig = {
  primaryColor: '#43AB4C', // Green from the app theme
  secondaryColor: '#f8f9fa',
  accentColor: '#6c757d',
  fontFamily: 'helvetica', // Use helvetica for PDF compatibility
  fontSize: {
    title: 20,
    heading: 14,
    body: 11,
    small: 9
  },
  spacing: {
    section: 15,
    line: 5
  }
};
