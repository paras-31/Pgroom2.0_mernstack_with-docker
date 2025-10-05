// filepath: /src/pages/admin/Payments.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  DollarSign, 
  CreditCard, 
  AlertCircle, 
  Calendar, 
  Eye, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  RefreshCw,
  Download,
  Plus,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import { usePaymentList, usePaymentAnalytics } from '@/hooks/usePayments';
import { useInvoiceDownload } from '@/hooks/useInvoiceDownload';
import { paymentService } from '@/lib/api/services';
import { Payment, PaymentStatus, PaymentMethod } from '@/lib/types/payment';
import { cn } from '@/lib/utils';

/**
 * AdminPayments - Comprehensive payments management page for administrators
 * Features: Real-time data, advanced filtering, payment analytics, and system integration
 */
const AdminPayments: React.FC = () => {
  // Local state for filters and UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Payment management with real-time data using the list hook
  const {
    payments,
    pagination,
    isLoading,
    error,
    refetch
  } = usePaymentList({
    page: currentPage,
    limit: 10,
    status: statusFilter !== 'all' ? statusFilter as PaymentStatus : undefined
  });

  // Payment analytics hook for stats
  const {
    stats,
    monthlyAnalytics,
    recentPayments,
    isLoading: isLoadingAnalytics,
    refresh: refreshAnalytics
  } = usePaymentAnalytics();

  // Invoice download hook
  const {
    isGenerating,
    downloadInvoice,
    error: invoiceError
  } = useInvoiceDownload();

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((type: string, value: string) => {
    switch (type) {
      case 'status':
        setStatusFilter(value);
        setCurrentPage(1); // Reset to first page when filtering
        break;
      case 'method':
        setMethodFilter(value);
        setCurrentPage(1); // Reset to first page when filtering
        break;
    }
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
    refreshAnalytics();
    toast.success('Data refreshed successfully');
  }, [refetch, refreshAnalytics]);

  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setMethodFilter('all');
    setCurrentPage(1);
  }, []);

  // View payment details
  const handleViewDetails = useCallback((payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailsModalOpen(true);
  }, []);

  // Download invoice for payment
  const handleDownloadInvoice = useCallback(async (payment: Payment) => {
    try {
      await downloadInvoice(payment);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      // Error toast is already handled by the hook
    }
  }, [downloadInvoice]);

  // Status badge styling
  const getStatusBadge = (status: PaymentStatus) => {
    const styles = {
      Captured: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      Failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      Refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    
    return (
      <Badge className={cn(styles[status] || styles.Pending)}>
        {status === 'Captured' && <CheckCircle className="w-3 h-3 mr-1" />}
        {status === 'Failed' && <XCircle className="w-3 h-3 mr-1" />}
        {status === 'Pending' && <AlertCircle className="w-3 h-3 mr-1" />}
        {status === 'Captured' ? 'Complete' : status}
      </Badge>
    );
  };

  // Payment method badge styling
  const getMethodBadge = (method?: PaymentMethod, details?: string) => {
    if (!method) return <span className="text-muted-foreground">-</span>;
    
    const displayMethod = details || method;
    const styles = {
      UPI: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Cash: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    
    return (
      <Badge variant="outline" className={cn(styles[method] || styles.UPI)}>
        {displayMethod}
      </Badge>
    );
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Calculate days overdue (mock function - would need due date from backend)
  const getDaysOverdue = (createdAt: string) => {
    const created = new Date(createdAt);
    const today = new Date();
    const diffTime = today.getTime() - created.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30 ? diffDays - 30 : 0; // Assuming 30-day payment cycle
  };

  // Get unique payment methods for filter
  const uniqueMethods = useMemo(() => {
    if (!payments) return [];
    return Array.from(new Set(
      payments
        .filter(p => p.paymentMethod)
        .map(payment => payment.paymentMethodDetails || payment.paymentMethod!)
        .filter(Boolean)
    )) as string[];
  }, [payments]);

  // Filter payments based on search term and method
  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    
    return payments.filter(payment => {
      const matchesSearch = !searchTerm || 
        payment.id.toString().includes(searchTerm) ||
        (payment.tenant && 
          `${payment.tenant.firstName} ${payment.tenant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.property && 
          payment.property.propertyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.room && 
          payment.room.roomNo.toString().includes(searchTerm));

      const matchesMethod = methodFilter === 'all' || 
        payment.paymentMethod === methodFilter ||
        payment.paymentMethodDetails === methodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [payments, searchTerm, methodFilter]);

  // Calculate summary stats from real data
  const summaryStats = useMemo(() => {
    if (!filteredPayments.length) {
      return {
        totalAmount: 0,
        completedAmount: 0,
        completedCount: 0,
        pendingCount: 0,
        failedCount: 0,
        refundedAmount: 0
      };
    }

    const completed = filteredPayments.filter(p => p.status === 'Captured');
    const pending = filteredPayments.filter(p => p.status === 'Pending');
    const failed = filteredPayments.filter(p => p.status === 'Failed');
    const refunded = filteredPayments.filter(p => p.status === 'Refunded');

    return {
      totalAmount: filteredPayments.reduce((sum, p) => sum + p.amount, 0),
      completedAmount: completed.reduce((sum, p) => sum + p.amount, 0),
      completedCount: completed.length,
      pendingCount: pending.length,
      failedCount: failed.length,
      refundedAmount: refunded.reduce((sum, p) => sum + p.amount, 0)
    };
  }, [filteredPayments]);

  // Export all payments
  const handleExportPayments = useCallback(async () => {
    try {
      if (!filteredPayments || filteredPayments.length === 0) {
        toast.warning('No payments to export');
        return;
      }

      // Create CSV content
      const headers = [
        'Payment ID',
        'Tenant Name',
        'Property',
        'Room',
        'Amount',
        'Status',
        'Payment Method',
        'Created Date',
        'Payment Date',
        'Transaction ID'
      ];

      const csvContent = [
        headers.join(','),
        ...filteredPayments.map(payment => [
          `PAY-${payment.id}`,
          payment.tenant ? `"${payment.tenant.firstName} ${payment.tenant.lastName}"` : 'N/A',
          payment.property ? `"${payment.property.propertyName}"` : 'N/A',
          payment.room?.roomNo || 'N/A',
          payment.amount,
          payment.status,
          payment.paymentMethodDetails || payment.paymentMethod || 'N/A',
          new Date(payment.createdAt).toLocaleDateString(),
          payment.status === 'Captured' ? new Date(payment.updatedAt).toLocaleDateString() : 'Pending',
          payment.razorpayPaymentId || 'N/A'
        ].join(','))
      ].join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${filteredPayments.length} payments successfully`);
    } catch (error) {
      toast.error('Failed to export payments');
      console.error('Export error:', error);
    }
  }, [filteredPayments]);

  return (
    <DashboardLayout navbar={<AdminNavbar />} sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Payments Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Track payments, manage transactions, and monitor financial performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button onClick={handleExportPayments} disabled={!filteredPayments || filteredPayments.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {formatCurrency(summaryStats.totalAmount)}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                All transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collected</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(summaryStats.completedAmount)}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {summaryStats.completedCount} complete payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <CreditCard className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-yellow-600">
                  {summaryStats.pendingCount}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-red-600">
                  {summaryStats.failedCount}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Failed transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by tenant, property, room, or payment ID..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Captured">Complete</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={methodFilter} onValueChange={(value) => handleFilterChange('method', value)}>
                <SelectTrigger className="w-full lg:w-[160px]">
                  <CreditCard className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  {uniqueMethods.map(method => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchTerm || statusFilter !== 'all' || methodFilter !== 'all') && (
                <Button variant="outline" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredPayments && filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">PAY-{payment.id}</TableCell>
                        <TableCell>
                          {payment.tenant ? 
                            `${payment.tenant.firstName} ${payment.tenant.lastName}` : 
                            'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          {payment.property?.propertyName || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {payment.room?.roomNo || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(payment.amount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Rent
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payment.status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {payment.status === 'Captured' ? 
                              new Date(payment.updatedAt).toLocaleDateString() : 
                              '-'
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          {getMethodBadge(payment.paymentMethod, payment.paymentMethodDetails)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(payment)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {(payment.status === 'Captured' || payment.status === 'Failed') && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDownloadInvoice(payment)}
                                    className="text-blue-600"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Invoice
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <CreditCard className="w-8 h-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No payments found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage >= pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Details Modal */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Complete information about this payment transaction
              </DialogDescription>
            </DialogHeader>
            
            {selectedPayment && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Payment ID</p>
                    <p className="font-medium">PAY-{selectedPayment.id}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    {getStatusBadge(selectedPayment.status)}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Amount</p>
                    <p className="text-lg font-bold">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                    {getMethodBadge(selectedPayment.paymentMethod, selectedPayment.paymentMethodDetails)}
                  </div>
                </div>

                {selectedPayment.tenant && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Tenant Details</p>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <p className="font-medium">{selectedPayment.tenant.firstName} {selectedPayment.tenant.lastName}</p>
                      <p className="text-sm text-muted-foreground">{selectedPayment.tenant.email}</p>
                      <p className="text-sm text-muted-foreground">{selectedPayment.tenant.mobileNo}</p>
                    </div>
                  </div>
                )}

                {selectedPayment.property && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Property Details</p>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <p className="font-medium">{selectedPayment.property.propertyName}</p>
                      <p className="text-sm text-muted-foreground">{selectedPayment.property.propertyAddress}</p>
                      {selectedPayment.room && (
                        <p className="text-sm text-muted-foreground">Room: {selectedPayment.room.roomNo}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Created At</p>
                    <p>{new Date(selectedPayment.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                    <p>{new Date(selectedPayment.updatedAt).toLocaleString()}</p>
                  </div>
                </div>

                {selectedPayment.razorpayPaymentId && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Transaction Details</p>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-1">
                      <p className="text-sm"><span className="font-medium">Razorpay Payment ID:</span> {selectedPayment.razorpayPaymentId}</p>
                      {selectedPayment.razorpayOrderId && (
                        <p className="text-sm"><span className="font-medium">Razorpay Order ID:</span> {selectedPayment.razorpayOrderId}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminPayments;
