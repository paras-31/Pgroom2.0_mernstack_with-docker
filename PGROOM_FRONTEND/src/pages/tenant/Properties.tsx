import React, { useState, useEffect, useCallback } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2, MapPin, Filter, RefreshCw } from 'lucide-react';
import { useLocation, State, City } from '@/contexts/LocationContext';

// Layout components
import TenantNavbar from '@/components/tenant/TenantNavbar';
import TenantSidebar from '@/components/tenant/TenantSidebar';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Property components
import TenantPropertyCard from '@/components/property/TenantPropertyCard';
import PropertyCardSkeleton from '@/components/property/PropertyCardSkeleton';

// API and types
import { propertyService } from '@/lib/api/services';
import { Property } from '@/lib/types/property';
import { isApiSuccessResponse } from '@/lib/types/api';

/**
 * TenantProperties - Tenant's property browsing page
 *
 * This page allows tenants to browse available properties and rooms for potential rental.
 * Enhanced with same UI design as owner properties module.
 */
const TenantProperties: React.FC = () => {
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

  // Get location data
  const { states, getCitiesByStateId, loadCities } = useLocation();

  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Reset to first page when search changes
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Invalidate query when limit changes
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['tenant-properties'] });
  }, [limit, queryClient]);

  // Load cities when state changes
  useEffect(() => {
    if (selectedStateId) {
      setIsLoadingCities(true);
      setSelectedCityId(null); // Reset city selection when state changes

      // First check if we already have the cities for this state
      const existingCities = getCitiesByStateId(selectedStateId);
      if (existingCities && existingCities.length > 0) {
        setStateCities(existingCities);
        setIsLoadingCities(false);
      } else {
        // Load cities from API
        loadCities(selectedStateId)
          .then((cities) => {
            setStateCities(cities);
          })
          .catch((error) => {
            console.error('Error loading cities:', error);
            setStateCities([]);
          })
          .finally(() => {
            setIsLoadingCities(false);
          });
      }
    } else {
      setStateCities([]);
      setSelectedCityId(null);
    }
  }, [selectedStateId, getCitiesByStateId, loadCities]);

  // Build filters object
  const buildFilters = useCallback(() => {
    const filters: Record<string, string | number> = {};

    if (debouncedSearchQuery) {
      filters.search = debouncedSearchQuery;
    }

    if (selectedStateId) {
      filters.stateId = selectedStateId;
    }

    if (selectedCityId) {
      filters.cityId = selectedCityId;
    }

    // Only show active properties to tenants
    filters.status = 'Active';

    return filters;
  }, [debouncedSearchQuery, selectedStateId, selectedCityId]);

  // Fetch properties for tenants - using same query structure as owner module
  const { data: propertiesData, isLoading, error, refetch } = useQuery({
    queryKey: ['tenant-properties', page, limit, debouncedSearchQuery, selectedStateId, selectedCityId],
    queryFn: async () => {
      const filters = buildFilters();

      const response = await propertyService.getProperties({
        page,
        limit,
        filters: Object.keys(filters).length > 0 ? filters : undefined
      });

      if (isApiSuccessResponse(response)) {
        setTotalPages(response.data.meta.totalPages);
        return response.data;
      }

      throw new Error(response.message || 'Failed to fetch properties');
    }
  });

  // Handle state change
  const handleStateChange = (value: string) => {
    const stateId = value === "0" ? null : Number(value);
    setSelectedStateId(stateId);
    setPage(1); // Reset to first page when changing state
  };

  // Handle city change
  const handleCityChange = (value: string) => {
    const cityId = value === "0" ? null : Number(value);
    setSelectedCityId(cityId);
    setPage(1); // Reset to first page when changing city
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setSelectedStateId(null);
    setSelectedCityId(null);
    setSearchQuery('');
    setDebouncedSearchQuery(''); // Also reset the debounced search query for immediate effect
    setPage(1);
  };

  // Generate pagination items
  const renderPaginationItems = useCallback(() => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than or equal to max visible
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
      // Complex pagination with ellipsis
      const showLeftEllipsis = page > 3;
      const showRightEllipsis = page < totalPages - 2;

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

      // Show left ellipsis
      if (showLeftEllipsis) {
        items.push(
          <PaginationItem key="left-ellipsis">
            <span className="flex h-9 w-9 items-center justify-center">
              <span className="text-gray-400">...</span>
            </span>
          </PaginationItem>
        );
      }

      // Show pages around current page
      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(totalPages - 1, page + 1);

      for (let i = startPage; i <= endPage; i++) {
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

      // Show right ellipsis
      if (showRightEllipsis) {
        items.push(
          <PaginationItem key="right-ellipsis">
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

  return (
    <DashboardLayout
      navbar={<TenantNavbar />}
      sidebar={<TenantSidebar />}
    >
      <div className="w-full max-w-[98%] mx-auto">
        {/* Header Section - Matching owner properties style */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Browse Properties
          </h1>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by property name, address, or location"
                className="pl-10 w-full sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {/* State Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                <Select
                  value={selectedStateId ? String(selectedStateId) : "0"}
                  onValueChange={handleStateChange}
                >
                  <SelectTrigger className="pl-10 w-[200px]">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All States</SelectItem>
                    {states.map((state: State) => (
                      <SelectItem key={state.id} value={String(state.id)}>
                        {state.stateName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                <Select
                  value={selectedCityId ? String(selectedCityId) : "0"}
                  onValueChange={handleCityChange}
                  disabled={!selectedStateId || isLoadingCities}
                >
                  <SelectTrigger className="pl-10 w-[200px]">
                    <SelectValue placeholder={
                      !selectedStateId 
                        ? "Select State First" 
                        : isLoadingCities 
                          ? "Loading..." 
                          : "Select City"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Cities</SelectItem>
                    {stateCities.map((city: City) => (
                      <SelectItem key={city.id} value={String(city.id)}>
                        {city.cityName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Filters Button - Only show when filters are applied */}
              {(selectedStateId || selectedCityId || searchQuery) && (
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
                    {[10, 20, 30, 40, 50, 60].filter(value => {
                      const totalCount = propertiesData?.meta.total || 10;
                      // Always show at least the 10 option
                      if (value === 10) return true;
                      // Show options up to the next increment above the total count
                      // For example, if total is 25, show options up to 30
                      return value <= Math.ceil(totalCount / 10) * 10;
                    }).map(value => (
                      <SelectItem key={value} value={String(value)}>
                        {value}{value === 10 ? ' (Default)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <>
            {/* Skeleton Loading State */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {Array(8).fill(0).map((_, index) => (
                <PropertyCardSkeleton key={index} />
              ))}
            </div>
          </>
        ) : error ? (
          <div className="flex justify-center items-center h-64 text-center">
            <div>
              <p className="text-red-500 mb-2">Failed to load properties</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {error instanceof Error ? error.message : 'An unknown error occurred'}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['tenant-properties'] })}
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : propertiesData?.data.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-center">
            <h3 className="text-xl font-semibold mb-2">No properties found</h3>
            {debouncedSearchQuery || selectedStateId || selectedCityId ? (
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No properties match your filter criteria
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                There are no properties available at the moment
              </p>
            )}
            {(debouncedSearchQuery || selectedStateId || selectedCityId) && (
              <Button 
                variant="outline" 
                onClick={handleResetFilters}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Property Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {propertiesData?.data.map((property) => (
                <TenantPropertyCard
                  key={property.id}
                  property={property}
                />
              ))}
            </div>

            {/* Pagination Info */}
            <div className="flex justify-between items-center mt-4 mb-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Records: {propertiesData?.meta.total || 0}
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
                      className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>

                  {renderPaginationItems()}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      aria-disabled={page === totalPages}
                      tabIndex={page === totalPages ? -1 : 0}
                      className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
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

export default TenantProperties;