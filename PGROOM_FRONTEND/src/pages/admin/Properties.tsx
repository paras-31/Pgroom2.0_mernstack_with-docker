import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  MapPin, 
  Building2, 
  Users, 
  Calendar, 
  Plus,
  RefreshCw,
  IndianRupee,
  Phone,
  User,
  Building
} from 'lucide-react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import AdminPropertyCard from '@/components/property/AdminPropertyCard';

// API and types
import { propertyService, locationService } from '@/lib/api/services';
import { AdminProperty } from '@/lib/types/property';
import { isApiSuccessResponse } from '@/lib/types/api';

const AdminProperties = () => {
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  
  // Loading states
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: number]: boolean }>({});

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // API queries using React Query
  const {
    data: propertiesResponse,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-properties', page, limit, debouncedSearchQuery, statusFilter, stateFilter, cityFilter],
    queryFn: () => propertyService.getAdminProperties({
      page,
      limit,
      filters: {
        ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(stateFilter !== 'all' && { state: parseInt(stateFilter) }),
        ...(cityFilter !== 'all' && { city: parseInt(cityFilter) }),
      }
    }),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: statisticsResponse,
    isLoading: isStatisticsLoading
  } = useQuery({
    queryKey: ['property-statistics'],
    queryFn: () => propertyService.getPropertyStatistics(),
    retry: 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch states for filter dropdown
  const {
    data: statesResponse,
    isLoading: isStatesLoading
  } = useQuery({
    queryKey: ['states'],
    queryFn: () => locationService.getStates(),
    retry: 2,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Fetch cities when state filter changes
  const {
    data: citiesResponse,
    isLoading: isCitiesLoading
  } = useQuery({
    queryKey: ['cities', stateFilter],
    queryFn: () => stateFilter !== 'all' ? locationService.getCities(parseInt(stateFilter)) : Promise.resolve({ data: [] }),
    enabled: stateFilter !== 'all',
    retry: 2,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Extract data from API responses
  const properties = propertiesResponse?.data?.data || [];
  const totalPages = propertiesResponse?.data?.meta?.totalPages || 1;
  const statistics = statisticsResponse?.data || {
    totalProperties: 0,
    activeProperties: 0,
    totalRooms: 0,
    monthlyRevenue: 0
  };
  
  // Extract states and cities data
  const states = statesResponse?.data || [];
  const cities = citiesResponse?.data || [];

  // Utility functions
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle image loading
  const handleImageLoad = (propertyId: number) => {
    setImageLoadingStates(prev => ({ ...prev, [propertyId]: false }));
  };

  const handleImageError = (propertyId: number) => {
    setImageLoadingStates(prev => ({ ...prev, [propertyId]: false }));
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setStatusFilter('all');
    setStateFilter('all');
    setCityFilter('all');
    setPage(1);
  };

  // Check if any filters are applied
  const hasActiveFilters = searchQuery || statusFilter !== 'all' || stateFilter !== 'all' || cityFilter !== 'all';

  // Get current page data (now handled by server-side pagination)
  const getCurrentPageData = () => {
    return properties; // API already returns paginated data
  };

  // Generate pagination items
  const renderPaginationItems = useCallback(() => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setPage(i)}
              isActive={page === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => setPage(1)}
            isActive={page === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if needed
      if (page > 3) {
        items.push(
          <PaginationItem key="ellipsis-1">
            <span className="flex h-9 w-9 items-center justify-center">
              <span className="text-gray-400">...</span>
            </span>
          </PaginationItem>
        );
      }

      // Show current page and surrounding pages
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setPage(i)}
              isActive={page === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis if needed
      if (page < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-2">
            <span className="flex h-9 w-9 items-center justify-center">
              <span className="text-gray-400">...</span>
            </span>
          </PaginationItem>
        );
      }

      // Always show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => setPage(totalPages)}
              isActive={page === totalPages}
              className="cursor-pointer"
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  }, [page, totalPages]);

  // Summary stats from API (global stats, not just current page)
  const totalProperties = statistics.totalProperties;
  const activeProperties = statistics.activeProperties;
  const totalRooms = statistics.totalRooms;
  const totalOccupied = statistics.occupiedRooms || 0;
  const totalRevenue = statistics.monthlyRevenue;

  return (
    <DashboardLayout
      navbar={<AdminNavbar />}
      sidebar={<AdminSidebar />}
    >
      <div className="w-full max-w-[98%] mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Properties Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Monitor and manage all properties across the platform
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search properties, owners, or addresses..."
                className="pl-10 w-full sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>

              {/* State Filter */}
              <Select
                value={stateFilter}
                onValueChange={(value) => {
                  setStateFilter(value);
                  // Reset city filter when state changes
                  setCityFilter('all');
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {isStatesLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    states.map(state => (
                      <SelectItem key={state.id} value={state.id.toString()}>
                        {state.stateName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {/* City Filter */}
              <Select
                value={cityFilter}
                onValueChange={(value) => {
                  setCityFilter(value);
                  setPage(1);
                }}
                disabled={stateFilter === 'all'}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {stateFilter === 'all' ? (
                    <SelectItem value="select-state" disabled>Select a state first</SelectItem>
                  ) : isCitiesLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : cities.length === 0 ? (
                    <SelectItem value="no-cities" disabled>No cities available</SelectItem>
                  ) : (
                    cities.map(city => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.cityName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {/* Reset Filters Button */}
              {hasActiveFilters && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleResetFilters}
                        className="h-10 w-10"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear all filters</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Properties</p>
                  <p className="text-2xl font-bold">{isStatisticsLoading ? '...' : totalProperties}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Properties</p>
                  <p className="text-2xl font-bold">{isStatisticsLoading ? '...' : activeProperties}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Rooms</p>
                  <p className="text-2xl font-bold">{isStatisticsLoading ? '...' : totalRooms}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <IndianRupee className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">{isStatisticsLoading ? '...' : formatCurrency(totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Content */}
        {isLoading ? (
          // Loading State
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="relative">
                  <Skeleton className="w-full h-48" />
                </div>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : properties.length === 0 ? (
          // Empty State
          <Card className="border-dashed border-2 border-muted-foreground/20">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters ? 'No properties match your current filters' : 'No properties available in the system'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={handleResetFilters}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <>
            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {getCurrentPageData().map((property) => (
                <AdminPropertyCard
                  key={property.id}
                  property={property}
                  onImageLoad={() => handleImageLoad(property.id)}
                  onImageError={() => handleImageError(property.id)}
                  isImageLoading={imageLoadingStates[property.id] !== false}
                  getStatusBadgeColor={getStatusBadgeColor}
                />
              ))}
            </div>

            {/* Pagination Info */}
            <div className="flex justify-between items-center mt-8 mb-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {Math.min((page - 1) * limit + 1, properties.length)} to {Math.min(page * limit, properties.length)} of {propertiesResponse?.data?.meta?.total || 0} results
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {page} of {totalPages}
              </p>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="my-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      aria-disabled={page === 1}
                      tabIndex={page === 1 ? -1 : 0}
                      className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {renderPaginationItems()}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      aria-disabled={page === totalPages}
                      tabIndex={page === totalPages ? -1 : 0}
                      className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminProperties;
