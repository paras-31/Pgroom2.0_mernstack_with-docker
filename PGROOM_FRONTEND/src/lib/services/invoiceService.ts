/**
 * Invoice Service
 *
 * Professional PDF invoice generation service using jsPDF.
 * Creates well-formatted, branded invoices with payment details.
 */

import jsPDF from 'jspdf';
import { format } from 'date-fns';
import {
  InvoiceData,
  PDFGenerationOptions,
  InvoiceGenerationResult,
  InvoiceServiceInterface,
  DEFAULT_PDF_OPTIONS,
  DEFAULT_TEMPLATE_CONFIG,
  DEFAULT_COMPANY_INFO
} from '@/lib/types/invoice';
import { Payment } from '@/lib/types/payment';

/**
 * Invoice Service Class
 * Handles PDF generation, formatting, and download functionality
 */
class InvoiceService implements InvoiceServiceInterface {
  private readonly config = DEFAULT_TEMPLATE_CONFIG;

  /**
   * Generate invoice PDF from payment data
   */
  async generateInvoice(
    data: InvoiceData,
    options: PDFGenerationOptions = DEFAULT_PDF_OPTIONS
  ): Promise<InvoiceGenerationResult> {
    try {
      // Validate input data
      if (!data || !data.payment || !data.company) {
        throw new Error('Invalid invoice data: missing required fields');
      }

      if (!data.payment.id || !data.payment.amount) {
        throw new Error('Invalid payment data: missing payment ID or amount');
      }

      const pdf = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'mm',
        format: options.format || 'a4'
      });

      // Set up document properties
      pdf.setProperties({
        title: `Invoice ${data.invoiceNumber}`,
        subject: 'Payment Invoice',
        author: data.company.name,
        creator: 'Property Hub Invoice System'
      });

      // Generate invoice content
      await this.generateInvoiceContent(pdf, data, options);

      // Create blob for download
      const blob = pdf.output('blob');
      const filename = options.filename || this.generateFilename(data);

