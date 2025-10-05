import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Loader2,
  MapPin,
  User,
  UserPlus,
  X,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import AssignTenantDialog from '@/components/tenant/AssignTenantDialog';
import TenantFormDialog from '@/components/tenant/TenantFormDialog';
import { useLocation, City } from '@/contexts/LocationContext';
import { tenantService, TenantUser, TenantListResponse } from '@/lib/api/services/tenantService';

// Layout components
import OwnerNavbar from '@/components/owner/OwnerNavbar';
import OwnerSidebar from '@/components/owner/OwnerSidebar';
import DashboardLayout from '@/components/layouts/DashboardLayout';

// UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';


/**
 * Tenants - Owner's tenant management page
 *
 * This page allows property owners to view and manage tenants.
 */
const Tenants: React.FC = () => {
  // State for pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // State for location filters
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [stateCities, setStateCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  // State for tenant assignment dialog
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantUser | null>(null);

  // State for add tenant dialog
  const [isAddTenantDialogOpen, setIsAddTenantDialogOpen] = useState(false);

  // State for status filter
  type StatusFilter = 'Active' | 'Invited';
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Active');

  // Use the real location context
  const { states, loadCities } = useLocation();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Reset to first page when search changes
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle state change
  const handleStateChange = async (value: string) => {
    const stateId = value === '0' ? null : Number(value);
    setSelectedStateId(stateId);
    setSelectedCityId(null);
    setStateCities([]);

    if (stateId) {
      setIsLoadingCities(true);
      const cities = await loadCities(stateId);
      setStateCities(cities);
      setIsLoadingCities(false);
    }
  };

  // Handle city change
  const handleCityChange = (value: string) => {
    setSelectedCityId(value === '0' ? null : Number(value));
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSelectedStateId(null);
    setSelectedCityId(null);
    setStateCities([]);
    setStatusFilter('Active'); // Reset to default 'Active' status
    setPage(1);

    // Fetch data with reset filters
    // This will be triggered by the useEffect that depends on the filters
  };

  // State for tenant data
  const [tenantsData, setTenantsData] = useState<TenantListResponse>({
    data: [],
    meta: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Fetch tenants data
  const fetchTenants = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await tenantService.getTenants({
        page,
        limit,
        filters: {
          search: debouncedSearchQuery,
          state: selectedStateId || undefined,
          city: selectedCityId || undefined,
          status: statusFilter
        }
      });

      if (response.statusCode === 200 && response.data) {
        setTenantsData(response.data);
        setTotalPages(response.data.meta.totalPages);
      } else {
        setIsError(true);
        toast.error(response.message || 'Failed to fetch tenants');
      }
    } catch (error) {
      setIsError(true);
      toast.error('An error occurred while fetching tenants');
      console.error('Error fetching tenants:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearchQuery, selectedStateId, selectedCityId, statusFilter]);

  // Fetch tenants when filters change
  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  // Generate pagination items
  const renderPaginationItems = useCallback(() => {
    const items = [];

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          isActive={page === 1}
          onClick={() => {
            if (page !== 1) {
              setPage(1);
              // fetchTenants will be triggered by the useEffect that depends on page
            }
          }}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if there are more than 5 pages and we're not at the beginning
    if (totalPages > 5 && page > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show current page and surrounding pages
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last page as they're always shown
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={page === i}
            onClick={() => {
              if (page !== i) {
                setPage(i);
                // fetchTenants will be triggered by the useEffect that depends on page
              }
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if there are more than 5 pages and we're not at the end
    if (totalPages > 5 && page < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            isActive={page === totalPages}
            onClick={() => {
              if (page !== totalPages) {
                setPage(totalPages);
                // fetchTenants will be triggered by the useEffect that depends on page
              }
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  }, [page, totalPages]);

  // Helper function to render location based on available data
  const renderLocation = (user: TenantUser['user']) => {
    // If we have state and city objects with names from the API
    if (user.state?.stateName && user.city?.cityName) {
      return `${user.state.stateName}, ${user.city.cityName}`;
    }

    // If we have stateId and cityId, try to find the names from our location context
    if (user.stateId) {
      const state = states.find(s => s.id === user.stateId);
      const stateName = state?.stateName || 'Unknown State';

      if (user.cityId) {
        // Try to find city from our loaded cities
        let cityName = 'Unknown City';
        if (stateCities.length > 0) {
          const city = stateCities.find(c => c.id === user.cityId);
          if (city) cityName = city.cityName;
        }
        return `${stateName}, ${cityName}`;
      }

      return stateName;
    }

    // Fallback
    return 'Location not available';
  };

  // Helper function to render status badge
  const renderStatusBadge = (status?: string) => {
    if (!status) return null;

    switch (status) {
      case 'Active':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 font-medium"
          >
            <span className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-green-500"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Active
            </span>
          </Badge>
        );
      case 'Inactive':
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 font-medium"
          >
            Inactive
          </Badge>
        );
      case 'Invited':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800 font-medium"
          >
            <span className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-yellow-500"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
              </span>
              Invited
            </span>
          </Badge>
        );
      default:
        return null;
    }
  };



  // Handle assign tenant
  const handleAssignTenant = (tenant: TenantUser) => {
    setSelectedTenant(tenant);
    setIsAssignDialogOpen(true);
  };

  return (
    <DashboardLayout
      navbar={<OwnerNavbar />}
      sidebar={<OwnerSidebar />}
    >
      <div className="w-full max-w-[98%] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Tenant Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your tenants and assign them to properties
            </p>
          </div>

          <Button
            className="whitespace-nowrap flex-shrink-0 shadow-sm hover:shadow transition-all"
            disabled={isLoading}
            onClick={() => setIsAddTenantDialogOpen(true)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Tenant
              </>
            )}
          </Button>
        </div>

        {/* Tenant Management Details Card */}
        <Card className="mb-8 border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Tenant Details
            </CardTitle>
            <CardDescription>
              Manage your tenants, view their details, and assign them to properties and rooms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Quick Actions</h3>
                  <p className="text-sm text-muted-foreground">
                    Use the filters above to find tenants by name, status, or location.
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Tenant Assignment</h3>
                  <p className="text-sm text-muted-foreground">
                    Click the "Assign" button to assign a tenant to a specific property and room.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters Card */}
        <Card className="mb-6 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search - Takes 3 columns on md screens */}
              <div className="relative md:col-span-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, email, mobile, or location"
                  className="pl-10 w-full transition-all duration-200 focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filters - Takes 6 columns on md screens */}
              <div className="flex flex-wrap gap-3 md:col-span-6">
                {/* Status Filter */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 flex items-center justify-center">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusFilter === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${statusFilter === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    </span>
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={(value: StatusFilter) => setStatusFilter(value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="pl-10 w-[150px] h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Invited">Invited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* State Filter */}
                <div className="relative flex-1 min-w-[150px]">
                  <Select
                    value={selectedStateId ? String(selectedStateId) : '0'}
                    onValueChange={handleStateChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-10">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Select state" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">All States</SelectItem>
                      {states.map(state => (
                        <SelectItem key={state.id} value={String(state.id)}>
                          {state.stateName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City Filter */}
                <div className="relative flex-1 min-w-[150px]">
                  <Select
                    value={selectedCityId ? String(selectedCityId) : '0'}
                    onValueChange={handleCityChange}
                    disabled={isLoading || !selectedStateId || stateCities.length === 0 || isLoadingCities}
                  >
                    <SelectTrigger className="h-10">
                      {isLoadingCities ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin text-muted-foreground" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <SelectValue placeholder={!selectedStateId ? "Select state first" : stateCities.length === 0 ? "No cities" : "Select city"} />
                        </div>
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">All Cities</SelectItem>
                      {stateCities.map(city => (
                        <SelectItem key={city.id} value={String(city.id)}>
                          {city.cityName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Actions - Takes 3 columns on md screens */}
              <div className="flex items-center justify-end gap-3 md:col-span-3">
                {/* Reset Filters Button - Only show when filters are applied */}
                {(selectedStateId || selectedCityId || searchQuery || statusFilter !== 'Active') && (
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
                        <p>Reset all filters</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Items per page */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Show:</span>
                  <Select
                    value={String(limit)}
                    onValueChange={(value) => {
                      setLimit(Number(value));
                      setPage(1); // Reset to first page when changing limit
                    }}
                  >
                    <SelectTrigger className="w-[80px] h-10">
                      <SelectValue placeholder={String(limit)} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tenants Section Title and Counter */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Tenants</h2>
              {/* Status indicator badge */}
              <span className={`text-xs px-2 py-1 rounded-full ${
                statusFilter === "Active"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
              }`}>
                {statusFilter}
              </span>
            </div>

            {/* Total Tenants Counter */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Total Tenants:</span>
              {isLoading ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium">
                  {tenantsData?.meta?.total || 0}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tenants Table */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/50 border-b border-border">
                  <TableHead className="font-medium text-foreground">Name</TableHead>
                  <TableHead className="font-medium text-foreground">Email</TableHead>
                  <TableHead className="font-medium text-foreground">Phone</TableHead>
                  <TableHead className="font-medium text-foreground">Location</TableHead>
                  <TableHead className="font-medium text-foreground">Status</TableHead>
                  <TableHead className="text-right font-medium text-foreground">Assign</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: limit }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`} className="animate-pulse bg-card">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-6 w-[140px]" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-9 w-[70px] ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  // Error state
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium">Failed to load tenants</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please try again or contact support</p>
                        <Button variant="outline" className="mt-4" onClick={fetchTenants}>
                          Try Again
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : tenantsData?.data.length === 0 ? (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-lg font-medium text-foreground">No tenants found</p>
                        <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or add a new tenant</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => handleResetFilters()}
                        >
                          Reset Filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Data rows
                  tenantsData?.data.map((tenant) => (
                    <TableRow
                      key={tenant.id}
                      className="group hover:bg-muted/50 transition-colors duration-200 bg-card"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {tenant.user.profileImage ? (
                            <img
                              src={tenant.user.profileImage}
                              alt={`${tenant.user.firstName} ${tenant.user.lastName}`}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium">
                                {tenant.user.firstName.charAt(0).toUpperCase()}{tenant.user.lastName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="font-medium text-foreground">
                            {tenant.user.firstName} {tenant.user.lastName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${tenant.user.email}`}
                          className="text-foreground/80 hover:text-primary hover:underline transition-colors"
                        >
                          {tenant.user.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        {tenant.user.mobileNo ? (
                          <a
                            href={`tel:${tenant.user.mobileNo}`}
                            className="text-foreground/80 hover:text-primary hover:underline transition-colors"
                          >
                            {tenant.user.mobileNo}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Not available</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-1.5 flex-shrink-0" />
                          <span className="text-foreground/80">{renderLocation(tenant.user)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderStatusBadge(tenant.user.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAssignTenant(tenant)}
                        >
                          Assign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Pagination - Only show if total count is more than the current limit */}
        {!isLoading && !isError && tenantsData?.data.length > 0 && tenantsData?.meta?.total > limit && (
          <div className="flex justify-center mt-6 mb-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => {
                      if (page > 1) {
                        setPage(p => p - 1);
                        // fetchTenants will be triggered by the useEffect that depends on page
                      }
                    }}
                    aria-disabled={page === 1}
                    className={page === 1 ? "opacity-50 pointer-events-none" : "hover:bg-primary/5"}
                  />
                </PaginationItem>

                {renderPaginationItems()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => {
                      if (page < totalPages) {
                        setPage(p => p + 1);
                        // fetchTenants will be triggered by the useEffect that depends on page
                      }
                    }}
                    aria-disabled={page === totalPages}
                    className={page === totalPages ? "opacity-50 pointer-events-none" : "hover:bg-primary/5"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Tenant Assignment Dialog */}
      <AssignTenantDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        tenant={selectedTenant}
        onSuccess={() => {
          // Refresh the tenant list after successful assignment
          fetchTenants();
        }}
      />

      {/* Add New Tenant Dialog */}
      <TenantFormDialog
        isOpen={isAddTenantDialogOpen}
        onClose={() => setIsAddTenantDialogOpen(false)}
        onSuccess={() => {
          // Refresh the tenant list after successful addition
          fetchTenants();
          // Switch to the "Invited" status filter to show the newly added tenant
          setStatusFilter('Invited');
        }}
      />
    </DashboardLayout>
  );
};

// Custom PaginationEllipsis component with key prop
interface PaginationEllipsisProps {
  key?: string | number;
}

const PaginationEllipsis: React.FC<PaginationEllipsisProps> = () => (
  <span className="flex h-9 w-9 items-center justify-center">
    <span className="text-gray-400">...</span>
  </span>
);

export default Tenants;
