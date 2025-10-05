import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, CreditCard, IndianRupee, Clock, CheckCircle, AlertCircle, Home, Users, Receipt, Building2, Star, TrendingUp, Eye, Download, MoreHorizontal, Search, Filter, FilterX } from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import TenantNavbar from '@/components/tenant/TenantNavbar';
import TenantSidebar from '@/components/tenant/TenantSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { RazorpayPayment } from '@/components/payments/RazorpayPayment';
import { PaymentDetailsModal } from '@/components/payments';
import { useTenantPayments } from '@/hooks/useTenantPayments';
import { useInvoiceDownload } from '@/hooks/useInvoiceDownload';
import { Payment, CreatePaymentOrderResponse, PaymentStatus } from '@/lib/types/payment';
import { toast } from 'sonner';

const TenantPayments = () => {
  const {
    tenantId,
    roomDetails,
    payments,
    stats,
    isLoading,
    isCreatingOrder,
    isVerifying,
    error,
    createPaymentOrder,
    verifyPayment,
    fetchPayments,
    refresh
  } = useTenantPayments();

  // Invoice download hook
  const { downloadInvoice, isGenerating, error: invoiceError, clearError } = useInvoiceDownload();

  const [currentOrderData, setCurrentOrderData] = useState<CreatePaymentOrderResponse | null>(null);
  
  // Filter and pagination states
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDownloading, setIsDownloading] = useState<{ [key: number]: boolean }>({});
  
  // Modal states
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  // Load Razorpay script
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

  // Handle payment initiation
  const handlePayRent = async () => {
    try {
      const orderData = await createPaymentOrder();
      if (orderData) {
        setCurrentOrderData(orderData);
        // Payment modal will auto-open due to autoTrigger prop
      }
    } catch (error) {
      console.error('Error creating payment order:', error);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    try {
      await verifyPayment(response);
      setCurrentOrderData(null);
      
      // Force refresh the data
      await refresh();
      
      toast.success('Payment completed successfully!');
    } catch (error) {
      console.error('Error verifying payment:', error);
    }
  };

  // Handle payment failure
  const handlePaymentFailure = (error: Error | unknown) => {
    console.error('Payment failed:', error);
    toast.error('Payment failed. Please try again.');
    setCurrentOrderData(null);
  };

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date strings
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status badge based on payment status
  const getStatusBadge = (status: Payment['status']) => {
    const badges = {
      Captured: <Badge className="bg-green-100 text-green-800">Paid</Badge>,
      Pending: <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>,
      Authorized: <Badge className="bg-blue-100 text-blue-800">Authorized</Badge>,
      Failed: <Badge className="bg-red-100 text-red-800">Failed</Badge>,
      Refunded: <Badge className="bg-gray-100 text-gray-800">Refunded</Badge>,
    };
    return badges[status] || <Badge variant="outline">{status}</Badge>;
  };

  // Filter payments based on search and status
  const filteredPayments = useCallback(() => {
    let filtered = payments;
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.id.toString().includes(query) ||
        payment.amount.toString().includes(query) ||
        payment.razorpayPaymentId?.toLowerCase().includes(query) ||
        payment.paymentMethod?.toLowerCase().includes(query) ||
        formatDate(payment.createdAt).toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [payments, statusFilter, searchQuery]);

  // Paginate filtered payments
  const paginatedPayments = useCallback(() => {
    const filtered = filteredPayments();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [filteredPayments, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredPayments().length / itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  // Handle payment details view
  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  // Handle invoice download
  const handleDownloadInvoice = async (payment: Payment) => {
    // Clear any previous invoice errors
    if (invoiceError) {
      clearError();
    }
    
    // Set individual payment downloading state
    setIsDownloading(prev => ({ ...prev, [payment.id]: true }));
    
    try {
      await downloadInvoice(payment);
      // Success toast is handled by the hook
    } catch (error) {
      // Error toast is handled by the hook
      console.error('Failed to download invoice:', error);
    } finally {
      // Clear individual payment downloading state
      setIsDownloading(prev => ({ ...prev, [payment.id]: false }));
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = statusFilter !== 'all' || searchQuery.trim() !== '';

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Complex pagination with ellipsis
      const showLeftEllipsis = currentPage > 3;
      const showRightEllipsis = currentPage < totalPages - 2;

      // Always show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => setCurrentPage(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show left ellipsis
      if (showLeftEllipsis) {
        items.push(
          <PaginationItem key="left-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show right ellipsis
      if (showRightEllipsis) {
        items.push(
          <PaginationItem key="right-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Always show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => setCurrentPage(totalPages)}
              isActive={currentPage === totalPages}
              className="cursor-pointer"
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-green-600 to-emerald-700 rounded-2xl shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-8 py-10">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-12 w-12 rounded-xl bg-white/20" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 bg-white/20" />
              <Skeleton className="h-4 w-32 bg-white/10" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Skeleton className="h-6 w-6 rounded-full bg-white/20 mx-auto mb-2" />
                <Skeleton className="h-3 w-16 bg-white/10 mx-auto mb-1" />
                <Skeleton className="h-5 w-12 bg-white/20 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout navbar={<TenantNavbar />} sidebar={<TenantSidebar />}>
        <div className="w-full space-y-6">
          <LoadingSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout navbar={<TenantNavbar />} sidebar={<TenantSidebar />}>
        <div className="w-full space-y-6">
          {/* Modern Header Section */}
          <div className="relative overflow-hidden bg-gradient-to-r from-primary via-green-600 to-emerald-700 dark:from-primary dark:via-green-500 dark:to-emerald-600 rounded-2xl shadow-2xl mx-6 lg:mx-8">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative px-8 py-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">
                    Rent Payments
                  </h1>
                  <p className="text-green-100 text-base font-medium mt-1">
                    Manage your rent payments and view payment history
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Error Card */}
          <Card className="border-destructive/20 bg-destructive/5 mx-6 lg:mx-8">
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center max-w-md">
                <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-3">Unable to Load Payments</h3>
                <p className="text-muted-foreground mb-6">
                  {error} Please contact support if the issue persists.
                </p>
                <Button variant="outline" onClick={refresh}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      navbar={<TenantNavbar />}
      sidebar={<TenantSidebar />}
    >
      <div className="w-full space-y-6">
        {/* Modern Header Section - Full Width */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary via-green-600 to-emerald-700 dark:from-primary dark:via-green-500 dark:to-emerald-600 rounded-2xl shadow-2xl mx-6 lg:mx-8">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative px-8 py-10">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <div className="space-y-3">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-1">
                      Rent Payments
                    </h1>
                    <p className="text-green-100 text-base font-medium">
                      Manage your rent payments and view payment history
                    </p>
                  </div>
                  
                  {/* Room Information Integrated */}
                  {roomDetails && (
                    <div className="flex flex-wrap items-center gap-6 text-green-200">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm font-medium">{roomDetails.property.name}</span>
                      </div>
                      <div className="w-1 h-1 bg-green-200 rounded-full"></div>
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        <span className="text-sm">Room {roomDetails.roomNo}</span>
                      </div>
                      <div className="w-1 h-1 bg-green-200 rounded-full"></div>
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4" />
                        <span className="text-sm font-semibold">{formatCurrency(parseFloat(roomDetails.rent.toString()))}/month</span>
                      </div>
                      <div className="w-1 h-1 bg-green-200 rounded-full"></div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">{roomDetails.tenants.length} {roomDetails.tenants.length === 1 ? 'Tenant' : 'Tenants'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right side - Status and Member info */}
              <div className="flex flex-col items-end gap-3">
                {roomDetails && stats && (
                  <div className="text-right">
                    <div className="text-xs text-green-200 mb-1 tracking-wider">STATUS</div>
                    <Badge variant="outline" className={`${stats.isOverdue ? 'bg-red-50/20 text-red-100 border-red-300/40' : 'bg-green-50/20 text-green-100 border-green-300/40'} px-4 py-2 text-sm font-medium`}>
                      {stats.isOverdue ? 'Payment Overdue' : 'Current'}
                    </Badge>
                  </div>
                )}
                {roomDetails?.tenants?.[0] && (
                  <div className="text-right">
                    <div className="text-xs text-green-200 mb-1 tracking-wider">TENANT</div>
                    <div className="flex items-center gap-2 text-white">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-semibold">
                        {roomDetails.tenants[0].name || 'Current Tenant'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Stats - Enhanced Grid */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-200 ${stats.isOverdue ? 'border-red-300/40 bg-red-100/10' : ''}`}>
                  <div className="text-center">
                    <Calendar className={`h-6 w-6 mx-auto mb-2 ${stats.isOverdue ? 'text-red-200' : 'text-green-200'}`} />
                    <p className="text-green-100 text-xs mb-1">Next Payment</p>
                    <p className={`font-bold text-lg ${stats.isOverdue ? 'text-red-100' : 'text-white'}`}>
                      {formatCurrency(stats.nextDueAmount)}
                    </p>
                    <p className={`text-xs ${stats.isOverdue ? 'text-red-200' : 'text-green-200'}`}>
                      {stats.isOverdue ? 'Overdue!' : formatDate(stats.nextDueDate)}
                    </p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-200">
                  <div className="text-center">
                    <CheckCircle className="h-6 w-6 text-emerald-200 mx-auto mb-2" />
                    <p className="text-green-100 text-xs mb-1">Total Paid</p>
                    <p className="text-white font-bold text-lg">{formatCurrency(stats.totalPaid)}</p>
                    <p className="text-xs text-green-200">This Year</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-200">
                  <div className="text-center">
                    <Clock className="h-6 w-6 text-orange-200 mx-auto mb-2" />
                    <p className="text-green-100 text-xs mb-1">Pending Amount</p>
                    <p className="text-white font-bold text-lg">{formatCurrency(stats.pendingAmount)}</p>
                    <p className="text-xs text-green-200">Awaiting Payment</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-200">
                  <div className="text-center">
                    <IndianRupee className="h-6 w-6 text-blue-200 mx-auto mb-2" />
                    <p className="text-green-100 text-xs mb-2">Monthly Rent</p>
                    <Button 
                      onClick={handlePayRent}
                      disabled={isCreatingOrder || !roomDetails || stats?.currentMonthPaid}
                      className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm text-xs py-2 h-8"
                      variant="outline"
                      size="sm"
                    >
                      {isCreatingOrder ? (
                        <>
                          <Clock className="mr-1 h-3 w-3 animate-spin" />
                          Processing...
                        </>
                      ) : stats?.currentMonthPaid ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Paid
                        </>
                      ) : (
                        <>
                          <IndianRupee className="mr-1 h-3 w-3" />
                          Pay Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden Razorpay Payment Component - Auto-triggers when currentOrderData is set */}
        {currentOrderData && (
          <div className="hidden">
            <RazorpayPayment
              orderData={currentOrderData}
              userDetails={{
                name: roomDetails?.tenants?.[0]?.name || 'Tenant',
                email: '',
                contact: ''
              }}
              onSuccess={handlePaymentSuccess}
              onFailure={handlePaymentFailure}
              isLoading={isVerifying}
              autoTrigger={true}
            />
          </div>
        )}

        {/* Payment History - Full Screen Width */}
        <div className="mx-6 lg:mx-8">
          <Card className="overflow-hidden shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Receipt className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-xl">Payment History</CardTitle>
                    <CardDescription className="text-sm">Your complete rent payment history</CardDescription>
                  </div>
                </div>
              </div>

              {/* Filters Section */}
              {payments.length > 0 && (
                <div className="border-t border-border/50 pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    {/* Search - Takes 4 columns on md screens */}
                    <div className="relative md:col-span-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by amount, payment ID, or method..."
                        className="pl-10 h-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Status Filter - Takes 3 columns on md screens */}
                    <div className="md:col-span-3">
                      <Select value={statusFilter} onValueChange={(value: PaymentStatus | 'all') => setStatusFilter(value)}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Payments</SelectItem>
                          <SelectItem value="Captured">Completed</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Failed">Failed</SelectItem>
                          <SelectItem value="Refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Actions - Takes 5 columns on md screens */}
                    <div className="flex items-center justify-end gap-3 md:col-span-5">
                      {/* Clear Filters Button */}
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                          className="h-10"
                        >
                          <FilterX className="h-4 w-4 mr-2" />
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {payments.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="bg-muted/50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Receipt className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">No payment history yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Your payment history will appear here once you start making payments.
                  </p>
                  <div className="space-y-3">
                    {roomDetails && !stats?.currentMonthPaid && (
                      <Button onClick={handlePayRent} disabled={isCreatingOrder}>
                        <IndianRupee className="mr-2 h-4 w-4" />
                        Pay Your First Rent
                      </Button>
                    )}
                  </div>
                </div>
              ) : filteredPayments().length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="bg-muted/50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">No payments found</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    No payments match your current filter criteria. Try adjusting your filters.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                  >
                    <FilterX className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Mobile-first responsive design */}
                  <div className="block sm:hidden mb-6">
                    {/* Mobile card layout */}
                    <div className="space-y-4 p-6">
                      {paginatedPayments().map((payment) => (
                        <div key={payment.id} className="bg-muted/30 rounded-lg p-4 space-y-3 border border-border/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(payment.createdAt)}
                            </div>
                            {getStatusBadge(payment.status)}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 font-semibold text-lg">
                              <IndianRupee className="h-4 w-4" />
                              {formatCurrency(payment.amount)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CreditCard className="h-4 w-4" />
                              {payment.paymentMethod || payment.paymentMethodDetails || 'N/A'}
                            </div>
                          </div>
                          {payment.razorpayPaymentId && (
                            <div className="text-xs text-muted-foreground">
                              <span className="font-mono bg-muted px-2 py-1 rounded">
                                TXN: {payment.razorpayPaymentId.slice(-8)}
                              </span>
                            </div>
                          )}
                          {/* Mobile Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(payment)}
                              className="flex-1 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all duration-200"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadInvoice(payment)}
                              disabled={isDownloading[payment.id] || isGenerating}
                              className="flex-1 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all duration-200 disabled:hover:bg-muted disabled:hover:border-border disabled:hover:text-muted-foreground"
                            >
                              {(isDownloading[payment.id] || isGenerating) ? (
                                <Clock className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Download className="h-3 w-3 mr-1" />
                              )}
                              Invoice
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop table layout - Modern Design */}
                  <div className="hidden sm:block w-full mb-6">
                    <div className="bg-card rounded-xl border border-border/40 overflow-hidden shadow-sm">
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow className="hover:bg-transparent border-0 bg-gradient-to-r from-muted/60 to-muted/40">
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground/90 py-5 px-6 w-[120px] border-r border-border/30">
                              Payment ID
                            </TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground/90 py-5 px-6 w-[160px] border-r border-border/30">
                              Date
                            </TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground/90 py-5 px-6 w-[140px] border-r border-border/30 text-right">
                              Amount
                            </TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground/90 py-5 px-6 w-[120px] border-r border-border/30">
                              Status
                            </TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground/90 py-5 px-6 hidden md:table-cell w-[160px] border-r border-border/30">
                              Payment Method
                            </TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground/90 py-5 px-6 hidden lg:table-cell w-[200px] border-r border-border/30">
                              Transaction ID
                            </TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground/90 py-5 px-6 w-[100px] text-center">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedPayments().map((payment, index) => (
                            <TableRow 
                              key={payment.id} 
                              className={`
                                hover:bg-muted/60 transition-all duration-200 border-0 group
                                ${index !== paginatedPayments().length - 1 ? 'border-b border-border/20' : ''}
                              `}
                            >
                              <TableCell className="py-6 px-6 border-r border-border/20 group-hover:border-border/40">
                                <span className="font-mono text-sm font-bold text-foreground">
                                  #{payment.id.toString().padStart(6, '0')}
                                </span>
                              </TableCell>
                              <TableCell className="py-6 px-6 border-r border-border/20 group-hover:border-border/40">
                                <div className="font-semibold text-sm">
                                  {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </div>
                              </TableCell>
                              <TableCell className="py-6 px-6 border-r border-border/20 group-hover:border-border/40 text-right">
                                <div className="font-bold text-lg text-foreground">
                                  ₹{new Intl.NumberFormat('en-IN', {
                                    style: 'decimal',
                                    maximumFractionDigits: 0
                                  }).format(payment.amount)}
                                </div>
                              </TableCell>
                              <TableCell className="py-6 px-6 border-r border-border/20 group-hover:border-border/40">
                                {getStatusBadge(payment.status)}
                              </TableCell>
                              <TableCell className="py-6 px-6 border-r border-border/20 group-hover:border-border/40 hidden md:table-cell">
                                <span className="text-sm font-medium capitalize">
                                  {payment.paymentMethod || payment.paymentMethodDetails || 'Not Available'}
                                </span>
                              </TableCell>
                              <TableCell className="py-6 px-6 border-r border-border/20 group-hover:border-border/40 hidden lg:table-cell">
                                {payment.razorpayPaymentId ? (
                                  <span className="font-mono text-xs font-medium text-foreground bg-muted px-2 py-1 rounded">
                                    {payment.razorpayPaymentId.slice(-8)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell className="py-6 px-6 text-center">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-10 w-10 p-0 rounded-lg hover:bg-green-50 hover:border-green-200 border border-transparent transition-all duration-200 hover:text-green-700"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem 
                                      onClick={() => handleViewDetails(payment)}
                                      className="cursor-pointer hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDownloadInvoice(payment)}
                                      disabled={isDownloading[payment.id] || isGenerating}
                                      className="cursor-pointer hover:bg-green-50 hover:text-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                                    >
                                      {(isDownloading[payment.id] || isGenerating) ? (
                                        <>
                                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                                          Generating...
                                        </>
                                      ) : (
                                        <>
                                          <Download className="mr-2 h-4 w-4" />
                                          Download Invoice
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Pagination Section */}
                  {totalPages > 1 && (
                    <div className="border-t border-border/50 p-6 bg-muted/20">
                      <div className="flex items-center justify-end">
                        <Pagination className="mx-0 w-auto justify-end">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                aria-disabled={currentPage === 1}
                                className={currentPage === 1 ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                              />
                            </PaginationItem>

                            {renderPaginationItems()}

                            <PaginationItem>
                              <PaginationNext
                                onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                                aria-disabled={currentPage === totalPages}
                                className={currentPage === totalPages ? "opacity-50 pointer-events-none" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          isOpen={showPaymentDetails}
          onClose={() => {
            setShowPaymentDetails(false);
            setSelectedPayment(null);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default TenantPayments;