      return {
        success: true,
        filename,
        blob
      };
    } catch (error) {
      console.error('Invoice generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Download invoice directly
   */
  async downloadInvoice(
    data: InvoiceData,
    options: PDFGenerationOptions = DEFAULT_PDF_OPTIONS
  ): Promise<void> {
    const result = await this.generateInvoice(data, options);

    if (!result.success || !result.blob || !result.filename) {
      throw new Error(result.error || 'Failed to generate invoice');
    }

    // Create download link
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);
  }

  /**
   * Generate preview URL for invoice
   */
  async previewInvoice(
    data: InvoiceData,
    options: PDFGenerationOptions = DEFAULT_PDF_OPTIONS
  ): Promise<string> {
    const result = await this.generateInvoice(data, options);

    if (!result.success || !result.blob) {
      throw new Error(result.error || 'Failed to generate invoice preview');
    }

    return URL.createObjectURL(result.blob);
  }

  /**
   * Generate clean invoice content in PDF
   */
  private async generateInvoiceContent(
    pdf: jsPDF,
    data: InvoiceData,
    options: PDFGenerationOptions
  ): Promise<void> {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = options.margins || DEFAULT_PDF_OPTIONS.margins!;

    let yPosition = margin.top;

    // Clean Header
    yPosition = this.addCleanHeader(pdf, data, yPosition, pageWidth, margin);

    // Company and Invoice Info
    yPosition = this.addCompanyInfo(pdf, data, yPosition, pageWidth, margin);

    // Bill To Section
    yPosition = this.addBillToSection(pdf, data, yPosition, pageWidth, margin);

    // Payment Details Table
    yPosition = this.addPaymentTable(pdf, data, yPosition, pageWidth, margin);

    // Total and Summary
    yPosition = this.addTotalSection(pdf, data, yPosition, pageWidth, margin);

    // Simple Footer
    this.addSimpleFooter(pdf, data, pageHeight, pageWidth, margin);
  }

  /**
   * Simple professional header
   */
  private addCleanHeader(
    pdf: jsPDF,
    data: InvoiceData,
    yPosition: number,
    pageWidth: number,
    margin: any
  ): number {
    const [r, g, b] = this.hexToRgb(this.config.primaryColor);

    // Company name - bigger and bold
    pdf.setFontSize(this.config.fontSize.title + 2);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(data.company.name, margin.left, yPosition);

    // Invoice section - right side
    pdf.setFontSize(this.config.fontSize.title);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(r, g, b);
    const invoiceText = 'INVOICE';
    const titleWidth = pdf.getTextWidth(invoiceText);
    pdf.text(invoiceText, pageWidth - margin.right - titleWidth, yPosition);

    // Invoice number
    pdf.setFontSize(this.config.fontSize.body);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    const numberText = `#${data.invoiceNumber}`;
    const numberWidth = pdf.getTextWidth(numberText);
    pdf.text(numberText, pageWidth - margin.right - numberWidth, yPosition + 8);

    // Simple line separator
    pdf.setDrawColor(r, g, b);
    pdf.setLineWidth(2);
    pdf.line(margin.left, yPosition + 15, pageWidth - margin.right, yPosition + 15);

    return yPosition + 25;
  }

  /**
   * Simple company and invoice info
   */
  private addCompanyInfo(
    pdf: jsPDF,
    data: InvoiceData,
    yPosition: number,
    pageWidth: number,
    margin: any
  ): number {
    const leftColumnX = margin.left;
    const rightColumnX = pageWidth / 2 + 10;

    // Company details (left column)
    pdf.setFontSize(this.config.fontSize.body);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    const companyLines = [
      data.company.address,
      `${data.company.city}, ${data.company.state} ${data.company.pincode}`,
      data.company.phone || '',
      data.company.email || ''
    ].filter(Boolean);

    companyLines.forEach((line, index) => {
      pdf.text(line, leftColumnX, yPosition + (index * this.config.spacing.line));
    });

    // Invoice details (right column)
    pdf.setFontSize(this.config.fontSize.body);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Invoice Number:', rightColumnX, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.invoiceNumber, rightColumnX + 40, yPosition);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Invoice Date:', rightColumnX, yPosition + this.config.spacing.line);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.invoiceDate, rightColumnX + 40, yPosition + this.config.spacing.line);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Status:', rightColumnX, yPosition + (this.config.spacing.line * 2));
    pdf.setFont('helvetica', 'bold');
    const [r, g, b] = this.hexToRgb(this.config.primaryColor);
    pdf.setTextColor(r, g, b);
    pdf.text('PAID', rightColumnX + 40, yPosition + (this.config.spacing.line * 2));

    return yPosition + Math.max(companyLines.length * this.config.spacing.line, 18) + this.config.spacing.section;
  }

  /**
   * Simple Bill To section with clear labels
   */
  private addBillToSection(
    pdf: jsPDF,
    data: InvoiceData,
    yPosition: number,
    pageWidth: number,
    margin: any
  ): number {
    // Bill To header
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    const [r, g, b] = this.hexToRgb(this.config.primaryColor);
    pdf.setTextColor(r, g, b);
    pdf.text('BILL TO:', margin.left, yPosition);

    yPosition += 10;

    // Tenant Name
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Tenant Name:', margin.left, yPosition);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    const tenantName = data.payment.tenant
      ? `${data.payment.tenant.firstName} ${data.payment.tenant.lastName}`
      : 'N/A';
    pdf.text(tenantName, margin.left + 35, yPosition);

    yPosition += 8;

    // Property Name
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Property Name:', margin.left, yPosition);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const propertyName = data.payment.property?.propertyName || 'N/A';
    pdf.text(propertyName, margin.left + 35, yPosition);

    yPosition += 8;

    // Room Number
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Room Number:', margin.left, yPosition);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(r, g, b);
    const roomNumber = data.payment.room?.roomNo ? `Room ${data.payment.room.roomNo}` : 'N/A';
    pdf.text(roomNumber, margin.left + 35, yPosition);

    yPosition += 8;

    // Email
    if (data.payment.tenant?.email) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Email:', margin.left, yPosition);

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(data.payment.tenant.email, margin.left + 35, yPosition);

      yPosition += 8;
    }

    return yPosition + 15;
  }

  /**
   * Simple payment table
   */
  private addPaymentTable(
    pdf: jsPDF,
    data: InvoiceData,
    yPosition: number,
    pageWidth: number,
    margin: any
  ): number {
    const tableStartY = yPosition;
    const tableWidth = pageWidth - margin.left - margin.right;
    const rowHeight = 15;
    const headerHeight = 12;
    const [r, g, b] = this.hexToRgb(this.config.primaryColor);
    const cellPadding = 5;

    // Table header background
    pdf.setFillColor(r, g, b);
    pdf.rect(margin.left, tableStartY, tableWidth, headerHeight, 'F');

    // Table headers with proper spacing
    pdf.setFontSize(this.config.fontSize.body);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);

    const headers = ['Description', 'Payment Method', 'Status', 'Amount'];
    const columnWidths = [tableWidth * 0.35, tableWidth * 0.25, tableWidth * 0.15, tableWidth * 0.25];
    let xPosition = margin.left;

    // Draw header text with padding
    headers.forEach((header, index) => {
      pdf.text(header, xPosition + cellPadding, tableStartY + 8);
      xPosition += columnWidths[index];
    });

    // Draw vertical lines for header
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.5);
    xPosition = margin.left;
    for (let i = 1; i < headers.length; i++) {
      xPosition += columnWidths[i - 1];
      pdf.line(xPosition, tableStartY, xPosition, tableStartY + headerHeight);
    }

    // Table row background
    yPosition = tableStartY + headerHeight;
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin.left, yPosition, tableWidth, rowHeight, 'F');

    // Row data with proper formatting
    pdf.setFontSize(this.config.fontSize.body);
    pdf.setTextColor(0, 0, 0);

    const description = data.description || 'Monthly Rent Payment';
    const amount = this.formatCurrency(data.payment.amount, data.payment.currency);
    const paymentMethod = this.formatPaymentMethod(data.payment.paymentMethodDetails || data.payment.paymentMethod);
    const status = this.formatStatus(data.payment.status);

    const rowData = [description, paymentMethod, status, amount];
    xPosition = margin.left;

    // Draw row data with padding and proper alignment
    rowData.forEach((cellData, index) => {
      if (index === 3) { // Amount column - bold and right-aligned
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(r, g, b);
        const textWidth = pdf.getTextWidth(cellData);
        pdf.text(cellData, xPosition + columnWidths[index] - cellPadding - textWidth, yPosition + 10);
      } else if (index === 2) { // Status column - centered
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(22, 163, 74); // Green for completed status
        const textWidth = pdf.getTextWidth(cellData);
        pdf.text(cellData, xPosition + (columnWidths[index] - textWidth) / 2, yPosition + 10);
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(cellData, xPosition + cellPadding, yPosition + 10);
      }
      xPosition += columnWidths[index];
    });

    // Draw vertical lines for data row
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.5);
    xPosition = margin.left;
    for (let i = 1; i < headers.length; i++) {
      xPosition += columnWidths[i - 1];
      pdf.line(xPosition, yPosition, xPosition, yPosition + rowHeight);
    }

    // Table borders
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(1);
    pdf.rect(margin.left, tableStartY, tableWidth, headerHeight + rowHeight);

    // Horizontal line between header and data
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.5);
    pdf.line(margin.left, tableStartY + headerHeight, margin.left + tableWidth, tableStartY + headerHeight);

    return yPosition + rowHeight + 20;
  }

  /**
   * Simple total section
   */
  private addTotalSection(
    pdf: jsPDF,
    data: InvoiceData,
    yPosition: number,
    pageWidth: number,
    margin: any
  ): number {
    // Total amount - in one line, right aligned
    const [r, g, b] = this.hexToRgb(this.config.primaryColor);
    const amount = this.formatCurrency(data.payment.amount, data.payment.currency);

    // Draw a subtle line above total
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.5);
    pdf.line(pageWidth - margin.right - 100, yPosition - 5, pageWidth - margin.right, yPosition - 5);

    // Total Amount label
    pdf.setFontSize(this.config.fontSize.heading);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Total Amount:', pageWidth - margin.right - 100, yPosition + 5);

    // Amount value with proper formatting
    pdf.setFontSize(this.config.fontSize.heading + 2);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(r, g, b);
    const amountWidth = pdf.getTextWidth(amount);
    pdf.text(amount, pageWidth - margin.right - amountWidth, yPosition + 5);

    yPosition += 25;

    // Transaction details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(r, g, b);
    pdf.text('Transaction Details:', margin.left, yPosition);

    yPosition += 10;

    // Payment ID
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Payment ID:', margin.left, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`#${data.payment.id.toString().padStart(6, '0')}`, margin.left + 30, yPosition);

    yPosition += 6;

    // Transaction ID
    if (data.payment.razorpayPaymentId) {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Transaction ID:', margin.left, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(data.payment.razorpayPaymentId, margin.left + 30, yPosition);

      yPosition += 6;
    }

    // Payment date
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Payment Date:', margin.left, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const paymentDate = format(new Date(data.payment.createdAt), 'MMM dd, yyyy hh:mm a');
    pdf.text(paymentDate, margin.left + 30, yPosition);

    return yPosition + 20;
  }

  /**
   * Simple professional footer
   */
  private addSimpleFooter(
    pdf: jsPDF,
    data: InvoiceData,
    pageHeight: number,
    pageWidth: number,
    margin: any
  ): void {
    const footerY = pageHeight - margin.bottom - 25;
    const [r, g, b] = this.hexToRgb(this.config.primaryColor);

    // Top line separator
    pdf.setDrawColor(r, g, b);
    pdf.setLineWidth(2);
    pdf.line(margin.left, footerY, pageWidth - margin.right, footerY);

    // Thank you message - centered
    pdf.setFontSize(this.config.fontSize.body + 1);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(r, g, b);
    const thankYouText = 'Thank you for your payment!';
    const textWidth = pdf.getTextWidth(thankYouText);
    pdf.text(thankYouText, (pageWidth - textWidth) / 2, footerY + 10);

    // Contact info - left side
    pdf.setFontSize(this.config.fontSize.small);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(data.company.email || 'info@propertyhub.com', margin.left, footerY + 18);

    // Generation date - right side
    pdf.setFontSize(this.config.fontSize.small);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    const dateText = `Generated: ${format(new Date(), 'MMM dd, yyyy')}`;
    const dateWidth = pdf.getTextWidth(dateText);
    pdf.text(dateText, pageWidth - margin.right - dateWidth, footerY + 18);
  }

  /**
   * Format currency amount with proper rupee symbol for PDF
   */
  private formatCurrency(amount: number, currency: string = 'INR'): string {
    if (currency === 'INR') {
      // Use Rs. for better PDF compatibility and Indian formatting
      const formattedAmount = amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return `Rs. ${formattedAmount}`;
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format payment method for display
   */
  private formatPaymentMethod(method?: string): string {
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
  }

  /**
   * Format status for display
   */
  private formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'Captured': 'Completed',
      'Authorized': 'Authorized',
      'Pending': 'Pending',
      'Failed': 'Failed',
      'Refunded': 'Refunded'
    };

    return statusMap[status] || status;
  }

  /**
   * Convert hex color to RGB array
   */
  private hexToRgb(hex: string): [number, number, number] {
    // Remove # if present and ensure valid format
    const cleanHex = hex.replace('#', '');

    // Handle 3-digit hex codes (e.g., #43A -> #4433AA)
    const fullHex = cleanHex.length === 3
      ? cleanHex.split('').map(char => char + char).join('')
      : cleanHex;

    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);

    if (!result) {
      console.warn(`Invalid hex color: ${hex}, using default black`);
      return [0, 0, 0];
    }

    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ];
  }

  /**
   * Generate filename for the invoice
   */
  private generateFilename(data: InvoiceData): string {
    const tenantName = data.payment.tenant
      ? `${data.payment.tenant.firstName}_${data.payment.tenant.lastName}`
      : 'Unknown';
    const date = format(new Date(data.payment.createdAt), 'yyyy-MM-dd');
    return `Invoice_${data.invoiceNumber}_${tenantName}_${date}.pdf`;
  }
}

// Export singleton instance
export const invoiceService = new InvoiceService();
export default invoiceService;
